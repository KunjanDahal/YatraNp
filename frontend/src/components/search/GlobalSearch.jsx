import React, { useState } from "react";
import { useSearch } from "../../context/searchContext";
import { FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

/**
 * Global Search Component that can be used across the application
 * @param {string} type - The type of search (tour, hotel, vehicle, restaurant)
 * @param {string} size - The size of the search bar (sm, md, lg)
 * @returns {JSX.Element} - The search component
 */
const GlobalSearch = ({ type = "tour", size = "md" }) => {
  const { updateSearchParams, executeSearch } = useSearch();
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // Define sizes for the search component
  const sizes = {
    sm: "w-44 h-8 text-sm",
    md: "w-64 h-10 text-base",
    lg: "w-96 h-12 text-lg",
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchText.trim()) return;
    
    // Update search params in context
    updateSearchParams({
      destination: searchText.trim(),
      searchType: type
    });
    
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
    <div className="relative">
      <form onSubmit={handleSearch} className="flex items-center">
        <input
          type="text"
          className={`${sizes[size]} px-4 py-2 rounded-l-lg border-2 border-gray-300 focus:outline-none focus:border-primary`}
          placeholder={`Search ${type}s...`}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <button
          type="submit"
          className="bg-primary text-white rounded-r-lg px-4 h-full flex items-center justify-center hover:bg-primary-600 transition duration-200"
        >
          <FaSearch />
        </button>
      </form>
    </div>
  );
};

export default GlobalSearch; 