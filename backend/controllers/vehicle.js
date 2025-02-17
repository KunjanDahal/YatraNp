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
                return res.status(500).json({ message: err.message });
            }

            const vehicleData = {
                ...req.body,
                vehicleMainImg: req.files.vehicleMainImg[0].filename,
                vehicleImgs: req.files.vehicleImgs.map(file => file.filename),
                insuranceImgs: req.files.insuranceImgs.map(file => file.filename)
            };

            const newVehicle = new Vehicle(vehicleData);
            await newVehicle.save();
            res.status(200).json(newVehicle);
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        const vehicle = await Vehicle.findById(req.params.id);
        res.status(200).json(vehicle);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all vehicles
const getAllVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.status(200).json(vehicles);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get vehicles by location
const getVehiclesByLocation = async (req, res) => {
    const location = req.params.location;
    try {
        const vehicles = await Vehicle.find({ location: location });
        res.status(200).json(vehicles);
    } catch (err) {
        res.status(500).json(err);
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