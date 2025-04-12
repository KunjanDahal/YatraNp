import React, { useEffect, useState } from "react";
import { AiFillStar } from "react-icons/ai";
import { Link } from "react-router-dom";
import axios from "axios";
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaRegComment } from "react-icons/fa";

const ServiceCard = () => {
  const [allTours, setTour] = useState([]);
  const [ratings, setRatings] = useState({});
  
  useEffect(() => {
    const getTours = async () => {
      try {
        const response = await axios.get("/api/tours");
        console.log(response.data);
        setTour(response.data);
        
        // Get ratings for each tour
        fetchRatingsForTours(response.data);
      } catch (err) {
        console.log(err.message);
      }
    };
    getTours();
  }, []);
  
  // Fetch ratings for each tour
  const fetchRatingsForTours = async (tours) => {
    try {
      // Initialize with zero ratings
      const emptyRatings = {};
      tours.forEach(tour => {
        emptyRatings[tour._id] = {
          rating: "0.0",
          count: 0
        };
      });
      setRatings(emptyRatings);
      
      // Fetch ratings from API
      const response = await axios.get('/api/tours/reviews/ratings');
      
      if (response.data.status === "success" && response.data.data) {
        // Merge with existing ratings (keeping zeros for tours with no ratings)
        const updatedRatings = { ...emptyRatings, ...response.data.data };
        setRatings(updatedRatings);
      }
    } catch (err) {
      console.log('Error fetching ratings:', err.message);
      // Keep the empty ratings if the API call fails
    }
  };
  
  // Function to format date to relative time (like "2 days ago")
  const getRelativeTime = (dateString) => {
    if (!dateString) return "Recently added";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="bg-white">
      <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {allTours.map((tours) => (
          <div
            key={tours._id}
            className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="relative">
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 rounded-bl-lg z-10 text-sm font-bold">
                {tours.category || "Tour Package"}
              </div>
              <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden bg-gray-200 lg:aspect-none group-hover:opacity-90 lg:h-60">
                <img
                  src={tours.img ? `http://localhost:5000/api/tours/images/${tours.img}` : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
                  alt="Tour"
                  className="h-full w-full object-cover object-center lg:h-full lg:w-full"
                />
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">
                  <Link to={`/tours/${tours._id}`} className="hover:text-blue-600 transition-colors">
                    {tours.name}
                  </Link>
                </h3>
                <div className="flex items-center">
                  {Number(ratings[tours._id]?.rating) > 0 ? (
                    <>
                      <AiFillStar className="text-yellow-500" />
                      <span className="ml-1 text-sm font-semibold">
                        {ratings[tours._id]?.rating}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">New</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm mb-2">
                <FaMapMarkerAlt className="mr-1 text-red-500" />
                <span>{tours.cities || tours.location || "Nepal"}</span>
              </div>
              
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex items-center text-gray-600 text-sm">
                  <FaCalendarAlt className="mr-1 text-blue-500" />
                  <span>{tours.duration} days</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaUsers className="mr-1 text-green-500" />
                  <span>Max {tours.groupCount || "10"} people</span>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <FaRegComment className="mr-1 text-purple-500" />
                  <span>
                    {ratings[tours._id]?.count > 0 ? 
                      `${ratings[tours._id]?.count} ${ratings[tours._id]?.count === 1 ? 'review' : 'reviews'}` : 
                      "No reviews yet"}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex justify-between items-end">
                <div>
                  <p className="text-sm text-gray-500">{getRelativeTime(tours.createdAt)}</p>
                  <p className="text-lg font-bold text-blue-600">
                    Rs. {tours.price}
                  </p>
                </div>
                <Link 
                  to={`/tours/${tours._id}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCard;
