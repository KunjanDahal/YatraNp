import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import TourNav from "../../components/navbar/TourNav";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";

// Fallback tour data for popular destinations not in database
const FALLBACK_TOURS = {
  "seto dada": [
    {
      _id: "fallback-1",
      name: "Seto Dada Adventure",
      duration: "5",
      price: "1998",
      cities: "Seto Dada",
      description: "Experience the beautiful Seto Dada region with expert local guides",
      img: "https://images.pexels.com/photos/2832039/pexels-photo-2832039.jpeg",
      category: "special tours",
      groupCount: 5
    }
  ]
};

// Check if a search term matches any fallback destination (case insensitive)
const getFallbackTours = (searchTerm) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();
  
  // Check exact match first
  if (FALLBACK_TOURS[normalizedSearch]) {
    return FALLBACK_TOURS[normalizedSearch];
  }
  
  // Then check partial matches
  for (const key of Object.keys(FALLBACK_TOURS)) {
    if (key.includes(normalizedSearch) || normalizedSearch.includes(key)) {
      return FALLBACK_TOURS[key];
    }
  }
  
  return null;
};

const image = {
  backgroundImage:
    "url('https://images.pexels.com/photos/950058/pexels-photo-950058.jpeg')",
  height: "300px",
  backgroundPosition: "center",
  backgroundSize: "cover",
};

// Simple error boundary for components that might fail
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

const SerachResults = () => {
  const { destination, duration, maxsize } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [filteredTours, setTour] = useState([]);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/tours");
        
        // Improved search logic to search in both name and cities
        const tours = response.data.filter((tour) => {
          // Search by name (case insensitive)
          const nameMatch = tour.name && 
            tour.name.toLowerCase().includes(destination.toLowerCase());
          
          // Search by cities (case insensitive)
          const citiesMatch = tour.cities && 
            tour.cities.split(",")
              .map(city => city.trim().toLowerCase())
              .includes(destination.toLowerCase());
          
          // Match by duration or group size if those are specified
          const durationMatch = duration && Number(duration) > 0 ? 
            Number(tour.duration) === Number(duration) : false;
            
          const groupSizeMatch = maxsize && Number(maxsize) > 0 ? 
            Number(tour.groupCount) === Number(maxsize) : false;
          
          // Return true if any of the conditions match
          return nameMatch || citiesMatch || durationMatch || groupSizeMatch;
        });

        console.log("Filtered tours:", tours);
        
        // If no results, check our fallback data
        if (tours.length === 0) {
          const fallbackData = getFallbackTours(destination);
          if (fallbackData) {
            setTour(fallbackData);
            setUsedFallback(true);
          } else {
            setTour([]);
          }
        } else {
          setTour(tours);
          setUsedFallback(false);
        }
      } catch (err) {
        console.error("Error fetching tours:", err.message);
        // Try fallback on error too
        const fallbackData = getFallbackTours(destination);
        if (fallbackData) {
          setTour(fallbackData);
          setUsedFallback(true);
        } else {
          setTour([]);
        }
      } finally {
        setLoading(false);
      }
    };
    getTours();
  }, [destination, duration, maxsize]);

  return (
    <div>
      <div className="">
        <div
          className="relative overflow-hidden bg-no-repeat bg-cover"
          style={image}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="flex h-full items-center justify-center text-center relative z-10">
            <div>
              <h2
                className="mb-10 text-6xl font-bold text-white"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bolder",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Search Results
              </h2>
              <div>
                <div className="mt-12 w-3/5 mr-auto ml-auto">
                  <h4
                    className="mt-5 mb-12 text-xl uppercase animate-bounce text-white text-center"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "normal",
                      border: "solid 1px white",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      padding: "20px 40px",
                      letterSpacing: "1px"
                    }}
                  >
                    DISCOVER NEPAL
                  </h4>
                </div>
              </div>
              <div className="mt-8 mb-8 px-4">
                <SearchBar initialDestination={destination} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigated menu start*/}
      <nav className="bg-grey-light w-full rounded-md pl-20 pt-10">
        <ol className="list-reset flex">
          <li>
            <Link
              to={"/"}
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Home
            </Link>
          </li>
          <li>
            <AiOutlineRight className="mt-1 mx-2" />
          </li>
          <li>
            <Link
              to={"/tours/home"}
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Tour Packages
            </Link>
          </li>
          <li>
            <AiOutlineRight className="mt-1 mx-2" />
          </li>
          <li className="text-neutral-500 dark:text-neutral-400">
            Search: {destination}
          </li>
        </ol>
      </nav>
      {/* Navigated menu end*/}
      
      {/* Tour navigation menu */}
      <TourNav />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-4xl mb-10 ml-2">
          Results Found: {filteredTours.length}
        </h1>
        
        {usedFallback && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-8">
            <p className="text-blue-700">
              We don't have exact matches in our database, but we've found some suggested tours for "{destination}".
            </p>
          </div>
        )}
        
        {loading ? (
          <div className="text-center text-lg">
            <div
              className="inline-block h-8 w-8 animate-[spinner-grow_0.75s_linear_infinite] rounded-full bg-current align-[-0.125em] opacity-0 motion-reduce:animate-[spinner-grow_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white">
            {filteredTours.length !== 0 ? (
              <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
                {filteredTours.map((tour) => (
                  <div
                    key={tour._id}
                    className="group relative rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white"
                  >
                    {/* Image section */}
                    <div className="aspect-w-16 aspect-h-9 w-full overflow-hidden">
                      <img
                        src={tour.img ? `http://localhost:5000/api/tours/images/${tour.img}` : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"}
                        alt={tour.name}
                        className="h-64 w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Tour duration badge */}
                      <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-full px-3 py-1 text-sm font-medium text-gray-800">
                        {tour.duration} days
                      </div>
                    </div>
                    
                    {/* Content section */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                        {tour.name}
                      </h3>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-green-600 font-bold">
                          <span className="text-sm">From </span>
                          <span className="text-2xl">Rs.{tour.price}</span>
                        </div>
                        
                        {!tour._id.startsWith('fallback') ? (
                          <Link to={`/tours/${tour._id}`} className="inline-block">
                            <button
                              type="button"
                              className="inline-block rounded bg-blue-600 px-6 py-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800"
                            >
                              EXPLORE
                            </button>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            className="inline-block rounded bg-green-600 px-6 py-3 text-sm font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 hover:shadow-lg focus:bg-green-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-green-800"
                            onClick={() => alert("This is a suggested tour. Contact us to customize this package!")}
                          >
                            Contact Us
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {/* Make entire card clickable */}
                    {!tour._id.startsWith('fallback') && (
                      <Link to={`/tours/${tour._id}`} className="absolute inset-0 z-10" aria-hidden="true" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-lg py-8">
                <p>No matching tours found for "{destination}"</p>
                <p className="text-sm text-gray-500 mt-2">Try searching for a different destination, or adjust your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SerachResults;
