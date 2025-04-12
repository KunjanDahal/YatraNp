import React,{ useContext, useEffect, useState }  from 'react'
import { useLocation, useNavigate} from 'react-router-dom';
import { BiSearchAlt2 } from "react-icons/bi";
import useFetch from '../../hooks/useFetch';
import Swal from "sweetalert2";
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

export const HotelSearchBar = ({type}) => {
  const [city, setDestination] = useState("");
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");

  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in yyyy-mm-dd format
  const tomorrowDate = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]; //get tomorrow date
  const [searchClicked, setSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const date = {checkInDate, checkOutDate}
  const navigate = useNavigate();
  const location = useLocation();
  
  // Fetch hotels when search is clicked
  useEffect(() => {
    const fetchHotels = async () => {
      if (searchClicked && city) {
        try {
          setLoading(true);
          // Ensure we're searching by city name, not hotel name
          const cityName = city.toLowerCase().includes('hotel') ? 
            city.split(' ').filter(word => !word.toLowerCase().includes('hotel')).join(' ') : 
            city;
            
          console.log(`Searching for hotels in city: ${cityName}`);
          const response = await axios.get(`/api/hotels/get/${cityName}`);
          
          if (!response.data) {
            throw new Error(`No hotels found in ${cityName}`);
          }
          
          const data = response.data;
          setLoading(false);
          setSearchClicked(false);
          
          if (data && data.length > 0) {
            navigate('/hotelhome', { state: { date, data } });
          } else {
            Swal.fire({
              icon: "info",
              title: "No Hotels Found",
              text: `No hotels found in ${cityName}. Try searching for a city name (e.g., "Kathmandu" instead of "Hotel Annapurna").`
            });
          }
        } catch (error) {
          setLoading(false);
          setSearchClicked(false);
          console.error("Search error:", error);
          Swal.fire({
            icon: "error",
            title: "Search Failed",
            text: error.response ? error.response.data.message : error.message
          });
        }
      }
    };
    
    fetchHotels();
  }, [searchClicked, city, navigate, date]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!city) {
      Swal.fire({
        icon: "error",
        title: "City Required",
        text: "Please enter a city name (e.g., Kathmandu, Pokhara)"
      });
      return;
    }
    
    if (!checkInDate || !checkOutDate) {
      Swal.fire({
        icon: "error",
        title: "Dates Required",
        text: "Please select both check-in and check-out dates"
      });
      return;
    }
    
    // Validate dates
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    
    if (checkOut <= checkIn) {
      Swal.fire({
        icon: "error",
        title: "Invalid Dates",
        text: "Check-out date must be after check-in date"
      });
      return;
    }
    
    setSearchClicked(true);
  };

  return (
    <div className="bg-white mt-4 lg:mt-[0px] px-8 shadow-lg max-w-[1240px] p-4 lg:text-left text-center h-full items-center mx-auto rounded-lg">
      <form className="flex flex-col lg:flex-row justify-between px-4">
        <div className="flex flex-col">
          <label htmlFor="Location" className="py-3 ml-5">
            City Name
          </label>
          <input
            type="text"
            className="border rounded-md p-3 lg:w-[300px] w-full"
            placeholder="Enter city name (e.g., Kathmandu)"
            value={city}
            onChange={(e) => setDestination(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="checkInDate" className="py-3 ml-5">
            Check-In Date
          </label>
          <input
            type="date"
            min={currentDate} 
            className="border rounded-md p-3 w-full"
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="checkOutDate" className="py-3 ml-5">
            Check-Out Date
          </label>
          <input 
            type="date" 
            className="border rounded-md p-3 w-full"
            min={checkInDate || tomorrowDate}
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.target.value)} 
          />
        </div>

        <div className="flex flex-col justify-end mb-4 lg:mb-0">
          <button
            type="button"
            className="py-3 px-6 mt-7 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out flex items-center justify-center shadow-lg"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? (
              "Searching..."
            ) : (
              <>
                <BiSearchAlt2 className="mr-2" />
                SEARCH
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
