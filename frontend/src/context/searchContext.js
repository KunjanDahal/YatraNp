import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Create a context for search
const SearchContext = createContext();

// Custom hook to use the search context
export const useSearch = () => {
  return useContext(SearchContext);
};

// Provider component
export const SearchProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // State for search parameters
  const [searchParams, setSearchParams] = useState({
    destination: '',
    duration: 0,
    maxPeople: 0,
    searchType: 'tour', // Default search type (tour, hotel, vehicle, restaurant)
  });

  // Function to update search parameters
  const updateSearchParams = (params) => {
    setSearchParams((prev) => ({ ...prev, ...params }));
  };

  // Function to execute search based on current parameters
  const executeSearch = () => {
    // Validate search parameters
    if (!searchParams.destination && searchParams.duration === 0 && searchParams.maxPeople === 0) {
      console.error('At least one search parameter is required');
      return;
    }

    // Route to appropriate search page based on search type
    switch (searchParams.searchType) {
      case 'tour':
        navigate(`/tours/search/${searchParams.destination}/${searchParams.duration}/${searchParams.maxPeople}`);
        break;
      case 'hotel':
        navigate(`/hotels/search/${searchParams.destination}/${searchParams.duration}/${searchParams.maxPeople}`);
        break;
      case 'vehicle':
        navigate(`/vehicles/search/${searchParams.destination}/${searchParams.duration}/${searchParams.maxPeople}`);
        break;
      case 'restaurant':
        navigate(`/restaurants/search/${searchParams.destination}/${searchParams.duration}/${searchParams.maxPeople}`);
        break;
      default:
        navigate(`/tours/search/${searchParams.destination}/${searchParams.duration}/${searchParams.maxPeople}`);
    }
  };

  // Value object to be provided to consumers
  const value = {
    searchParams,
    updateSearchParams,
    executeSearch,
    setSearchType: (type) => updateSearchParams({ searchType: type }),
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchContext; 