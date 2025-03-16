import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useKhaltiPayment from '../../hooks/useKhaltiPayment';
import Swal from 'sweetalert2';

const KhaltiPayment = ({ 
  amount, 
  orderId, 
  orderName, 
  customerInfo, 
  productDetails,
  onSuccess,
  onError 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const { loading, error, paymentUrl, initiatePayment } = useKhaltiPayment();

  useEffect(() => {
    // Only redirect if paymentUrl exists and we haven't redirected yet
    if (paymentUrl && !window.location.href.includes(paymentUrl)) {
      console.log('Redirecting to payment URL:', paymentUrl);
      window.location.href = paymentUrl;
    }
  }, [paymentUrl]);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: 'error',
        title: 'Payment Error',
        text: error,
      });
      if (onError) onError(error);
    }
  }, [error, onError]);

  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      if (!amount || !orderId || !orderName) {
        throw new Error("Required payment details are missing");
      }

      // Generate a unique order ID if not provided
      const uniqueOrderId = orderId || `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      const paymentInfo = {
        amount: Number(amount),
        purchaseOrderId: uniqueOrderId,
        purchaseOrderName: orderName,
        customerName: customerInfo?.name,
        customerEmail: customerInfo?.email,
        customerPhone: customerInfo?.phone,
        productDetails: productDetails || [{
          identity: orderId,
          name: orderName,
          total_price: amount * 100, // Convert to paisa
          quantity: 1,
          unit_price: amount * 100  // Convert to paisa
        }]
      };

      await initiatePayment(paymentInfo);
      
    } catch (err) {
      console.error("Payment initiation failed:", err);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed',
        text: err.message || 'There was an error processing your payment. Please try again.',
      });
      if (onError) onError(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="khalti-payment-container">
      <button
        onClick={handlePayment}
        disabled={isProcessing || loading}
        className="khalti-payment-button"
        style={{
          backgroundColor: '#5C2D91',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '4px',
          border: 'none',
          cursor: isProcessing || loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          fontWeight: 'bold',
          width: '100%',
          maxWidth: '300px',
          opacity: isProcessing || loading ? 0.7 : 1
        }}
      >
        {isProcessing || loading ? (
          <>
            <span className="loading-spinner"></span>
            <span>Processing...</span>
          </>
        ) : (
          <>
            <img 
              src="https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2020.12.22.11.33.42/icons/khalti.svg" 
              alt="Khalti Logo" 
              style={{ height: '24px', width: 'auto' }}
            />
            <span>Pay with Khalti</span>
          </>
        )}
      </button>
      
      <style jsx>{`
        .loading-spinner {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .khalti-payment-container {
          margin: 15px 0;
        }
      `}</style>
    </div>
  );
};

export default KhaltiPayment; 