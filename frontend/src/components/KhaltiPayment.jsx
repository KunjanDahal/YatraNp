import React, { Component, forwardRef } from 'react';
import { KHALTI_CONFIG } from '../config/khaltiConfig';
import axios from 'axios';

/**
 * KhaltiPayment Component - Class-based for better backward compatibility
 * Based on the example from: https://sandipwrites.medium.com/adding-khalti-payments-to-your-react-app-a-developers-guide-d8c0528f5d8b
 */
class KhaltiPaymentComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      error: null
    };
  }
  
  // This method will be available as this.initiatePayment in parent components
  initiatePayment = async () => {
    const { 
      product, 
      amount, 
      productId, 
      productName, 
      customerName, 
      customerEmail, 
      customerPhone,
      autoRedirect = true,
      onSuccess,
      onError
    } = this.props;
    
    try {
      this.setState({ isLoading: true, error: null });
      
      // Prepare payment data based on props
      let paymentData;
      
      // If product object is provided, use it
      if (product) {
        paymentData = {
          amount: product.price * 100, // Convert to paisa
          purchase_order_id: `order-${product.id}`,
          purchase_order_name: product.name,
          customer_info: {
            name: product.customer?.name || "Customer Name",
            email: product.customer?.email || "customer@example.com",
            phone: product.customer?.phone || "9800000000"
          },
          return_url: window.location.origin + "/payment/success",
          website_url: window.location.origin
        };
      } 
      // Fallback to individual props
      else if (amount && productId && productName) {
        paymentData = {
          amount: Number(amount) * 100, // Convert to paisa
          purchase_order_id: productId,
          purchase_order_name: productName,
          customer_info: {
            name: customerName || "Customer Name",
            email: customerEmail || "customer@example.com",
            phone: customerPhone || "9800000000"
          },
          return_url: window.location.origin + "/payment/success",
          website_url: window.location.origin
        };
      } else {
        throw new Error("Missing required payment information");
      }
      
      console.log('Initiating payment with data:', paymentData);
      
      // Make API request to backend
      const response = await axios.post(
        `${KHALTI_CONFIG.apiBaseUrl}/khalti/initiate`, 
        paymentData
      );
      
      console.log('Payment initiation response:', response.data);
      
      if (response.data && response.data.payment_url) {
        // Redirect to Khalti payment page if autoRedirect is true
        if (autoRedirect) {
          window.location.href = response.data.payment_url;
        }
        
        if (onSuccess) {
          onSuccess(response.data);
        }
        
        return response.data;
      } else {
        throw new Error('Failed to get payment URL');
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
      
      this.setState({ 
        error: error.message || 'Failed to initiate payment'
      });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      // Only update state if not redirecting
      if (!autoRedirect) {
        this.setState({ isLoading: false });
      }
    }
  };
  
  // Handle button click
  handlePayment = () => {
    this.initiatePayment()
      .catch(error => {
        console.error('Error handling payment:', error);
      });
  };
  
  render() {
    const { buttonText = 'Pay with Khalti', buttonStyle = {} } = this.props;
    const { isLoading, error } = this.state;
    
    return (
      <div className="khalti-payment-container">
        {isLoading && <span>Processing payment...</span>}
        {error && <span style={{ color: 'red' }}>Error: {error}</span>}
        
        <button
          onClick={this.handlePayment}
          disabled={isLoading}
          style={{
            backgroundColor: '#5C2D91', // Khalti purple
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            ...buttonStyle
          }}
        >
          {isLoading ? 'Processing...' : buttonText}
        </button>
        
        <div className="test-info" style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
          <p>Test with these credentials in sandbox:</p>
          <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
            <li>Phone: {KHALTI_CONFIG.testCredentials.phone}</li>
            <li>MPIN: {KHALTI_CONFIG.testCredentials.mpin}</li>
            <li>OTP: {KHALTI_CONFIG.testCredentials.otp}</li>
          </ul>
        </div>
      </div>
    );
  }
}

// Use forwardRef to properly handle refs
const KhaltiPayment = forwardRef((props, ref) => {
  const componentRef = React.createRef();
  
  // Forward the initiatePayment method to the parent component
  React.useImperativeHandle(ref, () => ({
    initiatePayment: () => {
      if (componentRef.current) {
        return componentRef.current.initiatePayment();
      }
    }
  }));
  
  return <KhaltiPaymentComponent ref={componentRef} {...props} />;
});

export default KhaltiPayment; 