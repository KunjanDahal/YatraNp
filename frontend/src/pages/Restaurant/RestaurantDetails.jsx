import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaUsers, FaUtensils, FaPhone, FaCalendarAlt, FaClock, FaUserFriends } from "react-icons/fa";
import Swal from "sweetalert2";
import { AuthContext } from "../../context/authContext";

const RestaurantDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Booking form state
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [guests, setGuests] = useState(1);
  const [notes, setNotes] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  // Get today's date for min date attribute
  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        setLoading(true);
        console.log("Fetching restaurant with ID:", id);
        
        // The correct endpoint from server.js and routes/restaurants.js
        const response = await axios.get(`/api/restaurant/find/${id}`);
        console.log("Response data:", response.data);
        
        if (!response.data) {
          throw new Error("Restaurant not found");
        }
        
        setRestaurant(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError("Failed to load restaurant details. Please check console for more information.");
        setLoading(false);
      }
    };
    
    fetchRestaurant();
  }, [id]);
  
  const handleBooking = async (e) => {
    e.preventDefault();
    
    if (!user) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to book a restaurant",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Go to Login",
        cancelButtonText: "Cancel"
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login", { state: { from: `/restaurant/${id}` } });
        }
      });
      return;
    }
    
    if (!date || !time || guests < 1) {
      Swal.fire({
        title: "Missing Information",
        text: "Please fill in all required fields",
        icon: "error"
      });
      return;
    }
    
    try {
      setBookingLoading(true);
      
      const bookingData = {
        restaurantId: id,
        restaurantName: restaurant.name,
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userPhone: user.phone || "",
        date,
        time,
        guests,
        notes,
        status: "pending"
      };
      
      console.log("Sending booking data:", bookingData);
      const endpoint = "/api/restaurants/restaurantReservations";
      console.log("Posting to endpoint:", endpoint);
      
      const response = await axios.post(endpoint, bookingData);
      console.log("Booking response:", response);
      
      setBookingLoading(false);
      
      if (response.data) {
        Swal.fire({
          title: "Booking Successful!",
          text: "Your restaurant booking has been confirmed",
          icon: "success"
        }).then(() => {
          navigate("/reservations");
        });
      }
    } catch (err) {
      setBookingLoading(false);
      console.error("Booking error:", err);
      console.error("Full booking error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status
      });
      
      Swal.fire({
        title: "Booking Failed",
        text: err.response?.data?.message || "Failed to book restaurant. Please try again.",
        icon: "error"
      });
    }
  };
  
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading restaurant details...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="bg-red-100 p-6 rounded-lg text-center max-w-lg">
        <p className="text-red-700 text-lg mb-4">{error}</p>
        <p className="text-gray-600 mb-4">Please try again or contact support if the issue persists.</p>
        <button 
          onClick={() => navigate("/restaurants")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
        >
          Back to Restaurants
        </button>
      </div>
    </div>
  );
  
  if (!restaurant) return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-600 mb-4">Restaurant not found</p>
        <button 
          onClick={() => navigate("/restaurants")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded transition duration-300"
        >
          Back to Restaurants
        </button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Restaurant Header */}
        <div className="relative">
          <img 
            src={restaurant.uploadResimage || 'https://via.placeholder.com/1200x400?text=Restaurant+Image'} 
            alt={restaurant.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/1200x400?text=No+Image+Available';
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <p className="text-lg capitalize">{restaurant.restaurantType} Cuisine</p>
            </div>
          </div>
        </div>
        
        {/* Restaurant Details & Booking Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Left Column - Restaurant Details */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold border-b pb-2">Restaurant Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <FaMapMarkerAlt className="text-red-500 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-medium">Location</h3>
                  <p className="text-gray-700">{restaurant.Address}</p>
                  <p className="text-gray-700 capitalize">{restaurant.city}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaUsers className="text-blue-500 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-medium">Capacity</h3>
                  <p className="text-gray-700">{restaurant.capacity} people</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaUtensils className="text-green-600 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-medium">Price Range</h3>
                  <p className="text-gray-700">Rs. {restaurant.priceRange}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaPhone className="text-indigo-500 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-medium">Contact</h3>
                  <p className="text-gray-700">{restaurant.contactNo}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <FaUserFriends className="text-orange-500 mt-1 mr-3 text-xl" />
                <div>
                  <h3 className="font-medium">Staff</h3>
                  <p className="text-gray-700">{restaurant.staffAmount} team members</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Booking Form */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">Make a Reservation</h2>
            
            <form onSubmit={handleBooking} className="space-y-4">
              <div>
                <label className="block mb-1 text-gray-700 font-medium">
                  <FaCalendarAlt className="inline mr-2 text-blue-500" />
                  Date
                </label>
                <input 
                  type="date" 
                  className="w-full p-2 border rounded"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 font-medium">
                  <FaClock className="inline mr-2 text-blue-500" />
                  Time
                </label>
                <select
                  className="w-full p-2 border rounded"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                >
                  <option value="">Select time</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="12:30">12:30 PM</option>
                  <option value="13:00">1:00 PM</option>
                  <option value="13:30">1:30 PM</option>
                  <option value="14:00">2:00 PM</option>
                  <option value="14:30">2:30 PM</option>
                  <option value="15:00">3:00 PM</option>
                  <option value="18:00">6:00 PM</option>
                  <option value="18:30">6:30 PM</option>
                  <option value="19:00">7:00 PM</option>
                  <option value="19:30">7:30 PM</option>
                  <option value="20:00">8:00 PM</option>
                  <option value="20:30">8:30 PM</option>
                  <option value="21:00">9:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 font-medium">
                  <FaUsers className="inline mr-2 text-blue-500" />
                  Number of Guests
                </label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded"
                  value={guests}
                  onChange={(e) => setGuests(parseInt(e.target.value))}
                  min="1"
                  max="20"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1 text-gray-700 font-medium">
                  Special Requests (optional)
                </label>
                <textarea
                  className="w-full p-2 border rounded"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                  placeholder="Any special requests or dietary restrictions"
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300"
                disabled={bookingLoading}
              >
                {bookingLoading ? "Processing..." : "Book Table"}
              </button>
              
              {!user && (
                <p className="text-sm text-gray-500 mt-2 text-center">
                  You'll need to login before completing your booking
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate("/restaurants")}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded"
        >
          Back to Restaurants
        </button>
      </div>
    </div>
  );
};

export default RestaurantDetails; 