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
// New public endpoint - no middleware required
router.get('/public', getApprovedActivities);
// Special public endpoint to get all activities (for testing purposes)
router.get('/all-public', async (req, res) => {
  try {
    const SpecialActivity = require('../models/SpecialActivityModel.js');
    const activities = await SpecialActivity.find({}).lean();
    res.status(200).json({ 
      success: true, 
      activities: activities 
    });
  } catch (error) {
    console.error('Error fetching all activities:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching activities' 
    });
  }
});

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
