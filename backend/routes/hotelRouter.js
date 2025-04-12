const express = require("express");
const hotelReservation = require("../controllers/hotelReservationController");
const userMiddleware = require("../middlewares/userMiddleware");

// Define route handler
const router = express.Router();

// Hotel reservation routes
router.get("/hotelReservations", hotelReservation.getAllReservations);
router.put("/hotelReservations/:id/approve", hotelReservation.approveReservation);
router.put("/hotelReservations/:id/decline", hotelReservation.declineReservation);
router.get("/myreservations", userMiddleware, hotelReservation.getMyReservations);

module.exports = router; 