const express = require("express");
const restaurantReservation = require("../controllers/restaurantReservationController");

// Define route handler
const router = express.Router();

// Restaurant reservation routes
router.get("/restaurantReservations", restaurantReservation.getAllReservations);
router.put("/restaurantReservations/:id/approve", restaurantReservation.approveReservation);
router.put("/restaurantReservations/:id/decline", restaurantReservation.declineReservation);

module.exports = router; 