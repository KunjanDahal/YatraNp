import axios from "axios";

export const KHALTI_CONFIG = {
  // Use sandbox URL for testing, change to production URL for live
  baseUrl: "https://a.khalti.com/api/v2", // Sandbox environment
  publicKey: process.env.REACT_APP_KHALTI_PUBLIC_KEY || "",
  secretKey: process.env.REACT_APP_KHALTI_SECRET_KEY || "",
};

// Pre-configured axios instance for Khalti API calls
export const khaltiClient = axios.create({
  baseURL: KHALTI_CONFIG.baseUrl,
  headers: {
    Authorization: `Key ${KHALTI_CONFIG.secretKey}`,
    "Content-Type": "application/json",
  },
}); 