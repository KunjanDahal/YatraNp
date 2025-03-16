import { useState } from "react";
import axios from "axios";
import { KHALTI_CONFIG } from "../config/khaltiConfig";

const API_BASE_URL = "http://localhost:5000";

const useKhaltiPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  // Initialize payment function
  const initiatePayment = async (paymentInfo) => {
    try {
      setLoading(true);
      setError(null);

      // Make sure the necessary fields are present
      if (!paymentInfo.amount || !paymentInfo.purchaseOrderId || !paymentInfo.purchaseOrderName) {
        throw new Error("Missing required payment information");
      }

      // Make sure amount is in paisa (1 NPR = 100 paisa)
      const amountInPaisa = paymentInfo.amount * 100;
      
      console.log('Converting NPR to paisa:', paymentInfo.amount, '->', amountInPaisa);

      // Create payment payload
      const payload = {
        return_url: paymentInfo.returnUrl || window.location.origin + "/payment/success",
        website_url: window.location.origin,
        amount: amountInPaisa,
        purchase_order_id: paymentInfo.purchaseOrderId,
        purchase_order_name: paymentInfo.purchaseOrderName,
        customer_info: {
          name: paymentInfo.customerName || "Guest User",
          email: paymentInfo.customerEmail || "guest@example.com",
          phone: paymentInfo.customerPhone || "9800000000",
        },
        product_details: Array.isArray(paymentInfo.productDetails) 
          ? paymentInfo.productDetails 
          : [{
              identity: paymentInfo.purchaseOrderId,
              name: paymentInfo.purchaseOrderName, 
              total_price: amountInPaisa,
              quantity: 1,
              unit_price: amountInPaisa
            }],
      };

      console.log('Sending payment request with payload:', payload);

      // Make API request to your backend to initiate payment
      const response = await axios.post(`${API_BASE_URL}/api/khalti/initiate`, payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Payment initiation response:', response.data);

      if (response.data && response.data.payment_url) {
        setPaymentUrl(response.data.payment_url);
        // Optionally redirect user to the payment URL
        if (paymentInfo.autoRedirect) {
          window.location.href = response.data.payment_url;
        }
        return response.data;
      } else {
        throw new Error("Failed to get payment URL");
      }
    } catch (err) {
      console.error("Khalti payment initiation error:", err);
      
      let errorMessage = "Failed to initiate payment";
      
      if (err.response && err.response.data) {
        console.error("Error details:", err.response.data);
        errorMessage = err.response.data.message || err.response.data.error || errorMessage;
      } else {
        console.error("Error message:", err.message);
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verify payment function
  const verifyPayment = async (token, amount) => {
    try {
      setLoading(true);
      setError(null);

      // Make API request to your backend to verify payment
      const response = await axios.post(`${API_BASE_URL}/api/khalti/verify`, {
        token,
        amount,
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      setPaymentDetails(response.data);
      return response.data;
    } catch (err) {
      console.error("Khalti payment verification error:", err);
      setError(err.message || "Failed to verify payment");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    paymentUrl,
    paymentDetails,
    initiatePayment,
    verifyPayment,
  };
};

export default useKhaltiPayment; 