import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaCalendarAlt, FaUsers, FaUtensils, FaUserAlt, FaEnvelope, FaPhone, FaCheck, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const RestaurantReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [filter, setFilter] = useState("ALL"); // ALL, PENDING, APPROVED, DECLINED

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/restaurants/restaurantReservations");
        console.log("Reservation data:", response.data);
        setReservations(response.data);
        setFilteredReservations(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        setError("Failed to load reservations");
        setLoading(false);
      }
    };

    fetchReservations();
  }, []);

  useEffect(() => {
    if (filter === "ALL") {
      setFilteredReservations(reservations);
    } else {
      setFilteredReservations(reservations.filter(reservation => 
        reservation.status === filter
      ));
    }
  }, [filter, reservations]);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/restaurants/restaurantReservations/${id}/approve`);
      
      // Update the local state
      setReservations(reservations.map(reservation => 
        reservation._id === id 
          ? { ...reservation, status: "APPROVED" } 
          : reservation
      ));
      
      Swal.fire({
        title: "Success!",
        text: "Reservation has been approved",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error approving reservation:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to approve reservation",
        icon: "error"
      });
    }
  };

  const handleDecline = async (id) => {
    try {
      await axios.put(`/api/restaurants/restaurantReservations/${id}/decline`);
      
      // Update the local state
      setReservations(reservations.map(reservation => 
        reservation._id === id 
          ? { ...reservation, status: "DECLINED" } 
          : reservation
      ));
      
      Swal.fire({
        title: "Success!",
        text: "Reservation has been declined",
        icon: "success",
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) {
      console.error("Error declining reservation:", err);
      Swal.fire({
        title: "Error",
        text: "Failed to decline reservation",
        icon: "error"
      });
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "PENDING": return "bg-yellow-100 text-yellow-800";
      case "APPROVED": return "bg-green-100 text-green-800";
      case "DECLINED": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="bg-red-100 p-4 rounded-lg inline-block">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Restaurant Reservations</h1>
        <Link to="/restaurant" className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
          Back to Restaurants
        </Link>
      </div>

      {/* Filter buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setFilter("ALL")}
          className={`px-4 py-2 rounded ${filter === "ALL" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          All
        </button>
        <button 
          onClick={() => setFilter("PENDING")}
          className={`px-4 py-2 rounded ${filter === "PENDING" ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Pending
        </button>
        <button 
          onClick={() => setFilter("APPROVED")}
          className={`px-4 py-2 rounded ${filter === "APPROVED" ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Approved
        </button>
        <button 
          onClick={() => setFilter("DECLINED")}
          className={`px-4 py-2 rounded ${filter === "DECLINED" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-800"}`}
        >
          Declined
        </button>
      </div>

      {filteredReservations.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <FaCalendarAlt className="text-4xl mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600 text-lg">No restaurant reservations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredReservations.map((reservation) => (
            <div key={reservation._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 flex justify-between items-center">
                <div className="flex items-center">
                  <FaUtensils className="text-blue-500 mr-2" />
                  <h3 className="font-semibold text-lg">{reservation.restaurantName || "Restaurant"}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </div>
              
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-start">
                    <FaCalendarAlt className="text-blue-500 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Reservation Date</p>
                      <p className="font-medium">{formatDate(reservation.reservationDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FaUsers className="text-blue-500 mt-1 mr-2" />
                    <div>
                      <p className="text-sm text-gray-500">Number of Guests</p>
                      <p className="font-medium">{reservation.guests}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <h4 className="font-medium mb-2">Customer Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <FaUserAlt className="text-blue-500 mt-1 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p>{reservation.userName}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <FaEnvelope className="text-blue-500 mt-1 mr-2" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="overflow-hidden text-ellipsis">{reservation.userEmail}</p>
                      </div>
                    </div>
                    
                    {reservation.userPhone && (
                      <div className="flex items-start">
                        <FaPhone className="text-blue-500 mt-1 mr-2" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p>{reservation.userPhone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {reservation.notes && (
                  <div className="border-t border-gray-100 pt-4 mb-4">
                    <h4 className="font-medium mb-2">Special Requests</h4>
                    <p className="text-gray-700">{reservation.notes}</p>
                  </div>
                )}
                
                {reservation.status === "PENDING" && (
                  <div className="border-t border-gray-100 pt-4 flex justify-between">
                    <button
                      onClick={() => handleApprove(reservation._id)}
                      className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded flex items-center"
                    >
                      <FaCheck className="mr-1" /> Approve
                    </button>
                    <button
                      onClick={() => handleDecline(reservation._id)}
                      className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded flex items-center"
                    >
                      <FaTimes className="mr-1" /> Decline
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantReservations; 