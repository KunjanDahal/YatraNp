import React, { useState, useEffect, useRef } from "react";
import { RiMapPin5Fill } from "react-icons/ri";
import { BsPeopleFill } from "react-icons/bs";
import { MdAccessTimeFilled } from "react-icons/md";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import axios from "axios";

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

const SearchBar = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [duration, setDays] = useState(0);
  const [maxsize, setGroup] = useState(0);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(false);
  const suggestionRef = useRef(null);

  // Fetch all tours data when component mounts
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/tours");
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
    <div>
      <form action="" className="flex-row items-center text-left gap-4">
        <div className="flex flex-row bg-slate-300 p-10 rounded-3xl opacity-75 drop-shadow-2lg">
          <div className="flex flex-row gap-4 mr-2 relative">
            <div>
              <h6 className="mb-1">Type a Destination</h6>

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
          </div>
          
          <div className="flex flex-row gap-4 mr-2">
            <div>
              <h6 className="mb-1">Select Duration</h6>

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
          </div>
          
          <div className="flex flex-row gap-4 mr-2">
            <div>
              <h6 className="mb-1">Max People</h6>

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
          </div>

          <div className="flex flex-col justify-center mt-5">
            <button
              type="button"
              data-te-ripple-init
              data-te-ripple-color="light"
              className="ml-2 flex items-center rounded-lg bg-primary px-6 py-3 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
              onClick={searchHandler}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="mr-1 h-4 w-4"
              >
                <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.1zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z" />
              </svg>
              EXPLORE
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
