import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useFetch from "../hooks/useFetch";
import RestaurantSearchBar from "../components/restaurant/RestaurantSearchBar";

const Restaurants = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchResults = location.state?.data;
  
  // Only fetch all restaurants if there are no search results
  const { data, loading, error } = useFetch(searchResults ? "" : "/api/restaurant");
  
  // Use either search results or fetched data
  const restaurants = searchResults || data;

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
  
  if (error) return (
    <div className="container mx-auto px-4 py-8 text-center">
      <div className="bg-red-100 p-4 rounded-lg inline-block">
        <p className="text-red-700">Error: {error}</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Restaurants</h1>
      
      {/* Add the dedicated restaurant search bar */}
      <RestaurantSearchBar />
      
      {/* Display search result message if coming from search */}
      {searchResults && (
        <div className="my-4 text-center">
          <p className="text-gray-600">
            Found {searchResults.length} restaurant{searchResults.length !== 1 ? 's' : ''} matching your search criteria
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {restaurants?.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-lg shadow-md overflow-hidden transform transition duration-300 hover:scale-105 hover:shadow-xl">
              <img
                src={restaurant.uploadResimage || 'https://via.placeholder.com/300x200?text=Restaurant+Image'}
                alt={restaurant.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=No+Image+Available';
                }}
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
                <div className="flex flex-col gap-1 text-gray-600">
                  <p className="flex items-center">
                    <span className="font-medium w-24">Type:</span> 
                    <span className="capitalize">{restaurant.restaurantType || 'Not specified'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Location:</span> 
                    <span className="font-semibold text-gray-700">{restaurant.city || 'Not specified'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Capacity:</span> 
                    <span>{restaurant.capacity || 'Not specified'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Price Range:</span> 
                    <span>Rs.{restaurant.priceRange || 'Not specified'}</span>
                  </p>
                  <p className="flex items-center">
                    <span className="font-medium w-24">Contact:</span> 
                    <span>{restaurant.contactNo || 'Not available'}</span>
                  </p>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition duration-300"
                    onClick={() => {
                      console.log("Navigating to restaurant details:", restaurant._id);
                      navigate(`/restaurant/${restaurant._id}`);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <p className="text-gray-500 text-lg">No restaurants found</p>
            <p className="text-gray-400 mt-2">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Restaurants; 