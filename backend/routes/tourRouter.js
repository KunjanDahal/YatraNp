const express = require("express");
const tourController = require("../controllers/tourController");
const tourCustomForm = require("../controllers/tourCustomFormController");
const tourReservation = require("../controllers/tourReservstionController");
const tourReviewController = require("../controllers/tourReviewController");

//define route handler
const router = express.Router();

// Analytics routes for dashboard - must be placed before generic routes
router.get("/count", tourController.getTourCount);
router.get("/bookings/monthly", tourController.getMonthlyBookings);

// Tour Review routes
router.get("/reviews/check-collection", tourReviewController.checkCollectionExists);
router.get("/reviews/ratings", tourReviewController.getAllToursRatings);
router.get("/reviews/:tourId", tourReviewController.getTourReviews);
router.post("/reviews/:tourId", tourReviewController.createReview);
router.patch("/reviews/update/:reviewId", tourReviewController.updateReview);
router.delete("/reviews/delete/:reviewId", tourReviewController.deleteReview);

//custom form routes
router.post("/customform", tourCustomForm.createForm);
router.get("/customform/all", tourCustomForm.getAllForms);
router.patch("/customform/:id", tourCustomForm.updateForm);
router.delete("/customform/:id", tourCustomForm.deleteForm);
router.post("/customform/respond/:id", tourCustomForm.respondToForm);

//reserve form
router.put("/tourReservations", tourReservation.getAllReservations);
router.post("/tourReservations", tourReservation.bookTour);

//tour routes - more generic routes should be at the end
router.post("/", tourController.createTour);
router.get("/", tourController.getAllTours);

router.get("/:id", tourController.getTour);
router.patch("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

module.exports = router;