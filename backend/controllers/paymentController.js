const axios = require('axios');
const dotenv = require('dotenv');
const Payment = require('../models/Payment');
const Hotel = require('../models/Hotel');
const hotelReservation = require('../models/hotelReservationModel');

dotenv.config();

// Environment variables for Khalti (replace these with your actual keys)
const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY || '35652de6273d4a77843e4e8acf563dd0'; // Change this to your real key
const KHALTI_PUBLIC_KEY = process.env.KHALTI_PUBLIC_KEY || '18e8a8026d0b4ab68f9a36593d07e593'; // Change this to your real key
const KHALTI_API_URL = process.env.NODE_ENV === 'production' ? 'https://khalti.com/api/v2' : 'https://dev.khalti.com/api/v2'; // Use production URL in production

console.log('Using Khalti config:', {
  baseUrl: KHALTI_API_URL,
  publicKeyFirstChars: KHALTI_PUBLIC_KEY.substring(0, 10) + '...',
  secretKeyFirstChars: KHALTI_SECRET_KEY.substring(0, 10) + '...'
});

// Initialize payment with Khalti
const initiateKhaltiPayment = async (req, res) => {
  try {
    const { 
      hotelId, 
      hotelName, 
      checkInDate, 
      checkOutDate, 
      userName,
      totalPrice,
      totalDays,
      rooms,
      email,
      phone 
    } = req.body;

    // Ensure price is valid (minimum 10 Rs = 1000 paisa)
    const amountInPaisa = Math.max(totalPrice * 100, 1000);
    
    // Create a unique order ID (purchase_order_id)
    const purchaseOrderId = `hotel_${hotelId}_${Date.now()}`;
    
    // Prepare the payload for Khalti
    const payload = {
      return_url: `${req.protocol}://${req.get('host')}/api/payment/khalti/verify`,
      website_url: `${req.protocol}://${req.get('host')}`,
      amount: amountInPaisa,
      purchase_order_id: purchaseOrderId,
      purchase_order_name: `Hotel Booking: ${hotelName}`,
      customer_info: {
        name: userName,
        email: email || 'guest@example.com',
        phone: phone || '9800000000'
      },
      amount_breakdown: [
        {
          label: "Hotel Booking",
          amount: amountInPaisa
        }
      ],
      product_details: [
        {
          identity: hotelId,
          name: hotelName,
          total_price: amountInPaisa,
          quantity: 1,
          unit_price: amountInPaisa
        }
      ]
    };

    // Save the transaction data for verification later
    // We'll create a reservation with pending status
    const newReservation = new hotelReservation({
      hotelName,
      checkInDate,
      checkOutDate,
      userName,
      totalPrice,
      totalDays,
      paymentStatus: 'pending',
      paymentMethod: 'Khalti',
      purchaseOrderId,
      rooms: rooms || []
    });
    
    await newReservation.save();

    // Make request to Khalti API
    const response = await axios.post(
      `${KHALTI_API_URL}/epayment/initiate/`, 
      payload,
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Return payment URL to frontend
    return res.status(200).json({
      success: true,
      payment_url: `https://pay.khalti.com/${response.data.pidx}`,
      pidx: response.data.pidx,
      reservation_id: newReservation._id
    });

  } catch (error) {
    console.error('Khalti payment initiation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate payment',
      error: error.response?.data || error.message
    });
  }
};

// Verify Khalti payment after user is redirected back
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, purchase_order_id, status } = req.query;

    // If user canceled, redirect to booking page with error
    if (status === 'User canceled') {
      return res.redirect(`/hotelhome?payment=canceled`);
    }

    // Verify payment status with Khalti
    const verificationResponse = await axios.post(
      `${KHALTI_API_URL}/epayment/lookup/`,
      { pidx },
      {
        headers: {
          'Authorization': `Key ${KHALTI_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Find reservation by purchase_order_id
    const reservationId = purchase_order_id?.split('_')?.[1];
    const reservation = await hotelReservation.findOne({ purchaseOrderId: purchase_order_id });

    if (!reservation) {
      return res.redirect(`/hotelhome?payment=not_found`);
    }

    // Update reservation based on payment status
    if (verificationResponse.data.status === 'Completed') {
      reservation.paymentStatus = 'completed';
      reservation.transactionId = verificationResponse.data.transaction_id;
      await reservation.save();

      // Update room availability (this would need to be implemented)
      // Similar to what's in HotelReserve.jsx

      return res.redirect(`/hotelreservations?payment=success&id=${reservation._id}`);
    } else {
      reservation.paymentStatus = 'failed';
      await reservation.save();
      return res.redirect(`/hotelhome?payment=failed`);
    }

  } catch (error) {
    console.error('Payment verification error:', error);
    return res.redirect(`/hotelhome?payment=error`);
  }
};

// Get payment status (for checking status client-side)
const getPaymentStatus = async (req, res) => {
  try {
    const { reservation_id } = req.params;
    
    const reservation = await hotelReservation.findById(reservation_id);
    
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      paymentStatus: reservation.paymentStatus,
      reservation
    });
    
  } catch (error) {
    console.error('Error checking payment status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check payment status',
      error: error.message
    });
  }
};

module.exports = {
  initiateKhaltiPayment,
  verifyKhaltiPayment,
  getPaymentStatus
}; 