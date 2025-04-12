const mongoose = require("mongoose");

// Create a schema for restaurant reservations
const restaurantReservationSchema = new mongoose.Schema({
  restaurantId: {
    type: String,
    required: true
  },
  restaurantName: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: String,
  reservationDate: {
    type: Date,
    required: true
  },
  guests: {
    type: Number,
    required: true,
    min: 1
  },
  notes: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "DECLINED"],
    default: "PENDING"
  }
}, { timestamps: true });

// Create model if it doesn't exist yet
let RestaurantReservation;
try {
  RestaurantReservation = mongoose.model("RestaurantReservation");
} catch {
  RestaurantReservation = mongoose.model("RestaurantReservation", restaurantReservationSchema);
}

const getAllReservations = async (req, res) => {
  try {
    const allReservations = await RestaurantReservation.find();
    console.log("Restaurant reservations found:", allReservations);
    
    // If no reservations exist, create a sample one for testing
    if (allReservations.length === 0) {
      console.log("No restaurant reservations found, creating a sample one");
      const sampleReservation = new RestaurantReservation({
        userName: "Sarah Parker",
        reservationDate: new Date(),
        guests: 4,
        phone: "1122334455",
        status: "PENDING"
      });
      
      await sampleReservation.save();
      console.log("Sample restaurant reservation created");
      const updatedReservations = await RestaurantReservation.find();
      res.status(200).send(updatedReservations);
    } else {
      res.status(200).send(allReservations);
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Approve a restaurant reservation
const approveReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedReservation = await RestaurantReservation.findByIdAndUpdate(
      id,
      { status: "APPROVED" },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reservation approved successfully",
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Decline a restaurant reservation
const declineReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedReservation = await RestaurantReservation.findByIdAndUpdate(
      id,
      { status: "DECLINED" },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reservation declined successfully",
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Create a new restaurant reservation
const createReservation = async (req, res) => {
  try {
    console.log("Creating restaurant reservation with data:", req.body);
    
    // Extract data from request body
    const {
      restaurantId,
      restaurantName,
      userId,
      userName,
      userEmail,
      userPhone,
      date,
      time,
      guests,
      notes
    } = req.body;
    
    // Validate required fields
    if (!restaurantId || !userName || !date || !time || !guests) {
      return res.status(400).json({
        status: "unsuccess",
        message: "Missing required fields for reservation",
      });
    }
    
    // Parse date and time to create a proper date object
    const reservationDateTime = new Date(`${date}T${time}`);
    
    // Create reservation document
    const newReservation = new RestaurantReservation({
      restaurantId,
      restaurantName,
      userId,
      userName,
      userEmail,
      userPhone,
      reservationDate: reservationDateTime,
      guests: parseInt(guests),
      notes,
      status: "PENDING"
    });
    
    // Save to database
    const savedReservation = await newReservation.save();
    console.log("Restaurant reservation created successfully:", savedReservation);
    
    res.status(201).json({
      status: "success",
      message: "Restaurant reservation created successfully",
      data: {
        reservation: savedReservation,
      },
    });
  } catch (err) {
    console.log("Error creating reservation:", err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = { 
  getAllReservations,
  createReservation,
  approveReservation,
  declineReservation
}; 