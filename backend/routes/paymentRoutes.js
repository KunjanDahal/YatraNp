const express = require('express');
const { 
  initiateKhaltiPayment, 
  verifyKhaltiPayment, 
  getPaymentStatus 
} = require('../controllers/paymentController');
const { userMiddleware, debugAuthMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Add debug middleware to all routes
router.use(debugAuthMiddleware);

// Khalti payment routes - using debug middleware to trace issues
router.post('/khalti/initiate', debugAuthMiddleware, initiateKhaltiPayment); 
router.post('/khalti/verify', debugAuthMiddleware, verifyKhaltiPayment);
router.get('/status/:id', debugAuthMiddleware, userMiddleware, getPaymentStatus);

module.exports = router; 