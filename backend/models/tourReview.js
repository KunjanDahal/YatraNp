const mongoose = require("mongoose");

const tourReviewSchema = new mongoose.Schema(
  {
    tourId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

// Create a compound index to ensure a user can only review a tour once
tourReviewSchema.index({ tourId: 1, userEmail: 1 }, { unique: true });

module.exports = mongoose.model("TourReview", tourReviewSchema); 