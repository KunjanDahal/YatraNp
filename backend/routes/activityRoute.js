const express = require('express');
const { createActivity, getPendingActivities, getActivity, deleteActivity, approveActivity, getApprovedActivities, declineActivity, filterActivities, getMyActivities } = require('../controllers/activityController.js');

const router = express.Router();

const {
    userMiddleware,
    organizerMiddleware,
    adminMiddleware,
    eventManagementMiddleware
} = require('../middleware/authMiddleware.js');

// Public routes
router.get('/approved', getApprovedActivities);
router.get('/filter', userMiddleware, filterActivities);

// Admin-only routes
router.post('/', adminMiddleware, createActivity);
router.get('/pending', adminMiddleware, getPendingActivities);
router.put('/approve/:id', adminMiddleware, approveActivity);
router.put('/decline/:id', adminMiddleware, declineActivity);
router.delete('/:id', adminMiddleware, deleteActivity);

// Event organizer specific routes
router.get('/myActivities', organizerMiddleware, getMyActivities);

// These routes should come last to avoid conflicts with other routes
router.get('/:id', userMiddleware, getActivity);

module.exports = router;
