import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import HeroTour from "./HeroTour";
import TourNav from "../../components/navbar/TourNav";
import { AiFillStar, AiOutlineCalendar, AiOutlineTrophy, AiOutlineUser, AiOutlineGlobal } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { MdOutlineLocationOn } from "react-icons/md";
import DaysShow from "../../components/Tour/DaysShow";
import InclusionExclusion from "../../components/Tour/InclusionExclusion";
import { AuthContext } from "../../context/authContext";
import TourKhaltiPayment from "../../components/payment/TourKhaltiPayment";
import Swal from "sweetalert2";
import axios from "axios";

const TourDetails = () => {
  const { id } = useParams();
  const [showPayment, setShowPayment] = useState(false);
  const [firstName, setFname] = useState("");
  const [lastName, setLname] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuests] = useState("");
  const [allTours, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // get email of current user
  const { user } = useContext(AuthContext);
  const currentUser = user?.email;

  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tours/${id}`);
        console.log(response.data.data.oneTour);
        setTour(response.data.data.oneTour);
      } catch (err) {
        console.log(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load tour details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    getTours();
  }, [id]);

  const validateBookingForm = () => {
    if (!firstName || !lastName || !date || !phone || !guestCount) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Information",
        text: "Please fill in all required fields.",
      });
      return false;
    }

    if (phone.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit mobile number.",
      });
      return false;
    }

    if (allTours && Number(guestCount) > allTours.groupCount) {
      Swal.fire({
        icon: "error",
        title: "Group Size Exceeded",
        text: `This tour can have a maximum of ${allTours.groupCount} members.`,
      });
      return false;
    }
    
    return true;
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    
    if (!validateBookingForm()) {
      return;
    }
    
    // Instead of directly submitting, show payment component
    setShowPayment(true);
  };
  
  // Prepare booking data for payment
  const bookingData = {
    firstName,
    lastName,
    date,
    phone,
    guestCount,
    email: currentUser
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* import upper section */}
      <HeroTour />
      <TourNav />
      
      {/* details brief */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        {/* title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{allTours?.name}</h1>
          
          {/* Location + ID */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {allTours?.cities && (
              <div className="flex items-center text-gray-600">
                <MdOutlineLocationOn className="text-xl mr-1 text-blue-600" />
                <span>{allTours.cities}</span>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Tour ID: {allTours?._id?.substring(0, 8) || "T0027"}
            </div>
          </div>
        </div>

        {/* Tour info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <BiCategory className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Category</h3>
            </div>
            <p className="text-lg">{allTours?.category || "Adventure"}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineCalendar className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Duration</h3>
            </div>
            <p className="text-lg">{allTours?.duration || "0"} days</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineTrophy className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Rating</h3>
            </div>
            <div className="flex items-center">
              <p className="text-lg mr-1">4.8</p>
              <AiFillStar className="text-yellow-500 text-xl" />
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineUser className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Group Size</h3>
            </div>
            <p className="text-lg">Max {allTours?.groupCount || "10"}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineGlobal className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Languages</h3>
            </div>
            <p className="text-lg">{allTours?.languages || "English"}</p>
          </div>
        </div>

        {/* Main content - image, details, booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Tour image and actions */}
          <div>
            <div className="rounded-xl overflow-hidden shadow-md mb-6">
              <img
                src={allTours?.img ? `http://localhost:5000/api/tours/images/${allTours.img}` : "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={allTours?.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
          
          {/* Right column: Booking and payment */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            {!showPayment ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-600 font-medium">Starting From</p>
                      <p className="text-3xl font-bold text-blue-600">
                        NPR {allTours?.price || "0"}
                        <span className="text-sm text-gray-500 font-normal">/person</span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      <AiFillStar className="text-yellow-500 text-xl" />
                      <span className="ml-1 font-medium">4.8</span>
                      <span className="ml-1 text-gray-500 text-sm">(24 reviews)</span>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold mb-4">Reserve Your Spot</h3>
                    <form onSubmit={handleBookNow}>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">First Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={firstName}
                            onChange={(e) => setFname(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Last Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={lastName}
                            onChange={(e) => setLname(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-1 text-sm font-medium">Tour Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split("T")[0]}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Phone Number</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Number of Guests</label>
                          <input
                            type="number"
                            min="1"
                            max={allTours?.groupCount || 10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={guestCount}
                            onChange={(e) => setGuests(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4 bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-700">
                          By proceeding, you'll be redirected to a secure payment page after form submission.
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4">Complete Your Booking</h3>
                <TourKhaltiPayment 
                  tourData={allTours} 
                  bookingData={bookingData} 
                  user={user} 
                />
                <button 
                  onClick={() => setShowPayment(false)}
                  className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Booking Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Description</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            {allTours?.description}
          </p>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Tour Overview</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            {allTours?.introduction}
          </p>
        </div>
      </div>

      {/* Daily Itinerary */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Daily Itinerary</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <DaysShow />
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">What's Included</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <InclusionExclusion />
        </div>
      </div>
    </div>
  );
};

export default TourDetails;