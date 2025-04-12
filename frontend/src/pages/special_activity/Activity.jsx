import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import CircularProgress from '@mui/material/CircularProgress';
import KhaltiPayment from "../../components/payment/KhaltiPayment";
import { AuthContext } from "../../context/authContext";
import { FaCalendarAlt, FaClock, FaMapMarkerAlt, FaTag, FaUsers, FaMoneyBillWave } from "react-icons/fa";

const Activity = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [reservationData, setReservationData] = useState(null);
  
  useEffect(() => {
    const getActivity = async () => {
      setLoading(true);
      try {
        console.log("Fetching activity with ID:", id);
        // Try multiple endpoints to find the correct one
        let response;
        
        try {
          response = await axios.get(`/api/activities/${id}`);
        } catch (err) {
          console.log("First attempt failed, trying another endpoint");
          response = await axios.get(`/api/activities/all-public/${id}`);
        }
        
        console.log("Activity data:", response.data);
        
        if (response.data) {
          setActivity(response.data);
          // Set default price
          if (response.data.price) {
            setTotalPrice(response.data.price);
          }
        } else {
          throw new Error("No activity data returned from API");
        }
      } catch (error) {
        console.error("Error fetching activity:", error);
        setError("Failed to load activity details. Please try again later.");
        Swal.fire({
          icon: "error",
          title: "Error Loading Activity",
          text: "We couldn't load the activity details. Please try again later."
        });
      } finally {
        setLoading(false);
      }
    };
    
    getActivity();
  }, [id]);

  // Calculate total price when number of tickets changes
  useEffect(() => {
    if (activity && activity.price) {
      setTotalPrice(activity.price * numberOfTickets);
    }
  }, [numberOfTickets, activity]);

  const handleNumberOfTicketsChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    setNumberOfTickets(Math.max(1, value)); // Ensure minimum value is 1
  };

  const validateReservation = () => {
    if (numberOfTickets <= 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Ticket Count",
        text: "Please select at least one ticket."
      });
      return false;
    }
    
    if (!activity) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Activity data is not available. Please try again later."
      });
      return false;
    }
    
    return true;
  };

  const handleProceedToPayment = () => {
    if (!user) {
      Swal.fire({
        icon: 'warning',
        title: 'Login Required',
        text: 'Please login to continue with this reservation',
        showCancelButton: true,
        confirmButtonText: 'Login Now',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login', { state: { from: `/activities/${id}` } });
        }
      });
      return;
    }
    
    if (!validateReservation()) {
      return;
    }
    
    // Store reservation data for payment
    const data = {
      activity_id: id,
      numberOfTickets,
      totalPrice,
      activityDate: activity.dateRange?.startDate,
      activityTime: activity.timeRange?.startTime
    };
    
    setReservationData(data);
    setShowPayment(true);
    
    // Scroll to payment section
    setTimeout(() => {
      const paymentSection = document.getElementById('payment-section');
      if (paymentSection) {
        paymentSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handlePaymentSuccess = async (paymentData) => {
    try {
      // Create the reservation with payment info
      const response = await axios.post(`/api/activities/reservations/create`, {
        ...reservationData,
        paymentData: {
          transactionId: paymentData.transaction_id || paymentData.pidx,
          amount: totalPrice,
          status: 'completed'
        }
      });
      
      console.log("Reservation response:", response.data);
      
      Swal.fire({
        icon: "success",
        title: "Reservation Successful!",
        text: "Your activity has been reserved successfully. You will receive your ticket shortly!"
      });
      
      // Generate and download ticket
      generateTicket(response.data);
      
      // Navigate to reservations page
      navigate("/my-reservations");
    } catch (error) {
      console.error("Error making reservation:", error);
      Swal.fire({
        icon: "error",
        title: "Reservation Failed",
        text: "There was a problem creating your reservation. Please try again."
      });
    }
  };

  const handlePaymentError = (error) => {
    console.error("Payment error:", error);
    Swal.fire({
      icon: "error",
      title: "Payment Failed",
      text: "There was a problem processing your payment. Please try again."
    });
  };

  const generateTicket = (reservationData) => {
    // In a real implementation, this would generate a PDF ticket or similar
    // For now, we'll just show a success message with ticket details
    Swal.fire({
      icon: "info",
      title: "Ticket Generated",
      html: `
        <div style="text-align: left; padding: 10px; border: 1px dashed #333;">
          <h3 style="text-align: center; margin-bottom: 15px;">${activity.name} - Ticket</h3>
          <p><strong>Reservation ID:</strong> ${reservationData._id || 'N/A'}</p>
          <p><strong>Date:</strong> ${activity.dateRange?.startDate ? new Date(activity.dateRange.startDate).toLocaleDateString() : 'N/A'}</p>
          <p><strong>Time:</strong> ${activity.timeRange?.startTime || 'N/A'} - ${activity.timeRange?.endTime || 'N/A'}</p>
          <p><strong>Number of Tickets:</strong> ${numberOfTickets}</p>
          <p><strong>Total Amount:</strong> Rs. ${totalPrice}</p>
          <div style="text-align: center; margin-top: 15px; font-size: 12px;">
            <p>Please show this ticket at the venue entrance.</p>
            <p>Thank you for choosing YatraNp!</p>
          </div>
        </div>
      `,
      confirmButtonText: "Download Ticket",
      showCancelButton: true,
      cancelButtonText: "Close"
    }).then((result) => {
      if (result.isConfirmed) {
        // Simulate ticket download
        Swal.fire({
          icon: "success",
          title: "Ticket Downloaded",
          text: "Your ticket has been downloaded successfully."
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircularProgress />
        <p className="ml-4">Loading activity details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/events')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-64 w-full bg-cover bg-center"
          style={{ 
            backgroundImage: activity?.image ? `url(${activity.image})` : 'linear-gradient(135deg, #41A4FF 0%, #5C2D91 100%)',
            filter: 'brightness(0.7)'
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-4">
            <h1 className="text-4xl font-bold mb-2">{activity?.name || 'Activity Details'}</h1>
            <p className="text-xl">{activity?.location || 'Location Unknown'}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 mb-32">
        {activity && (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Activity Details */}
            <div className="w-full lg:w-2/3">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Activity Image */}
                {activity.image && (
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-full h-80 object-cover"
                  />
                )}

                {/* Activity Information */}
                <div className="p-6">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">{activity.name}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-red-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Location</h3>
                        <p className="text-gray-800">{activity.location || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-blue-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Date</h3>
                        <p className="text-gray-800">
                          {activity.dateRange?.startDate ? new Date(activity.dateRange.startDate).toLocaleDateString() : 'N/A'} - 
                          {activity.dateRange?.endDate ? new Date(activity.dateRange.endDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaClock className="text-yellow-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Time</h3>
                        <p className="text-gray-800">
                          {activity.timeRange?.startTime || 'N/A'} - {activity.timeRange?.endTime || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaTag className="text-green-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Type</h3>
                        <p className="text-gray-800">{activity.type || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaUsers className="text-purple-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Maximum Capacity</h3>
                        <p className="text-gray-800">{activity.maxCapacity || 'Unlimited'} people</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaMoneyBillWave className="text-emerald-500 mr-2 text-xl" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Price</h3>
                        <p className="text-gray-800">Rs. {activity.price || 'Free'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{activity.description || 'No description available.'}</p>
                  </div>
                </div>
              </div>
              
              {/* Additional Details if needed */}
              {activity.additionalDetails && (
                <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">Additional Information</h3>
                  <p className="text-gray-700">{activity.additionalDetails}</p>
                </div>
              )}
            </div>
            
            {/* Booking Form */}
            <div className="w-full lg:w-1/3">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-4">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Reserve Your Spot</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2" htmlFor="numberOfTickets">
                      Number of Tickets
                    </label>
                    <input
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      id="numberOfTickets"
                      type="number"
                      required
                      min="1"
                      value={numberOfTickets}
                      onChange={handleNumberOfTicketsChange}
                    />
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Price per ticket:</span>
                      <span className="font-medium">Rs. {activity.price || 0}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-gray-600">Number of tickets:</span>
                      <span className="font-medium">{numberOfTickets}</span>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>Rs. {totalPrice}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors"
                  >
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Payment Section */}
        {showPayment && (
          <div id="payment-section" className="mt-8 bg-white rounded-lg shadow-lg p-6 mb-20">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Payment</h3>
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Order Summary</h4>
              <p className="text-gray-600">Activity: {activity.name}</p>
              <p className="text-gray-600">Date: {activity.dateRange?.startDate ? new Date(activity.dateRange.startDate).toLocaleDateString() : 'N/A'}</p>
              <p className="text-gray-600">Time: {activity.timeRange?.startTime || 'N/A'} - {activity.timeRange?.endTime || 'N/A'}</p>
              <p className="text-gray-600">Number of Tickets: {numberOfTickets}</p>
              <p className="text-gray-600 font-bold mt-2">Total Amount: Rs. {totalPrice}</p>
            </div>
            
            <div className="flex flex-col items-center">
              <p className="text-gray-700 mb-4">Click the button below to complete your payment securely with Khalti.</p>
              
              <KhaltiPayment 
                amount={totalPrice}
                orderId={`ACT-${id}-${Date.now()}`}
                orderName={`Ticket for ${activity.name}`}
                customerInfo={{
                  name: user?.name || 'Customer',
                  email: user?.email || 'customer@example.com',
                  phone: user?.phone || '9800000000'
                }}
                productDetails={[{
                  identity: `ACT-${id}`,
                  name: activity.name,
                  total_price: totalPrice * 100, // In paisa
                  quantity: numberOfTickets,
                  unit_price: activity.price * 100 // In paisa
                }]}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              
              <p className="text-sm text-gray-500 mt-4">
                You will be redirected to Khalti's secure payment page. After completing payment, 
                you'll receive your ticket and confirmation details.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Activity;
