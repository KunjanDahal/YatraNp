const express = require("express");
const restaurantReservation = require("../controllers/restaurantReservationController");

// Define route handler
const router = express.Router();

// Restaurant reservation routes
router.get("/restaurantReservations", restaurantReservation.getAllReservations);
router.post("/restaurantReservations", restaurantReservation.createReservation);
router.put("/restaurantReservations/:id/approve", restaurantReservation.approveReservation);
router.put("/restaurantReservations/:id/decline", restaurantReservation.declineReservation);

// Analytics routes for dashboard
router.get("/bookings/monthly", require("../controllers/restaurant").getMonthlyBookings);

module.exports = router; 