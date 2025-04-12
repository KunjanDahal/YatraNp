import React, { useRef } from 'react';
import KhaltiPayment from './KhaltiPayment';

/**
 * HotelKhaltiPayment - A component for processing hotel bookings with Khalti payment
 * 
 * @param {Object} props - Component props
 * @param {Object} props.booking - Hotel booking details
 * @param {string} props.booking.hotelId - ID of the hotel
 * @param {string} props.booking.hotelName - Name of the hotel
 * @param {number} props.booking.totalPrice - Total price of the booking
 * @param {number} props.booking.totalDays - Total days for the booking
 * @param {string} props.booking.checkInDate - Check-in date
 * @param {string} props.booking.checkOutDate - Check-out date
 * @param {Object} props.user - User information
 * @param {function} props.onSuccess - Callback function on successful payment
 * @param {function} props.onError - Callback function on payment error
 */
const HotelKhaltiPayment = ({ booking, user, onSuccess, onError }) => {
  // Format booking details for the KhaltiPayment component
  const amount = booking.totalPrice;
  const orderId = `hotel_${booking.hotelId}_${Date.now()}`;
  const orderName = `Hotel Booking: ${booking.hotelName}`;
  
  // Customer information
  const customerInfo = {
    name: user?.username || user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: user?.phone || '9800000000',
  };
  
  // Product details for Khalti
  const productDetails = [{
    identity: booking.hotelId,
    name: booking.hotelName,
    total_price: amount * 100, // Convert to paisa
    quantity: 1,
    unit_price: amount * 100 // Convert to paisa
  }];
  
  return (
    <div className="hotel-khalti-payment">
      <KhaltiPayment
        amount={amount}
        orderId={orderId}
        orderName={orderName}
        customerInfo={customerInfo}
        productDetails={productDetails}
        onSuccess={onSuccess}
        onError={onError}
      />
      
      <p className="text-sm text-gray-500 mt-2">
        You'll be redirected to Khalti's secure payment page to complete your transaction.
      </p>
    </div>
  );
};

export default HotelKhaltiPayment; 