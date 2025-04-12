import React from 'react';
import KhaltiPayment from './KhaltiPayment';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import axios from 'axios';

const TourKhaltiPayment = ({ tourData, bookingData, user }) => {
  const navigate = useNavigate();

  // Format booking details for Khalti payment
  const amount = tourData?.price || 0;
  const orderId = `TOUR-${tourData?._id}-${Date.now()}`;
  const orderName = `Tour Booking: ${tourData?.name || 'Tour Package'}`;

  // Customer information for the payment
  const customerInfo = {
    name: `${bookingData?.firstName || ''} ${bookingData?.lastName || ''}`,
    email: user?.email || '',
    phone: bookingData?.phone || ''
  };

  // Product details for Khalti payment
  const productDetails = [
    {
      identity: tourData?._id || 'tour-product',
      name: tourData?.name || 'Tour Package',
      total_price: amount * 100, // Convert to paisa
      quantity: bookingData?.guestCount || 1,
      unit_price: (amount * 100) / (bookingData?.guestCount || 1) // Price per guest
    }
  ];

  // Handle successful payment
  const handlePaymentSuccess = async (response) => {
    try {
      // Create the booking with payment info
      const bookingPayload = {
        tourId: tourData?._id,
        userId: user?.id,
        paymentInfo: {
          method: 'khalti',
          transactionId: response.idx,
          amount: amount,
          status: 'completed'
        },
        bookingDetails: {
          ...bookingData,
          date: bookingData?.date,
          numberOfGuests: bookingData?.guestCount
        }
      };

      const saveResponse = await axios.post('/api/bookings/tour', bookingPayload);
      
      Swal.fire({
        icon: 'success',
        title: 'Booking Confirmed!',
        text: 'Your tour has been successfully booked. Check your email for details.',
      });
      
      // Redirect to booking confirmation page
      navigate(`/booking/confirmation/${saveResponse.data.bookingId}`);
    } catch (error) {
      console.error('Error saving booking:', error);
      Swal.fire({
        icon: 'warning',
        title: 'Booking Issue',
        text: 'Your payment was successful but we had trouble saving your booking. Please contact support with your payment ID.',
      });
    }
  };

  // Handle payment errors
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: 'We couldn\'t process your payment. Please try again or use a different payment method.',
    });
  };

  return (
    <div className="tour-khalti-payment">
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
        <p className="text-blue-700 font-medium">
          You'll be redirected to Khalti's secure payment page to complete your booking.
        </p>
      </div>
      
      <div className="payment-summary mb-4">
        <h3 className="font-bold text-lg mb-2">Payment Summary</h3>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span>Tour Package:</span>
          <span>{tourData?.name}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span>Number of Guests:</span>
          <span>{bookingData?.guestCount}</span>
        </div>
        <div className="flex justify-between border-b pb-2 mb-2">
          <span>Date:</span>
          <span>{new Date(bookingData?.date).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total Amount:</span>
          <span>NPR {amount}</span>
        </div>
      </div>
      
      <KhaltiPayment
        amount={amount}
        orderId={orderId}
        orderName={orderName}
        customerInfo={customerInfo}
        productDetails={productDetails}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
      />
    </div>
  );
};

export default TourKhaltiPayment; 