import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useKhaltiPayment from '../../hooks/useKhaltiPayment';
import Swal from 'sweetalert2';
import axios from 'axios';

const API_BASE_URL = "http://localhost:5000";

const PaymentSuccess = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyPayment } = useKhaltiPayment();
  const [hasVerified, setHasVerified] = useState(false);

  useEffect(() => {
    const verifyKhaltiPayment = async () => {
      try {
        // Skip verification if already done
        if (hasVerified) return;
        
        // Get query parameters from URL
        const queryParams = new URLSearchParams(location.search);
        const pidx = queryParams.get('pidx');
        const amount = queryParams.get('amount');
        const transaction_id = queryParams.get('transaction_id');
        const purchase_order_id = queryParams.get('purchase_order_id');
        const purchase_order_name = queryParams.get('purchase_order_name');
        
        if (!pidx) {
          throw new Error('Missing payment information');
        }

        // Set flag to prevent duplicate verifications
        setHasVerified(true);

        // Call API to verify payment
        const response = await axios.post(`${API_BASE_URL}/api/khalti/verify`, {
          pidx,
          amount,
          purchase_order_id,
          purchase_order_name,
          transaction_id
        }, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (response.data.success) {
          setPaymentData(response.data.data);
          
          // Show success message
          Swal.fire({
            icon: 'success',
            title: 'Payment Successful!',
            text: 'Your payment has been successfully processed.',
            confirmButtonText: 'Continue'
          });
        } else {
          throw new Error(response.data.message || 'Payment verification failed');
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Payment verification failed');
        
        // Show error message
        Swal.fire({
          icon: 'error',
          title: 'Verification Failed',
          text: err.message || 'There was an error verifying your payment',
          confirmButtonText: 'Try Again'
        });
      } finally {
        setIsVerifying(false);
      }
    };

    verifyKhaltiPayment();
  }, [location.search, hasVerified]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoToOrders = () => {
    navigate('/profile'); // Or any orders page you have
  };

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700 mx-auto"></div>
          <h2 className="mt-4 text-lg font-medium text-gray-900">Verifying your payment...</h2>
          <p className="mt-2 text-sm text-gray-500">Please wait, this won't take long.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Payment Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <div className="mt-6 flex justify-center space-x-4">
              <button
                onClick={handleGoHome}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
              >
                Go Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="mt-2 text-sm text-gray-500">Thank you for your payment. Your transaction has been completed successfully.</p>
          
          {paymentData && (
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transaction ID:</span>
                <span className="font-medium">{paymentData.transaction_id}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">NPR {(paymentData.amount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Order:</span>
                <span className="font-medium">{paymentData.purchase_order_name}</span>
              </div>
              <div className="flex justify-between text-sm mt-2">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{new Date(paymentData.created_on).toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-center space-x-4">
            <button
              onClick={handleGoHome}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none"
            >
              Go Home
            </button>
            <button
              onClick={handleGoToOrders}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none"
            >
              View My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 