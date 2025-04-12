const axios = require('axios');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');

dotenv.config();

// Khalti configuration - using appropriate values from env vars
const KHALTI_CONFIG = {
  secretKey: process.env.VITE_KHALTI_LIVE_SECRET_KEY || 'test_secret_key_f59e8b7d18b4499ca40f68195a846e9b',
  publicKey: process.env.VITE_KHALTI_LIVE_PUBLIC_KEY || 'test_public_key_dc74e0fd57cb46cd93832aee0a390234',
  baseUrl: 'https://a.khalti.com/api/v2',
  mockMode: process.env.MOCK_KHALTI === 'true'
};

// Create a pre-configured axios instance for Khalti API calls
const khaltiClient = axios.create({
  baseURL: KHALTI_CONFIG.baseUrl,
  headers: {
    'Authorization': `Key ${KHALTI_CONFIG.secretKey}`,
    'Content-Type': 'application/json'
  }
});

console.log('Khalti Controller loaded with config:', {
  baseUrl: KHALTI_CONFIG.baseUrl,
  mockMode: KHALTI_CONFIG.mockMode ? 'Enabled' : 'Disabled',
  publicKeyPrefix: KHALTI_CONFIG.publicKey.substring(0, 10) + '...'
});

// Initialize payment with Khalti
const initiatePayment = async (paymentData) => {
  try {
    // Log the raw payment data for debugging
    console.log('Raw payment data received:', JSON.stringify(paymentData, null, 2));
    
    // Validate required fields
    const {
      amount,
      purchase_order_id,
      purchase_order_name,
      customer_info,
      return_url,
      website_url
    } = paymentData;

    if (!amount || !purchase_order_id || !purchase_order_name) {
      throw new Error('Missing required payment information');
    }

    // Create payment payload
    const payload = {
      return_url: return_url || 'http://localhost:3000/payment/success',
      website_url: website_url || 'http://localhost:3000',
      amount: parseInt(amount),
      purchase_order_id,
      purchase_order_name,
      customer_info: customer_info || {
        name: 'Customer',
        email: 'customer@example.com',
        phone: '9800000000'
      }
    };

    console.log('Initiating Khalti payment with payload:', JSON.stringify(payload, null, 2));

    // Check if mock mode is enabled
    if (KHALTI_CONFIG.mockMode) {
      console.log('Using MOCK mode for Khalti payment');
      
      // Create a mock response
      const mockResponse = {
        pidx: `mock_${Date.now()}`,
        payment_url: `https://mock-khalti.com/pay/${Date.now()}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'Pending'
      };
      
      // Save payment record to database
      try {
        await savePaymentRecord(purchase_order_id, amount, mockResponse.pidx, mockResponse.payment_url, true);
      } catch (dbError) {
        console.error('Error saving mock payment to database:', dbError);
        // Continue even if DB save fails
      }
      
      return {
        success: true,
        ...mockResponse,
        message: 'Payment initiated successfully (MOCK MODE)'
      };
    }
    
    // Make actual request to Khalti API
    try {
      const response = await khaltiClient.post('/epayment/initiate/', payload);
      console.log('Khalti API response:', response.data);
      
      // Save payment record to database
      try {
        await savePaymentRecord(purchase_order_id, amount, response.data.pidx, response.data.payment_url);
      } catch (dbError) {
        console.error('Error saving payment to database:', dbError);
        // Continue even if DB save fails
      }
      
      return {
        success: true,
        ...response.data,
        message: 'Payment initiated successfully'
      };
    } catch (apiError) {
      console.error('Khalti API Error:', apiError.message);
      if (apiError.response) {
        console.error('Status:', apiError.response.status);
        console.error('Data:', JSON.stringify(apiError.response.data, null, 2));
      }
      throw new Error(apiError.response?.data?.detail || apiError.response?.data?.error || 'Error communicating with Khalti API');
    }
  } catch (error) {
    console.error('Khalti payment initiation error:', error);
    
    // Extract the most useful error message
    const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         error.message || 
                         'Unknown error occurred';
                         
    throw new Error(errorMessage);
  }
};

// Verify payment with Khalti
const verifyPayment = async (verificationData) => {
  try {
    const { pidx } = verificationData;

    if (!pidx) {
      throw new Error('Missing payment index (pidx)');
    }

    console.log('Verifying Khalti payment with pidx:', pidx);
    
    // Check if this is a mock payment
    if (KHALTI_CONFIG.mockMode || pidx.startsWith('mock_')) {
      console.log('Using MOCK mode for payment verification');
      
      // Create mock verification response
      const mockResponse = {
        pidx,
        total_amount: 1000,
        status: 'Completed',
        transaction_id: `mock_txn_${Date.now()}`,
        purchase_order_id: 'mock_order',
        purchase_order_name: 'Mock Product'
      };
      
      // Update payment record
      try {
        await updatePaymentRecord(pidx, mockResponse);
      } catch (dbError) {
        console.error('Error updating mock payment record:', dbError);
      }
      
      return {
        success: true,
        data: mockResponse,
        message: 'Payment verification completed (MOCK MODE)'
      };
    }
    
    // Make actual request to Khalti API
    const response = await khaltiClient.post('/epayment/lookup/', { pidx });
    
    console.log('Khalti verification response:', response.data);
    
    // Update payment record
    try {
      await updatePaymentRecord(pidx, response.data);
    } catch (dbError) {
      console.error('Error updating payment record:', dbError);
    }
    
    return {
      success: true,
      data: response.data,
      message: 'Payment verification completed'
    };
  } catch (error) {
    console.error('Khalti payment verification error:', error);
    
    const errorMessage = error.response?.data?.detail || 
                         error.response?.data?.error || 
                         error.message || 
                         'Unknown error occurred';
                         
    throw new Error(errorMessage);
  }
};

// Helper function to save payment record
async function savePaymentRecord(orderId, amount, pidx, paymentUrl, isMock = false) {
  const payment = new Payment({
    orderId,
    amount: parseInt(amount) / 100, // Store in NPR (not paisa)
    status: 'INITIATED',
    paymentMethod: 'khalti',
    metadata: {
      pidx,
      payment_url: paymentUrl,
      isMock
    }
  });

  await payment.save();
  console.log('Payment record created with ID:', payment._id);
  return payment;
}

// Helper function to update payment record
async function updatePaymentRecord(pidx, paymentData) {
  const payment = await Payment.findOne({
    'metadata.pidx': pidx
  });

  if (!payment) {
    console.log('Payment record not found for pidx:', pidx);
    return null;
  }
  
  // Update payment record if payment is completed
  if (paymentData.status === 'Completed') {
    payment.status = 'COMPLETED';
    payment.transactionId = paymentData.transaction_id;
    payment.completedAt = new Date();
    payment.metadata = {
      ...payment.metadata,
      ...paymentData
    };
    await payment.save();
    console.log('Payment record updated:', payment._id);
  }
  
  return payment;
}

// Test route function to check if Khalti controller is working
const testKhalti = () => {
  return {
    success: true,
    message: 'Khalti controller is functioning properly',
    config: {
      baseUrl: KHALTI_CONFIG.baseUrl,
      mockMode: KHALTI_CONFIG.mockMode,
      publicKeyPrefix: KHALTI_CONFIG.publicKey.substring(0, 10) + '...'
    },
    testCredentials: {
      phone: '9800000000',
      mpin: '1111',
      otp: '987654'
    }
  };
};

module.exports = {
  testKhalti,
  initiatePayment,
  verifyPayment
}; 