import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useKhaltiPayment from '../hooks/useKhaltiPayment';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState({
    verified: false,
    loading: true,
    error: null,
    details: null
  });
  
  // Initialize the Khalti hook
  const { handleCallback, verifyPayment } = useKhaltiPayment({
    onSuccess: (response) => {
      setPaymentStatus({
        verified: true,
        loading: false,
        error: null,
        details: response
      });
    },
    onError: (error) => {
      setPaymentStatus({
        verified: false,
        loading: false,
        error: error.message || 'Payment verification failed',
        details: null
      });
    }
  });
  
  useEffect(() => {
    // Extract payment parameters from URL
    const pidx = searchParams.get('pidx');
    const status = searchParams.get('status');
    const transaction_id = searchParams.get('transaction_id');
    const purchase_order_id = searchParams.get('purchase_order_id');
    const purchase_order_name = searchParams.get('purchase_order_name');
    
    // If we have a pidx, verify the payment
    if (pidx) {
      handleCallback(searchParams).catch(error => {
        setPaymentStatus({
          verified: false,
          loading: false,
          error: error.message || 'Payment verification failed',
          details: null
        });
      });
    } else {
      setPaymentStatus({
        verified: false,
        loading: false,
        error: 'No payment information found',
        details: null
      });
    }
  }, [searchParams, handleCallback]);
  
  // Format amount from paisa to NPR
  const formatAmount = (amount) => {
    if (!amount) return '0.00';
    const amountNPR = Number(amount) / 100;
    return amountNPR.toFixed(2);
  };
  
  return (
    <div className="payment-success-container" style={{ textAlign: 'center', margin: '40px auto', maxWidth: '600px' }}>
      <h1>Payment {paymentStatus.verified ? 'Successful' : status || 'Processing'}</h1>
      
      {paymentStatus.loading && <p>Verifying payment...</p>}
      
      {paymentStatus.error && (
        <div style={{ color: 'red', margin: '20px 0' }}>
          <p>Error: {paymentStatus.error}</p>
        </div>
      )}
      
      {paymentStatus.verified && paymentStatus.details && (
        <div className="payment-details" style={{ textAlign: 'left', margin: '20px 0' }}>
          <h2>Payment Details</h2>
          <div style={{ background: '#f8f8f8', padding: '15px', borderRadius: '5px' }}>
            <p><strong>Order ID:</strong> {paymentStatus.details.purchase_order_id}</p>
            <p><strong>Product:</strong> {paymentStatus.details.purchase_order_name}</p>
            <p><strong>Amount:</strong> NPR {formatAmount(paymentStatus.details.total_amount)}</p>
            <p><strong>Transaction ID:</strong> {paymentStatus.details.transaction_id}</p>
            <p><strong>Status:</strong> {paymentStatus.details.status}</p>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px' }}>
        <a href="/" style={{ display: 'inline-block', padding: '10px 20px', background: '#5C2D91', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Back to Home
        </a>
      </div>
    </div>
  );
};

export default PaymentSuccess; 