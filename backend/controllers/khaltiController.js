const axios = require('axios');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');

dotenv.config();

// Khalti configuration - You MUST register as a merchant at test-admin.khalti.com
// to get your own valid secret key. The keys below won't work without registration.
const KHALTI_CONFIG = {
  // Replace with your actual secret key from test-admin.khalti.com after registration
  secretKey: '83889c16f9344af7997cb298b8130eaf',
  // Replace with your actual public key from test-admin.khalti.com after registration
  publicKey: '5c5cdfda40a24d8496469fc2421a1101',
  baseUrl: 'https://dev.khalti.com/api/v2' // Sandbox environment URL
};

console.log('Khalti Controller loaded with config:', {
  baseUrl: KHALTI_CONFIG.baseUrl,
  publicKeyFirstChars: KHALTI_CONFIG.publicKey.substring(0, 10) + '...',
  secretKeyFirstChars: KHALTI_CONFIG.secretKey.substring(0, 10) + '...'
});

// Test route function to check if Khalti controller is working
const testKhalti = (req, res) => {
  console.log('Khalti test route accessed');
  return res.status(200).json({
    success: true,
    message: 'Khalti controller is functioning properly',
    config: {
      baseUrl: KHALTI_CONFIG.baseUrl,
      publicKeyPrefix: KHALTI_CONFIG.publicKey.substring(0, 10) + '...',
    }
  });
};

// Initialize payment with Khalti
const initiatePayment = async (req, res) => {
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
      product_details: product_details || [{
        identity: purchase_order_id,
        name: purchase_order_name,
        total_price: amount,
        quantity: 1,
        unit_price: amount
      }],
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
      // Make request to Khalti API - IMPORTANT: Note the Authorization header format
      // Khalti requires lowercase 'key' not 'Key'
      const headers = {
        'Authorization': `key ${KHALTI_CONFIG.secretKey}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Using Auth Header:', headers.Authorization.substring(0, 15) + '...');
      
      const response = await axios.post(
        `${KHALTI_CONFIG.baseUrl}/epayment/initiate/`, 
        payload,
        { headers }
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
      
      if (khaltiError.response) {
        console.error('Khalti API error status code:', khaltiError.response.status);
        console.error('Khalti API error response:', khaltiError.response.data);
        
        // Check for specific error types
        if (khaltiError.response.status === 401) {
          return res.status(500).json({
            success: false,
            message: 'Authentication failed with Khalti payment gateway',
            error: 'Invalid API credentials. Please check your API keys.'
          });
        }
      }
      
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
const verifyPayment = async (req, res) => {
  try {
    const { pidx } = req.body;

    console.log('Verifying payment with pidx:', pidx);

    if (!pidx) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment index (pidx)'
      });
    }

    // Make request to Khalti API to verify payment - fixing the header format
    const response = await axios.post(
      `${KHALTI_CONFIG.baseUrl}/epayment/lookup/`, 
      { pidx },
      {
        headers: {
          'Authorization': `key ${KHALTI_CONFIG.secretKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Khalti verification response:', response.data);

    // Find payment record in database
    const payment = await Payment.findOne({
      'metadata.pidx': pidx
    });

    if (!payment) {
      console.log('Payment record not found for pidx:', pidx);
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
      console.log('Payment record updated:', payment._id);
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

module.exports = {
  testKhalti,
  initiatePayment,
  verifyPayment
}; 