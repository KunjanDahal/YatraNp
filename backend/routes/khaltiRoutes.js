const express = require('express');
const { 
  testKhalti,
  initiatePayment, 
  verifyPayment 
} = require('../controllers/khaltiController');
const { debugAuthMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Debug middleware for all routes
router.use(debugAuthMiddleware);

// Test route
router.get('/test', testKhalti);

// Payment routes
router.post('/initiate', initiatePayment);
router.post('/verify', verifyPayment);

module.exports = router; 