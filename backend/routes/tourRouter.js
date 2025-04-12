const express = require("express");
const tourController = require("../controllers/tourController");
const tourCustomForm = require("../controllers/tourCustomFormController");
const tourReservation = require("../controllers/tourReservstionController");
const tourReviewController = require("../controllers/tourReviewController");

//define route handler
const router = express.Router();

//tour routes
router
  .route("/")
  .post(tourController.createTour)
  .get(tourController.getAllTours);

router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

//custom form routes
router.route("/customform").post(tourCustomForm.createForm);
router.route("/customform/all").get(tourCustomForm.getAllForms);
router.route("/customform/:id").patch(tourCustomForm.updateForm).delete(tourCustomForm.deleteForm);
router.route("/customform/respond/:id").post(tourCustomForm.respondToForm);

// Tour Review routes
router.route("/reviews/check-collection").get(tourReviewController.checkCollectionExists);
router.route("/reviews/ratings").get(tourReviewController.getAllToursRatings);
router.route("/reviews/:tourId").get(tourReviewController.getTourReviews);
router.route("/reviews/:tourId").post(tourReviewController.createReview);
router.route("/reviews/update/:reviewId").patch(tourReviewController.updateReview);
router.route("/reviews/delete/:reviewId").delete(tourReviewController.deleteReview);

// router.route("/tt").post(tourReservation.getAllReservations);
//reserve form
router
  .route("/tourReservations")
  .put(tourReservation.getAllReservations)
  .post(tourReservation.bookTour);

module.exports = router;