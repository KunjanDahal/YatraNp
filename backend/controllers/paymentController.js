const axios = require('axios');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');

dotenv.config();

// Khalti configuration with hardcoded test values
const KHALTI_CONFIG = {
  secretKey: 'test_secret_key_f59e8b7d18b4499ca40f68195a846e9b',
  publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a390234',
  baseUrl: 'https://a.khalti.com/api/v2' // Sandbox environment
};

console.log('Using Khalti config:', {
  baseUrl: KHALTI_CONFIG.baseUrl,
  publicKeyFirstChars: KHALTI_CONFIG.publicKey.substring(0, 10) + '...',
  secretKeyFirstChars: KHALTI_CONFIG.secretKey.substring(0, 10) + '...'
});

// Initialize payment with Khalti
const initiateKhaltiPayment = async (req, res) => {
  try {
    const {
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      product_details,
      return_url,
      website_url
    } = req.body;

    console.log('Payment initiation request received:', {
      amount,
      purchase_order_id,
      purchase_order_name
    });

    if (!amount || !purchase_order_id || !purchase_order_name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    // Create payment payload for Khalti
    const payload = {
      return_url: return_url || `${req.protocol}://${req.get('host')}/payment/success`,
      website_url: website_url || `${req.protocol}://${req.get('host')}`,
      amount: amount,
      purchase_order_id: purchase_order_id,
      purchase_order_name: purchase_order_name,
      customer_info: customer_info || {
        name: 'Customer',
        email: 'customer@example.com',
        phone: '9800000000'
      },
      product_details: product_details || 'Product payment',
      amount_breakdown: [
        {
          label: purchase_order_name,
          amount: amount
        }
      ],
      product_url: `${req.protocol}://${req.get('host')}`
    };

    console.log('Sending request to Khalti with payload:', payload);

    try {
      // Make request to Khalti API
      const response = await axios.post(
        `${KHALTI_CONFIG.baseUrl}/epayment/initiate/`, 
        payload,
        {
          headers: {
            'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Received response from Khalti:', response.data);

      // Create payment record in database
      const payment = new Payment({
        orderId: purchase_order_id,
        amount: amount / 100, // Store in NPR (not paisa)
        status: 'INITIATED',
        paymentMethod: 'khalti',
        metadata: {
          pidx: response.data.pidx,
          payment_url: response.data.payment_url
        },
        // Store user ID if available, otherwise store as null
        user: req.user ? req.user._id : null
      });

      await payment.save();
      console.log('Payment record created with ID:', payment._id);

      // Return success response
      return res.status(200).json({
        success: true,
        payment_url: response.data.payment_url,
        pidx: response.data.pidx,
        message: 'Payment initiated successfully'
      });
    } catch (khaltiError) {
      console.error('Khalti API error:', khaltiError);
      console.error('Khalti API error response:', khaltiError.response?.data);
      
      // Handle Khalti API-specific errors
      return res.status(500).json({
        success: false,
        message: 'Failed to initiate payment with Khalti',
        error: khaltiError.response?.data?.detail || khaltiError.response?.data?.error || khaltiError.message
      });
    }
  } catch (error) {
    console.error('Khalti payment initiation error:', error.message);
    console.error('Full error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.message
    });
  }
};

// Verify payment with Khalti
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment index (pidx)'
      });
    }

    // Make request to Khalti API to verify payment
    const response = await axios.post(
      `${KHALTI_CONFIG.baseUrl}/epayment/lookup/`, 
      { pidx },
      {
        headers: {
          'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Find payment record in database
    const payment = await Payment.findOne({
      'metadata.pidx': pidx
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }

    // Update payment record
    if (response.data.status === 'Completed') {
      payment.status = 'COMPLETED';
      payment.transactionId = response.data.transaction_id;
      payment.completedAt = new Date();
      payment.metadata = {
        ...payment.metadata,
        ...response.data
      };
      await payment.save();
    }

    // Return success response
    return res.status(200).json({
      success: true,
      data: response.data,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('Khalti payment verification error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.response?.data?.detail || error.message
    });
  }
};

// Get payment status
const getPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    // Find payment record
    const payment = await Payment.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Return payment data
    return res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Get payment status error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to get payment status',
      error: error.message
    });
  }
};

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getPaymentStatus
}; 