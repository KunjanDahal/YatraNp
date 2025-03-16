import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/authContext';
import KhaltiPayment from '../../components/payment/KhaltiPayment';
import Swal from 'sweetalert2';

const KhaltiPaymentExample = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [packageDetails] = useState({
    id: 'tour-package-123',
    name: 'Kathmandu Valley Tour',
    price: 5000, // in NPR
    description: 'A 3-day tour of Kathmandu Valley including Patan, Bhaktapur, and Kathmandu Durbar Squares',
    image: 'https://images.unsplash.com/photo-1532466049794-3be9eb1a9cd7?q=80&w=2070',
  });
  
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    Swal.fire({
      icon: 'success',
      title: 'Booking Confirmed!',
      text: 'Your tour has been booked successfully.',
      confirmButtonText: 'View Booking'
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/profile');
      }
    });
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: 'There was an error processing your payment. Please try again.',
    });
    setIsPaymentProcessing(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Tour Package Booking</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="md:flex">
          <div className="md:flex-shrink-0">
            <img 
              className="h-48 w-full object-cover md:w-48" 
              src={packageDetails.image} 
              alt={packageDetails.name}
            />
          </div>
          <div className="p-8">
            <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
              Featured Tour Package
            </div>
            <h2 className="mt-2 text-xl font-semibold text-gray-800">{packageDetails.name}</h2>
            <p className="mt-2 text-gray-600">{packageDetails.description}</p>
            <div className="mt-4">
              <span className="text-xl font-bold">NPR {packageDetails.price.toLocaleString()}</span>
              <span className="text-gray-500 ml-2">per person</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4">Complete Your Booking</h2>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Booking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Package: <span className="font-medium">{packageDetails.name}</span></p>
              <p className="text-gray-600">Price: <span className="font-medium">NPR {packageDetails.price.toLocaleString()}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Booking Date: <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
              <p className="text-gray-600">Booking ID: <span className="font-medium">{packageDetails.id}</span></p>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Name: <span className="font-medium">{user?.name || 'Guest User'}</span></p>
              <p className="text-gray-600">Email: <span className="font-medium">{user?.email || 'guest@example.com'}</span></p>
            </div>
            <div>
              <p className="text-gray-600">Phone: <span className="font-medium">{user?.phone || '9800000000'}</span></p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex flex-col items-center">
          <h3 className="text-lg font-medium mb-4">Payment Method</h3>
          
          <KhaltiPayment
            amount={packageDetails.price}
            orderId={packageDetails.id}
            orderName={packageDetails.name}
            customerInfo={{
              name: user?.name || 'Guest User',
              email: user?.email || 'guest@example.com',
              phone: user?.phone || '9800000000',
            }}
            productDetails={[{
              identity: `tour-package-${packageDetails.id || '123'}`,
              name: packageDetails.name,
              total_price: packageDetails.price * 100, // Convert to paisa
              quantity: 1,
              unit_price: packageDetails.price * 100 // Convert to paisa
            }]}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
          
          <p className="text-sm text-gray-500 mt-4">
            You'll be redirected to Khalti's secure payment page to complete your transaction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KhaltiPaymentExample; 