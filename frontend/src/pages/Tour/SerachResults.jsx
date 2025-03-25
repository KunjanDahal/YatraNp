import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import TourNav from "../../components/navbar/TourNav";
import axios from "axios";

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

const SerachResults = () => {
  const { destination, duration, maxsize } = useParams();

  const [loading, setLoading] = useState(true);
  const [filteredTours, setTour] = useState([]);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/tours");
        
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
                className="mb-5 text-6xl font-bold text-white"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: "bolder",
                  textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                }}
              >
                Search Results
              </h2>
              <div>
                <div className="mt-12 w-1/2 mr-auto ml-auto">
                  <h4
                    className="mt-5 mb-6 text-xl uppercase animate-bounce text-white text-center"
                    style={{
                      fontFamily: "Poppins, sans-serif",
                      fontWeight: "normal",
                      border: "solid 1px white",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
                      padding: "10px"
                    }}
                  >
                    DISCOVER NEPAL
                  </h4>
                </div>
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
                    className="group relative rounded-t-3xl shadow-2xl rounded-b-xl border-2"
                  >
                    <div className="min-h-80 aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-3xl bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                      <img
                        src={tour.img || "https://images.pexels.com/photos/2901209/pexels-photo-2901209.jpeg"}
                        alt={tour.name || "Tour"}
                        className="h-full w-full object-cover object-center rounded-3xl lg:h-full lg:w-full"
                      />
                    </div>
                    <div className="mt-4 flex justify-between p-3">
                      <h3 className="text-2xl font-bold text-gray-700">
                        {!tour._id.startsWith('fallback') ? (
                          <Link to={`/tours/${tour._id}`}>
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-t-3xl"
                            />
                            {tour.name}
                          </Link>
                        ) : (
                          <span>{tour.name}</span>
                        )}
                        <p className="text-lg font-medium text-gray-900">
                          {tour.duration} days
                        </p>
                      </h3>
                    </div>
                    <div className="flex flex-row mr-2 space-x-3 justify-between">
                      <p className="text-sm text-left p-2 font-bold">
                        From ${tour.price}
                      </p>
                      {!tour._id.startsWith('fallback') ? (
                        <button
                          type="button"
                          data-te-ripple-init
                          data-te-ripple-color="light"
                          className="mb-2 inline-block rounded bg-primary px-4 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                        >
                          <Link to={`/tours/${tour._id}`}>View Details</Link>
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-te-ripple-init
                          data-te-ripple-color="light"
                          className="mb-2 inline-block rounded bg-green-600 px-4 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-md transition duration-150 ease-in-out hover:bg-green-700 focus:bg-green-700 focus:outline-none focus:ring-0"
                          onClick={() => alert("This is a suggested tour. Contact us to customize this package!")}
                        >
                          Contact Us
                        </button>
                      )}
                    </div>
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
