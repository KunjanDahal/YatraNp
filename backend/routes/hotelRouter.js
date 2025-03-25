const express = require("express");
const hotelReservation = require("../controllers/hotelReservationController");

// Define route handler
const router = express.Router();

// Hotel reservation routes
router.get("/hotelReservations", hotelReservation.getAllReservations);
router.put("/hotelReservations/:id/approve", hotelReservation.approveReservation);
router.put("/hotelReservations/:id/decline", hotelReservation.declineReservation);

module.exports = router; 