import React, { useRef } from 'react';
import KhaltiPayment from './KhaltiPayment';

/**
 * HotelKhaltiPayment - A wrapper component for KhaltiPayment specifically for hotel bookings
 */
const HotelKhaltiPayment = ({ hotelBooking, onPaymentSuccess, onPaymentError }) => {
  const khaltiRef = useRef();
  
  // Format hotel booking data for Khalti payment
  const paymentProduct = {
    id: hotelBooking.id || 'hotel-booking',
    name: `Booking for ${hotelBooking.hotelName || 'Hotel'}`,
    price: hotelBooking.totalPrice || 0,
    customer: {
      name: hotelBooking.userName || 'Guest',
      email: hotelBooking.userEmail || 'guest@example.com',
      phone: hotelBooking.userPhone || '9800000000'
    }
  };
  
  console.log('Hotel payment product:', paymentProduct);
  
  return (
    <div className="hotel-khalti-payment">
      <KhaltiPayment 
        ref={khaltiRef}
        product={paymentProduct}
        onSuccess={onPaymentSuccess}
        onError={onPaymentError}
        buttonText="Pay Now with Khalti"
      />
      <button 
        onClick={() => khaltiRef.current && khaltiRef.current.initiatePayment()}
        style={{
          backgroundColor: '#4a90e2',
          color: 'white',
          padding: '10px 20px',
          margin: '10px 0',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Proceed to Payment
      </button>
      <p style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>
        You will be redirected to Khalti to complete your payment securely
      </p>
    </div>
  );
};

export default HotelKhaltiPayment; 