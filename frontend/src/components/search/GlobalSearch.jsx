import React, { useState, useEffect } from "react";
import { useSearch } from "../../context/searchContext";
import { FaSearch } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

/**
 * Global Search Component that can be used across the application
 * @param {string} type - The type of search (tour, hotel, vehicle, restaurant)
 * @param {string} size - The size of the search bar (sm, md, lg)
 * @param {string} initialValue - Optional initial value for the search text
 * @returns {JSX.Element} - The search component
 */
const GlobalSearch = ({ type = "tour", size = "md", initialValue = "" }) => {
  // Get search context safely - may be undefined if not wrapped in SearchProvider
  const searchContext = useSearch();
  const navigate = useNavigate();
  const params = useParams();
  const [searchText, setSearchText] = useState(initialValue);

  // If the component is used on a search results page, initialize with the current search term
  useEffect(() => {
    if (params.destination && !searchText) {
      setSearchText(params.destination);
    }
  }, [params.destination, searchText]);

  // Define sizes for the search component
  const sizes = {
    sm: "w-44 h-8 text-sm",
    md: "w-64 h-10 text-base",
    lg: "w-full h-12 text-lg",
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchText.trim()) return;
    
    // Update search params in context if available
    if (searchContext && searchContext.updateSearchParams) {
      searchContext.updateSearchParams({
        destination: searchText.trim(),
        searchType: type
      });
    }
    
    // Navigate to appropriate search page
    switch (type) {
      case "tour":
        navigate(`/tours/search/${searchText}/0/0`);
        break;
      case "hotel":
        navigate(`/hotels/search/${searchText}/0/0`);
        break;
      case "vehicle":
        navigate(`/vehicles/search/${searchText}/0/0`);
        break;
      case "restaurant":
        navigate(`/restaurants/search/${searchText}/0/0`);
        break;
      default:
        navigate(`/tours/search/${searchText}/0/0`);
    }
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="flex items-center w-full">
        <input
          type="text"
          className={`${sizes[size]} px-4 py-2 rounded-l-lg border-2 border-gray-300 focus:outline-none focus:border-primary w-full`}
          placeholder={`Search ${type}s...`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-r-lg px-6 py-2 h-full flex items-center justify-center transition duration-200"
        >
          <FaSearch className="mr-2" /> Search
        </button>
      </form>
    </div>
  );
};

export default GlobalSearch; 