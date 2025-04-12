/**
 * Khalti Payment Gateway Configuration
 * This file contains configuration values for Khalti integration
 */

import axios from "axios";  

// Base URL for Khalti API
export const KHALTI_CONFIG = {
  baseUrl: "https://a.khalti.com/api/v2", // Sandbox environment
  publicKey: "test_public_key_dc74e0fd57cb46cd93832aee0a390234", // Hardcoded for testing
  
  // Base URL for our backend API that handles Khalti transactions
  apiBaseUrl: 'http://localhost:5000/api/payments',
  
  // Test credentials for sandbox environment
  testCredentials: {
    phone: '9800000000', // Valid test phone numbers: 9800000000-9800000005
    mpin: '1111',        // Test MPIN always 1111
    otp: '987654'        // Test OTP always 987654
  }
};

// Available payment methods
export const PAYMENT_METHODS = {
  KHALTI: 'khalti',
  CASH: 'cash',
  BANK_TRANSFER: 'bank_transfer',
};

export default KHALTI_CONFIG; 