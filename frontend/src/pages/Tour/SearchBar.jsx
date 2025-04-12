import React, { useState, useEffect, useRef } from "react";
import { RiMapPin5Fill } from "react-icons/ri";
import { BsPeopleFill } from "react-icons/bs";
import { MdAccessTimeFilled } from "react-icons/md";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";
import { BiSearch } from "react-icons/bi";

// Fallback popular destinations in Nepal
const POPULAR_DESTINATIONS = [
  "Kathmandu",
  "Pokhara",
  "Chitwan",
  "Lumbini",
  "Nagarkot",
  "Bhaktapur",
  "Seto Dada",
  "Annapurna Base Camp",
  "Everest Base Camp",
  "Mustang",
  "Langtang",
  "Ghorepani",
  "Bandipur"
];

const SearchBar = ({ initialDestination = "" }) => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState(initialDestination);
  const [duration, setDays] = useState(0);
  const [maxsize, setGroup] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const suggestionRef = useRef(null);

  useEffect(() => {
    if (initialDestination && initialDestination !== destination) {
      setDestination(initialDestination);
    }
  }, [initialDestination]);

  // Fetch all tours data when component mounts
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/tours");
        console.log("Fetched tours:", response.data);
        setTours(response.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tours:", error);
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  // Handle clicks outside the suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Generate destination suggestions based on user input
  const handleDestinationChange = (e) => {
    const value = e.target.value;
    setDestination(value);

    if (value.trim() === "") {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Filter tours that match the input query
    const filteredSuggestions = [];
    
    // First search through name property
    tours.forEach(tour => {
      if (tour.name && tour.name.toLowerCase().includes(value.toLowerCase())) {
        if (!filteredSuggestions.includes(tour.name)) {
          filteredSuggestions.push(tour.name);
        }
      }
    });
    
    // Then search through cities if available
    tours.forEach(tour => {
      if (tour.cities) {
        const tourCities = tour.cities.split(',').map(city => city.trim());
        tourCities.forEach(city => {
          if (city.toLowerCase().includes(value.toLowerCase()) && !filteredSuggestions.includes(city)) {
            filteredSuggestions.push(city);
          }
        });
      }
    });

    // Add fallback popular destinations that match the query
    POPULAR_DESTINATIONS.forEach(dest => {
      if (dest.toLowerCase().includes(value.toLowerCase()) && !filteredSuggestions.includes(dest)) {
        filteredSuggestions.push(dest);
      }
    });

    setSuggestions(filteredSuggestions);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion) => {
    setDestination(suggestion);
    setShowSuggestions(false);
  };

  const searchHandler = async (e) => {
    e.preventDefault();
    if (destination === "" || duration === 0 || maxsize === 0) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Missing required fields!",
      });
      return;
    }
    const numericValue = Number(destination);
    if (!isNaN(numericValue)) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Cannot input numbers to Destination!",
      });
      return;
    }
    navigate(`/tours/search/${destination}/${duration}/${maxsize}`);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 rounded-xl bg-white/80 backdrop-blur-sm p-6 shadow-lg">
        <div className="relative w-full md:w-1/3">
          <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
            Type a Destination
          </label>
          <div className="relative mb-3" data-te-input-wrapper-init ref={suggestionRef}>
            <RiMapPin5Fill className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 px-10 py-[0.32rem] leading-[1.6] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              id="destinationInput"
              placeholder="Where are you going?"
              value={destination}
              onChange={handleDestinationChange}
              autoComplete="off"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => selectSuggestion(suggestion)}
                  >
                    {suggestion}
                    {POPULAR_DESTINATIONS.includes(suggestion) && !tours.some(tour => 
                      tour.name === suggestion || 
                      (tour.cities && tour.cities.split(',').map(city => city.trim()).includes(suggestion))
                    ) && (
                      <span className="ml-2 text-xs text-blue-600">(Suggested)</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="relative w-full md:w-1/3">
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
            Select Duration
          </label>
          <div className="relative mb-3" data-te-input-wrapper-init>
            <MdAccessTimeFilled className="absolute top-3 left-3 text-gray-500" />
            <input
              type="Number"
              className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 px-10 py-[0.32rem] leading-[1.6] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              id="durationInput"
              placeholder="Days Count"
              min="1"
              onChange={(e) => {
                setDays(e.target.value);
              }}
            />
          </div>
        </div>
        
        <div className="relative w-full md:w-1/3">
          <label htmlFor="groupSize" className="block text-sm font-medium text-gray-700 mb-2">
            Max People
          </label>
          <div className="relative mb-3" data-te-input-wrapper-init>
            <BsPeopleFill className="absolute top-3 left-3 text-gray-500" />
            <input
              type="Number"
              className="peer block min-h-[auto] w-full rounded-lg border border-gray-300 px-10 py-[0.32rem] leading-[1.6] outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              id="groupSizeInput"
              placeholder="Group Size"
              min="1"
              onChange={(e) => {
                setGroup(e.target.value);
              }}
            />
          </div>
        </div>

        <button
          type="button"
          className="mt-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg transition-colors duration-300"
          onClick={searchHandler}
        >
          <span className="flex items-center justify-center">
            <BiSearch className="mr-2" size={20} />
            EXPLORE
          </span>
        </button>
      </div>
    </div>
  );
};

export default SearchBar;
