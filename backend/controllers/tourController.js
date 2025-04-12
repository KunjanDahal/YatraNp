const Tour = require("../models/tours");
const multer = require("multer");
const path = require("path");
const TourBooking = require("../models/tourBook");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Not an image! Please upload only images.'), false);
    }
  }
}).single('file');

//Route Handlers
//create tour
const createTour = async (req, res) => {
  try {
    console.log("Received tour creation request with body:", req.body);
    
    upload(req, res, async (err) => {
      if (err) {
        console.error("File upload error:", err);
        return res.status(400).json({
          status: "Unsuccess",
          message: err.message
        });
      }

      console.log("File uploaded successfully:", req.file);
      
      // Validate required fields
      const requiredFields = ['currentUser', 'name', 'category', 'price', 'groupCount', 'languages', 'duration', 'cities', 'description', 'introduction'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        console.error("Missing required fields:", missingFields);
        return res.status(400).json({
          status: "Unsuccess",
          message: `Missing required fields: ${missingFields.join(', ')}`
        });
      }

      try {
        // Create tour data object with all fields
        const tourData = {
          currentUser: req.body.currentUser,
          name: req.body.name,
          category: req.body.category,
          price: Number(req.body.price),
          groupCount: Number(req.body.groupCount),
          languages: req.body.languages,
          duration: req.body.duration,
          cities: req.body.cities,
          description: req.body.description,
          introduction: req.body.introduction,
          img: req.file ? req.file.filename : null
        };

        if (!tourData.img) {
          console.error("Tour image is required but missing");
          return res.status(400).json({
            status: "Unsuccess",
            message: "Tour image is required"
          });
        }

        console.log("Creating new tour with data:", tourData);
        const newTour = new Tour(tourData);
        
        console.log("Attempting to save tour to database...");
        const savedTour = await newTour.save();
        console.log("Tour saved successfully with ID:", savedTour._id);
        
        return res.status(200).json({
          status: "Success",
          message: "Tour Adding successful",
          data: savedTour
        });
      } catch (dbError) {
        console.error("Database error while saving tour:", dbError);
        return res.status(500).json({
          status: "Error",
          message: "Failed to save tour to database",
          error: dbError.message
        });
      }
    });
  } catch (err) {
    console.error("Error in createTour:", err);
    return res.status(400).json({
      status: "Unsuccess",
      message: err.message,
    });
  }
};

//getAll tour list
const getAllTours = async (req, res) => {
  try {
    const allTours = await Tour.find();
    res.status(200).send(allTours);
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

//find tour by id
const getTour = async (req, res) => {
  try {
    const uID = req.params.id;

    const oneTour = await Tour.findById(uID);
    res.status(200).json({
      status: "Success",
      data: {
        oneTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

//update a tour
const updateTour = async (req, res) => {
  try {
    const uID = req.params.id;
    const updatedTour = await Tour.findByIdAndUpdate(uID, req.body, {
      new: true,
    });

    res.status(200).json({
      status: "Success",
      data: {
        tour: updatedTour,
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

//delete a tour
const deleteTour = async (req, res) => {
  try {
    const UID = req.params.id;
    const deletedTour = await Tour.findByIdAndDelete(UID);

    res.status(204).json({
      status: "Success",
      data: {
        old: deletedTour,
        tour: "Null",
      },
    });
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Get count of tours for dashboard
const getTourCount = async (req, res) => {
  try {
    const count = await Tour.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting tour count:", err);
    res.status(500).json({ message: "Error getting tour count", error: err.message });
  }
};

// Get monthly tour bookings for dashboard
const getMonthlyBookings = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ];

    const bookings = await TourBooking.aggregate(pipeline);
    
    // Transform data to include month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = bookings.map(booking => ({
      month: months[booking._id.month - 1],
      year: booking._id.year,
      count: booking.count
    }));
    
    res.status(200).json(result);
  } catch (err) {
    console.error("Error getting monthly bookings:", err);
    res.status(500).json({ message: "Error getting monthly bookings", error: err.message });
  }
};

module.exports = {
  createTour,
  updateTour,
  getAllTours,
  getTour,
  deleteTour,
  getTourCount,
  getMonthlyBookings
};
