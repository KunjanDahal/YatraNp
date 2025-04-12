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

// Approve vehicle
router.put("/:id/approve", async (req, res) => {
    try {
        const vehicle = await require('../models/Vehicle').findByIdAndUpdate(
            req.params.id,
            { isAccepted: true },
            { new: true }
        );
        if (!vehicle) {
            return res.status(404).json({ message: "Vehicle not found" });
        }
        return res.status(200).json({ message: "Vehicle approved successfully", vehicle });
    } catch (err) {
        console.error("Error approving vehicle:", err);
        return res.status(500).json({ message: "Failed to approve vehicle", error: err.message });
    }
});

// Delete
router.delete("/:id", deleteVehicle);

// Get
router.get("/find/:id", getVehicle);

// Get all
router.get("/", getAllVehicles);

// Get by location
router.get("/location/:location", getVehiclesByLocation);

module.exports = router; 