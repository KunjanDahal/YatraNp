const express = require('express');
const { 
  initiateKhaltiPayment, 
  verifyKhaltiPayment,
  getPaymentStatus
} = require('../controllers/paymentController');
const { userMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// Khalti payment routes
router.post('/khalti/initiate', userMiddleware, initiateKhaltiPayment);
router.get('/khalti/verify', verifyKhaltiPayment);
router.get('/status/:reservation_id', userMiddleware, getPaymentStatus);

module.exports = router; 