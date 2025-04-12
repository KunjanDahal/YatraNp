const Vehicle = require("../models/Vehicle");
const multer = require("multer");
const path = require("path");

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
}).fields([
    { name: 'vehicleMainImg', maxCount: 1 },
    { name: 'vehicleImgs', maxCount: 10 },
    { name: 'insuranceImgs', maxCount: 5 }
]);

// Create a new vehicle
const createVehicle = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                console.error("Upload error:", err);
                return res.status(500).json({ message: err.message });
            }

            try {
                const vehicleData = {
                    ...req.body,
                    vehicleMainImg: req.files.vehicleMainImg[0].filename,
                    vehicleImgs: req.files.vehicleImgs.map(file => file.filename),
                    insuranceImgs: req.files.insuranceImgs.map(file => file.filename)
                };

                console.log("Creating new vehicle:", vehicleData.vehicleNumber);
                const newVehicle = new Vehicle(vehicleData);
                await newVehicle.save();
                console.log("Vehicle created successfully:", newVehicle._id);
                return res.status(200).json(newVehicle);
            } catch (saveErr) {
                // Check for duplicate key error
                if (saveErr.code === 11000) {
                    console.error("Duplicate vehicle number:", saveErr);
                    return res.status(400).json({ 
                        message: "Vehicle with this number already exists", 
                        field: "vehicleNumber",
                        error: saveErr.message 
                    });
                }
                console.error("Error saving vehicle:", saveErr);
                return res.status(500).json({ message: saveErr.message });
            }
        });
    } catch (err) {
        console.error("Unexpected error:", err);
        return res.status(500).json({ message: err.message });
    }
};

// Update vehicle
const updateVehicle = async (req, res) => {
    try {
        const updatedVehicle = await Vehicle.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedVehicle);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
    try {
        await Vehicle.findByIdAndDelete(req.params.id);
        res.status(200).json("Vehicle has been deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get vehicle by ID
const getVehicle = async (req, res) => {
    try {
        console.log(`Fetching vehicle with ID: ${req.params.id}`);
        const vehicle = await Vehicle.findById(req.params.id);
        
        if (!vehicle) {
            console.log(`Vehicle with ID ${req.params.id} not found`);
            return res.status(404).json({ message: "Vehicle not found" });
        }
        
        console.log("Vehicle found:", vehicle._id);
        return res.status(200).json(vehicle);
    } catch (err) {
        console.error(`Error fetching vehicle ${req.params.id}:`, err);
        return res.status(500).json({ message: "Failed to fetch vehicle", error: err.message });
    }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
    try {
        console.log("Fetching all vehicles");
        const vehicles = await Vehicle.find();
        console.log(`Found ${vehicles.length} vehicles`);
        return res.status(200).json(vehicles);
    } catch (err) {
        console.error("Error fetching vehicles:", err);
        return res.status(500).json({ message: "Failed to fetch vehicles", error: err.message });
    }
};

// Get vehicles by location
const getVehiclesByLocation = async (req, res) => {
    const location = req.params.location;
    try {
        console.log(`Searching for vehicles in location: ${location}`);
        const vehicles = await Vehicle.find({ location: location });
        console.log(`Found ${vehicles.length} vehicles in ${location}`);
        return res.status(200).json(vehicles);
    } catch (err) {
        console.error(`Error finding vehicles in ${location}:`, err);
        return res.status(500).json({ message: "Failed to fetch vehicles by location", error: err.message });
    }
};

module.exports = {
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
    getAllVehicles,
    getVehiclesByLocation
}; 