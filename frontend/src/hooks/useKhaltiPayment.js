import { useState } from "react";
import axios from "axios";
import { KHALTI_CONFIG } from "../config/khaltiConfig";

export function useKhaltiPayment({
  onSuccess,
  onError,
  autoRedirect = true,
} = {}) {
  const [pidx, setPidx] = useState(null);
  const [initiationError, setInitiationError] = useState(null);
  const [statusError, setStatusError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
 
  const initiate = async (data) => {
    setIsLoading(true);
    setInitiationError(null);
 
    try {
      // Create payload based on what we receive
      const payloadData = {
        amount: Math.round(data.amount * 100),
        purchase_order_id: data.purchaseOrderId || `order-${Date.now()}`,
        purchase_order_name: data.purchaseOrderName || "Product Purchase",
        customer_info: {
          name: data.customerName || data.customerInfo?.name || "Customer",
          email: data.customerEmail || data.customerInfo?.email || "customer@example.com",
          phone: data.customerPhone || data.customerInfo?.phone || "9800000000",
        },
        return_url: "http://localhost:3000/success",
        website_url: "http://localhost:3000",
      };
      
      console.log("Initiating Khalti payment:", payloadData);
      
      const response = await axios.post(
        `${KHALTI_CONFIG.apiBaseUrl}/khalti/initiate`,
        payloadData
      );
 
      const paymentResponse = response.data;
      setPidx(paymentResponse.pidx);
 
      if (autoRedirect) {
        window.location.href = paymentResponse.payment_url;
      }
 
      return paymentResponse;
    } catch (error) {
      console.error("Payment initiation error:", error);
      setInitiationError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
 
  const checkPaymentStatus = async (checkPidx = null) => {
    const pidxToCheck = checkPidx || pidx;
    
    if (!pidxToCheck) {
      throw new Error("Payment ID not found");
    }
 
    setIsLoading(true);
    setStatusError(null);
 
    try {
      const response = await axios.post(
        `${KHALTI_CONFIG.apiBaseUrl}/khalti/verify`,
        { pidx: pidxToCheck }
      );
 
      const paymentStatus = response.data;
      if (paymentStatus.data && paymentStatus.data.status === "Completed") {
        onSuccess?.(paymentStatus.data);
      }
 
      return paymentStatus;
    } catch (error) {
      console.error("Payment verification error:", error);
      setStatusError(error);
      onError?.(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
 
  return {
    initiate,
    checkPaymentStatus,
    pidx,
    initiationError,
    statusError,
    isLoading,
  };
}

export default useKhaltiPayment; 