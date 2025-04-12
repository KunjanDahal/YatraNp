const Restaurant = require("../models/Restaurant");

// Create a new restaurant
const createRestaurant = async (req, res) => {
    try {
        console.log("Received restaurant creation request with data:", req.body);
        
        // Check if all required fields are present
        const requiredFields = ['name', 'restaurantType', 'staffAmount', 'qualification', 'capacity', 'regNo', 'city', 'Address', 'contactNo', 'priceRange', 'uploadResimage', 'uploadRegimage'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields);
            return res.status(400).json({ 
                success: false,
                message: `Missing required fields: ${missingFields.join(', ')}` 
            });
        }
        
        try {
            // Create the restaurant with the request body
            const newRestaurant = new Restaurant(req.body);
            
            console.log("Attempting to save restaurant:", newRestaurant);
            const savedRestaurant = await newRestaurant.save();
            console.log("Restaurant saved successfully");
            
            // Send a simple success response without requiring authentication
            return res.status(200).json({ 
                success: true, 
                message: "Restaurant created successfully",
                restaurant: savedRestaurant
            });
        } catch (saveError) {
            console.error("Error saving restaurant:", saveError);
            
            // Check for duplicate key error (e.g., regNo must be unique)
            if (saveError.code === 11000) {
                return res.status(400).json({
                    success: false,
                    message: "A restaurant with this registration number already exists",
                    error: saveError.message
                });
            }
            
            // Handle validation errors
            if (saveError.name === 'ValidationError') {
                const validationErrors = Object.values(saveError.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: validationErrors
                });
            }
            
            throw saveError; // Rethrow to be caught by the outer catch
        }
    } catch (err) {
        console.error("Error in createRestaurant:", err);
        return res.status(500).json({ 
            success: false, 
            message: "An unexpected error occurred while creating the restaurant",
            error: err.message
        });
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