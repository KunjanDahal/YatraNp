import React from "react";
import useFetch from "../hooks/useFetch";

const Restaurants = () => {
  const { data, loading, error } = useFetch("/api/restaurant");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Our Restaurants</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.map((restaurant) => (
          <div key={restaurant._id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={restaurant.uploadResimage}
              alt={restaurant.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-2">Type: {restaurant.type}</p>
              <p className="text-gray-600 mb-2">City: {restaurant.city}</p>
              <p className="text-gray-600 mb-2">Capacity: {restaurant.capacity}</p>
              <p className="text-gray-600 mb-2">Price Range: Rs.{restaurant.priceRange}</p>
              <p className="text-gray-600">Contact: {restaurant.contactNo}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Restaurants; 