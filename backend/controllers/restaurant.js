const Restaurant = require("../models/Restaurant");

// Create a new restaurant
const createRestaurant = async (req, res) => {
    try {
        const newRestaurant = new Restaurant({
            ...req.body
        });

        await newRestaurant.save();
        res.status(200).json(newRestaurant);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
    try {
        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        res.status(200).json(updatedRestaurant);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Delete restaurant
const deleteRestaurant = async (req, res) => {
    try {
        await Restaurant.findByIdAndDelete(req.params.id);
        res.status(200).json("Restaurant has been deleted.");
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get restaurant by ID
const getRestaurant = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        res.status(200).json(restaurant);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get all restaurants
const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json(restaurants);
    } catch (err) {
        res.status(500).json(err);
    }
};

// Get restaurants by city
const getRestaurantsByCity = async (req, res) => {
    const city = req.params.city;
    try {
        const restaurants = await Restaurant.find({ city: city });
        res.status(200).json(restaurants);
    } catch (err) {
        res.status(500).json(err);
    }
};

module.exports = {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurant,
    getAllRestaurants,
    getRestaurantsByCity
}; 