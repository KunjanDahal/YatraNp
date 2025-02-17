const express = require("express");
const {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurant,
    getAllRestaurants,
    getRestaurantsByCity
} = require("../controllers/restaurant");

const router = express.Router();

// Create
router.post("/", createRestaurant);

// Update
router.put("/:id", updateRestaurant);

// Delete
router.delete("/:id", deleteRestaurant);

// Get
router.get("/find/:id", getRestaurant);

// Get all
router.get("/", getAllRestaurants);

// Get by city
router.get("/city/:city", getRestaurantsByCity);

module.exports = router; 