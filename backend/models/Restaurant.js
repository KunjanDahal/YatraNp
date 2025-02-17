const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    staffAmount: {
        type: String,
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    capacity: {
        type: String,
        required: true
    },
    regNo: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true
    },
    Address: {
        type: String,
        required: true
    },
    contactNo: {
        type: String,
        required: true
    },
    priceRange: {
        type: String,
        required: true
    },
    uploadResimage: {
        type: String,
        required: true
    },
    uploadRegimage: {
        type: String,
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Restaurant", RestaurantSchema); 