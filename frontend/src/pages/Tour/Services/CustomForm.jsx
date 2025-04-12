import React, { useState, useContext } from "react";
import { FaMapMarkerAlt, FaCalendarAlt, FaPhoneAlt, FaUsers, FaPaperPlane } from "react-icons/fa";
import { BsArrowRight, BsChatSquareText, BsCheckCircle } from "react-icons/bs";
import Swal from "sweetalert2";
import axios from "axios";
import { AuthContext } from "../../../context/authContext";

const CustomForm = () => {
  const [whereFrom, setFrom] = useState("");
  const [whereTo, setTo] = useState("");
  const [days, setDays] = useState("");
  const { user } = useContext(AuthContext);

  const inputHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      Swal.fire({
        icon: "error",
        title: "Login Required",
        text: "Please log in to submit a custom tour request",
      });
      return;
    }

    const currentUser = user.email;

    if (whereFrom === "" || whereTo === "" || days === "") {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Must fill all fields!",
      });
      return;
    } else {
      const newForm = {
        currentUser,
        whereFrom,
        whereTo,
        days,
      };

      try {
        const result = await Swal.fire({
          title: "Submit Custom Tour Request?",
          text: "Our travel experts will contact you soon!",
          icon: "question",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, Submit Request"
        });

        if (result.isConfirmed) {
          const response = await axios.post("/api/tours/customform", newForm);
          Swal.fire({
            icon: "success",
            title: "Request Submitted!",
            text: response.data.message || "We'll contact you soon with personalized tour options.",
            confirmButtonColor: "#3085d6",
          });
          
          // Reset form after successful submission
          setFrom("");
          setTo("");
          setDays("");
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: err.message || "Something went wrong. Please try again.",
        });
      }
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 bg-white rounded-xl shadow-xl overflow-hidden">
        {/* How It Works Section - 2 columns */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-blue-400 text-white p-8">
          <h2 className="text-2xl font-bold mb-8 border-b border-blue-300 pb-4 text-white">How It Works</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                1
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Share Your Travel Details</h3>
                <p className="opacity-90">Tell us where you want to go and for how long</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                2
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Expert Consultation</h3>
                <p className="opacity-90">Our travel specialists will contact you</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                3
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Customize Your Itinerary</h3>
                <p className="opacity-90">Fine-tune your trip until it's perfect</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-white text-blue-600 rounded-full h-8 w-8 flex items-center justify-center">
                4
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Enjoy Your Adventure</h3>
                <p className="opacity-90">Experience Nepal with confidence</p>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-blue-300">
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <FaUsers size={24} />
                </div>
                <p className="font-bold text-xl">200+</p>
                <p className="text-sm">Verified Agents</p>
              </div>
              
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <BsCheckCircle size={24} />
                </div>
                <p className="font-bold text-xl">24/7</p>
                <p className="text-sm">Availability</p>
              </div>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <FaPhoneAlt size={14} />
                <span className="font-semibold">Call us for details</span>
              </div>
              <p className="text-lg font-medium">0112224448 / 0112224449</p>
              <p className="text-xs mt-2">200+ Agents | 5M+ Travelers | 80+ Destinations</p>
            </div>
          </div>
        </div>
        
        {/* Custom Tour Form - 3 columns */}
        <div className="lg:col-span-3 p-8">
          <div className="flex items-center mb-8">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <BsChatSquareText className="text-blue-600 text-2xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Request Your Custom Tour</h2>
          </div>
          
          <form className="space-y-6" onSubmit={inputHandler}>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Starting Point</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Where are you traveling from?"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={whereFrom}
                  onChange={(e) => setFrom(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Destination</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Where in Nepal do you want to visit?"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={whereTo}
                  onChange={(e) => setTo(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">Trip Duration (Days)</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendarAlt className="text-gray-400" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="30"
                  placeholder="How many days will you be traveling?"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <FaPaperPlane />
                <span>Send Request</span>
                <BsArrowRight className="ml-2" />
              </button>
              
              <p className="text-center text-sm text-gray-500 mt-4">
                Our travel experts will get back to you within 24 hours
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CustomForm;
