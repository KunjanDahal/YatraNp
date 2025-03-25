const express = require("express");
const vehicleReservation = require("../controllers/vehicleReservationController");

// Define route handler
const router = express.Router();

// Vehicle reservation routes
router.get("/vehicleReservations", vehicleReservation.getAllReservations);
router.put("/vehicleReservations/:id/approve", vehicleReservation.approveReservation);
router.put("/vehicleReservations/:id/decline", vehicleReservation.declineReservation);

module.exports = router; 