const express = require("express");
const {
    createVehicle,
    updateVehicle,
    deleteVehicle,
    getVehicle,
    getAllVehicles,
    getVehiclesByLocation
} = require("../controllers/vehicle");

const router = express.Router();

// Create
router.post("/", createVehicle);

// Update
router.put("/:id", updateVehicle);

// Delete
router.delete("/:id", deleteVehicle);

// Get
router.get("/find/:id", getVehicle);

// Get all
router.get("/", getAllVehicles);

// Get by location
router.get("/location/:location", getVehiclesByLocation);

module.exports = router; 