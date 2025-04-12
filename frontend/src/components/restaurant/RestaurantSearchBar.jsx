import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { BiSearchAlt2 } from "react-icons/bi";
import { FaUtensils, FaMapMarkerAlt } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from 'axios';

// Configure axios base URL
axios.defaults.baseURL = 'http://localhost:5000';

const RestaurantSearchBar = () => {
  const [city, setCity] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // Fetch restaurants when search is clicked
  useEffect(() => {
    const fetchRestaurants = async () => {
      if (!searchClicked) return;
      
      try {
        setLoading(true);
        
        // Build endpoint for restaurant search
        let endpoint = '/api/restaurant';
        
        if (city) {
          endpoint = `/api/restaurant/city/${city}`;
        }
        
        console.log(`Searching for restaurants with endpoint: ${endpoint}`);
        const response = await axios.get(endpoint);
        
        if (!response.data) {
          throw new Error(`No restaurants found`);
        }
        
        let filteredData = response.data;
        
        // Client-side filtering for cuisine type if provided
        if (cuisineType) {
          filteredData = filteredData.filter(
            restaurant => restaurant.type && restaurant.type.toLowerCase() === cuisineType.toLowerCase()
          );
        }
        
        setLoading(false);
        setSearchClicked(false);
        
        if (filteredData && filteredData.length > 0) {
          navigate('/restaurants', { state: { data: filteredData } });
        } else {
          Swal.fire({
            icon: "info",
            title: "No Restaurants Found",
            text: `No restaurants found${city ? ` in ${city}` : ''}${cuisineType ? ` with cuisine type ${cuisineType}` : ''}. Try adjusting your search criteria.`
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
    };
    
    fetchRestaurants();
  }, [searchClicked, city, cuisineType, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!city && !cuisineType) {
      Swal.fire({
        icon: "warning",
        title: "Search Criteria Required",
        text: "Please enter at least one search criteria"
      });
      return;
    }
    
    setSearchClicked(true);
  };

  return (
    <div className="bg-white mt-4 px-8 shadow-lg max-w-[1240px] p-4 rounded-lg mb-8">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="flex items-center mb-2 text-gray-700">
            <FaMapMarkerAlt className="text-red-500 mr-2" />
            City
          </label>
          <select
            className="w-full p-3 border rounded-md"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="">Select Location</option>
            <option value="kathmandu">Kathmandu</option>
            <option value="lalitpur">Lalitpur</option>
            <option value="bhaktapur">Bhaktapur</option>
            <option value="pokhara">Pokhara</option>
            <option value="chitwan">Chitwan</option>
            <option value="kaski">Kaski</option>
            <option value="rupandehi">Rupandehi</option>
            <option value="banke">Banke</option>
            <option value="parsa">Parsa</option>
            <option value="morang">Morang</option>
            <option value="sunsari">Sunsari</option>
            <option value="jhapa">Jhapa</option>
            <option value="kailali">Kailali</option>
            <option value="dang">Dang</option>
            <option value="kavre">Kavre</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label className="flex items-center mb-2 text-gray-700">
            <FaUtensils className="text-green-600 mr-2" />
            Cuisine Type
          </label>
          <select
            className="w-full p-3 border rounded-md"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="nepali">Nepali</option>
            <option value="indian">Indian</option>
            <option value="chinese">Chinese</option>
            <option value="korean">Korean</option>
            <option value="italian">Italian</option>
            <option value="japanese">Japanese</option>
            <option value="thai">Thai</option>
            <option value="mexican">Mexican</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            type="submit"
            className="py-3 px-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center shadow-lg"
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
};

export default RestaurantSearchBar; 