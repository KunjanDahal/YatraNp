import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { FaMapMarkerAlt, FaStar, FaRegCalendarAlt, FaCheck, FaUser } from "react-icons/fa";
import { MdOutlineLocationCity } from "react-icons/md";
import HotelKhaltiPayment from "../payment/HotelKhaltiPayment";
import Swal from "sweetalert2";

const HotelView = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentSection, setShowPaymentSection] = useState(false);
  
  // Date states for when accessed directly (not from search)
  const [selectedCheckIn, setSelectedCheckIn] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedGuests, setSelectedGuests] = useState(1);
  
  const location = useLocation();
  const searchParams = location.state; // May be undefined if accessed directly
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Use search params if available, otherwise use the selected dates
  const checkInDate = new Date(searchParams?.checkInDate || selectedCheckIn);
  const checkOutDate = new Date(searchParams?.checkOutDate || selectedCheckOut);
  const guests = searchParams?.guests || selectedGuests;
  
  const calculateDayDifference = (date1, date2) => {
    const miliseconds_per_day = 1000 * 60 * 60 * 24;
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    const differenceDays = Math.ceil(timeDifference / miliseconds_per_day);
    return differenceDays;
  };

  const day_difference = calculateDayDifference(checkInDate, checkOutDate);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/hotels/find/${id}`)
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching hotel data:", err);
        setError("Failed to load hotel details. Please try again later.");
        setLoading(false);
      });
  }, [id]);

  const handlePayment = () => {
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to book this hotel",
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Login Now",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { 
            state: { 
              redirectTo: location.pathname,
              bookingInfo: {
                checkInDate: searchParams?.checkInDate || selectedCheckIn,
                checkOutDate: searchParams?.checkOutDate || selectedCheckOut,
                guests: guests
              }
            } 
          });
        }
      });
      return;
    }
    
    setShowPaymentSection(true);
  };

  // Handle payment success
  const handlePaymentSuccess = (response) => {
    console.log('Payment successful:', response);
    Swal.fire({
      icon: 'success',
      title: 'Booking Confirmed!',
      text: 'Your hotel reservation has been confirmed. Check your email for details.',
    });
    
    // Redirect to reservation page
    if (response.reservation_id) {
      navigate(`/hotelreservations?payment=success&id=${response.reservation_id}`);
    } else {
      navigate('/hotelreservations?payment=success');
    }
  };
  
  // Handle payment error
  const handlePaymentError = (error) => {
    console.error('Payment failed:', error);
    Swal.fire({
      icon: 'error',
      title: 'Payment Failed',
      text: 'We encountered an issue processing your payment. Please try again.',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  // Booking details for payment
  const bookingDetails = {
    hotelId: id,
    hotelName: `${data.name} ${data.type}`,
    totalPrice: data.cheapestPrice * day_difference,
    totalNights: day_difference,
    checkInDate: searchParams?.checkInDate || selectedCheckIn,
    checkOutDate: searchParams?.checkOutDate || selectedCheckOut,
    guests: guests
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero section with main image */}
      <div className="w-full h-96 overflow-hidden relative">
        <img
          src={`http://localhost:5000/api/hotels/images/${data.HotelImg}`}
          alt={data.name}
          className="w-full h-full object-cover"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
          }}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
          <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{data.name} {data.type}</h1>
            <div className="flex items-center text-white">
              <FaMapMarkerAlt className="mr-2" />
              <span>{data.city}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel details - Left 2/3 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">{data.title}</h2>
              
              <div className="flex flex-wrap items-center mb-4 text-sm text-gray-600">
                <div className="flex items-center mr-4 mb-2">
                  <MdOutlineLocationCity className="mr-1 text-blue-600" />
                  <span>{data.city}</span>
                </div>
                <div className="flex items-center mr-4 mb-2">
                  <FaStar className="mr-1 text-yellow-500" />
                  <span>4.8/5 (24 reviews)</span>
                </div>
                <div className="flex items-center mb-2">
                  <FaMapMarkerAlt className="mr-1 text-blue-600" />
                  <span>{data.distance} km from city center</span>
                </div>
              </div>
              
              <div className="bg-blue-50 text-blue-800 px-4 py-2 rounded-md flex items-center mb-4">
                <FaCheck className="mr-2" />
                <span>Perfect for a {day_difference} night stay!</span>
              </div>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                {data.description}
              </p>
              
              <div className="border-t pt-4">
                <h3 className="font-bold text-lg mb-2">Your Booking Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <FaRegCalendarAlt className="text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Check-in</p>
                      <p className="font-medium">{checkInDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FaRegCalendarAlt className="text-blue-600 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Check-out</p>
                      <p className="font-medium">{checkOutDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          
            {/* Hotel Images */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Images of our hotel</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {data.HotelImgs && data.HotelImgs.length > 0 ? (
                  data.HotelImgs.map((image, index) => (
                    <div key={index} className="aspect-square overflow-hidden rounded-lg">
                      <img
                        src={`http://localhost:5000/api/hotels/images/${image}`}
                        alt={`Hotel Image ${index}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => { 
                          e.target.onerror = null; 
                          e.target.src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                        }}
                      />
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">No additional images available</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Booking panel - Right 1/3 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              {!showPaymentSection ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-gray-600">Price for your stay</p>
                      <p className="text-3xl font-bold text-blue-600">
                        Rs.{data.cheapestPrice * day_difference}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">
                      Best deal
                    </div>
                  </div>
                
                  {/* Only show date selector if accessed directly (not from search) */}
                  {!searchParams && (
                    <>
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          <FaRegCalendarAlt className="inline mr-2" />
                          Check-in Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedCheckIn}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedCheckIn(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          <FaRegCalendarAlt className="inline mr-2" />
                          Check-out Date
                        </label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedCheckOut}
                          min={selectedCheckIn}
                          onChange={(e) => setSelectedCheckOut(e.target.value)}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-medium mb-2">
                          Guests
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          value={selectedGuests}
                          onChange={(e) => setSelectedGuests(parseInt(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6].map(num => (
                            <option key={num} value={num}>{num} {num === 1 ? 'guest' : 'guests'}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                  
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2 text-gray-600">
                      <span>Rs.{data.cheapestPrice} × {day_difference} nights</span>
                      <span>Rs.{data.cheapestPrice * day_difference}</span>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-md mb-6">
                    <div className="flex mb-2">
                      <FaRegCalendarAlt className="text-blue-600 mr-2 mt-1" />
                      <div>
                        <p className="font-medium">Your stay dates</p>
                        <p className="text-sm text-gray-600">
                          {checkInDate.toLocaleDateString()} to {checkOutDate.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex">
                      <FaUser className="text-blue-600 mr-2 mt-1" />
                      <div>
                        <p className="font-medium">Guests</p>
                        <p className="text-sm text-gray-600">{guests} {guests === 1 ? 'guest' : 'guests'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 my-6 pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>Rs.{data.cheapestPrice * day_difference}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handlePayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                  >
                    Reserve now
                  </button>
                  
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    You won't be charged yet
                  </p>
                </>
              ) : (
                <div>
                  <h3 className="text-xl font-bold mb-4">Complete Your Booking</h3>
                  
                  <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Booking Summary</div>
                    <div className="flex justify-between mb-1">
                      <span>Check-in</span>
                      <span>{checkInDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Check-out</span>
                      <span>{checkOutDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Nights</span>
                      <span>{day_difference}</span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span>Guests</span>
                      <span>{guests}</span>
                    </div>
                    <div className="flex justify-between font-bold pt-2 border-t mt-2">
                      <span>Total</span>
                      <span>Rs.{data.cheapestPrice * day_difference}</span>
                    </div>
                  </div>
                  
                  <HotelKhaltiPayment
                    booking={bookingDetails}
                    user={user || {}}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                  
                  <button 
                    onClick={() => setShowPaymentSection(false)}
                    className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Back to Booking Details
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelView;
