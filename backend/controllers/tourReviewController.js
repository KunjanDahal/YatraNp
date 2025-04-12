const TourReview = require("../models/tourReview");
const mongoose = require("mongoose");

// Get all reviews for a specific tour
const getTourReviews = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    // Validate tourId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid tour ID format",
      });
    }
    
    const reviews = await TourReview.find({ tourId }).sort("-createdAt");
    
    // Calculate average rating
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }
    
    res.status(200).json({
      status: "success",
      results: reviews.length,
      data: {
        reviews,
        averageRating,
        count: reviews.length
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Check if collection exists
const checkCollectionExists = async (req, res) => {
  try {
    // Get list of all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    // Find if tourreviews collection exists
    const collectionExists = collections.some(
      coll => coll.name === 'tourreviews'
    );
    
    res.status(200).json({
      status: "success",
      data: {
        collectionExists,
        allCollections: collections.map(c => c.name)
      }
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Create a new review with enhanced error handling
const createReview = async (req, res) => {
  try {
    const { tourId } = req.params;
    const { userId, userName, userEmail, rating, comment } = req.body;
    
    // Validate required fields
    if (!tourId || !userId || !userName || !userEmail || !rating || !comment) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }
    
    // Validate tourId
    if (!mongoose.Types.ObjectId.isValid(tourId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid tour ID format",
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        status: "error",
        message: "Rating must be between 1 and 5",
      });
    }
    
    // Check if user has already reviewed this tour
    const existingReview = await TourReview.findOne({ tourId, userEmail });
    if (existingReview) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this tour",
      });
    }
    
    // Create new review
    const newReview = new TourReview({
      tourId,
      userId,
      userName,
      userEmail,
      rating,
      comment,
    });
    
    const savedReview = await newReview.save();
    
    // Get updated average rating
    const reviews = await TourReview.find({ tourId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    res.status(201).json({
      status: "success",
      data: {
        review: savedReview,
        averageRating,
        count: reviews.length
      },
    });
  } catch (err) {
    // Handle duplicate key error (user already reviewed this tour)
    if (err.code === 11000) {
      return res.status(400).json({
        status: "error",
        message: "You have already reviewed this tour",
      });
    }
    
    res.status(500).json({
      status: "error",
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

// Update a review
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, userEmail } = req.body;
    
    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid review ID format",
      });
    }
    
    // Find the review
    const review = await TourReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }
    
    // Check if the user is the owner of the review
    if (review.userEmail !== userEmail) {
      return res.status(403).json({
        status: "error",
        message: "You can only update your own reviews",
      });
    }
    
    // Update the review
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    
    const updatedReview = await review.save();
    
    // Get updated average rating
    const tourId = review.tourId;
    const reviews = await TourReview.find({ tourId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    res.status(200).json({
      status: "success",
      data: {
        review: updatedReview,
        averageRating,
        count: reviews.length
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Delete a review
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userEmail } = req.body;
    
    // Validate reviewId
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid review ID format",
      });
    }
    
    // Find the review
    const review = await TourReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        status: "error",
        message: "Review not found",
      });
    }
    
    // Check if the user is the owner of the review
    if (review.userEmail !== userEmail) {
      return res.status(403).json({
        status: "error",
        message: "You can only delete your own reviews",
      });
    }
    
    // Store the tourId before deleting
    const tourId = review.tourId;
    
    // Delete the review
    await TourReview.findByIdAndDelete(reviewId);
    
    // Get updated average rating
    const reviews = await TourReview.find({ tourId });
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = (totalRating / reviews.length).toFixed(1);
    }
    
    res.status(200).json({
      status: "success",
      data: {
        averageRating,
        count: reviews.length
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// Get all tours with their ratings (for the service card component)
const getAllToursRatings = async (req, res) => {
  try {
    const reviews = await TourReview.aggregate([
      {
        $group: {
          _id: "$tourId",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to a more usable format
    const ratingsMap = {};
    reviews.forEach(item => {
      ratingsMap[item._id] = {
        rating: item.averageRating.toFixed(1),
        count: item.count
      };
    });
    
    res.status(200).json({
      status: "success",
      data: ratingsMap
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

module.exports = {
  getTourReviews,
  createReview,
  updateReview,
  deleteReview,
  getAllToursRatings,
  checkCollectionExists
}; 