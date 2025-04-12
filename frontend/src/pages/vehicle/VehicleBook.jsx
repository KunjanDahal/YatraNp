import React, {useState, useEffect, useContext} from "react";
import axios from "axios";
import {useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { FaCar, FaCalendarAlt, FaMapMarkerAlt, FaUser, FaGasPump, FaCheck, FaTimes } from "react-icons/fa";
import { MdAirlineSeatReclineNormal, MdLocalCarWash } from "react-icons/md";
import KhaltiPayment from "../../components/payment/KhaltiPayment";
import { AuthContext } from "../../context/authContext";

const VehicleBook = () => {
    const { user } = useContext(AuthContext);
    const [data, setData] = useState({}); 
    const [reserveData, setReserveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const [showPayment, setShowPayment] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const today = new Date().toISOString().slice(0, 10);  
  
    const [pickupDate, setPickupDate] = useState(today);
    const [returnDate, setReturnDate] = useState(today);
    const [driver, setDriver] = useState(false);

    const { id } = useParams();

    useEffect(() => {
      // Redirect to login if user is not logged in
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      
      const fetchData = async () => {
        const apiErrors = [];
        
        try {
          setLoading(true);
          
          // Log the vehicle ID to check if it's valid
          console.log("Fetching vehicle with ID:", id);
          
          // Using correct endpoint based on VehicleHome.jsx: /api/vehicle (not vehicles)
          const vehicleResponse = await axios.get(`/api/vehicle/${id}`);
          console.log("Vehicle API response:", vehicleResponse);
          
          // Check if the vehicle data is properly structured
          let vehicleData;
          if (vehicleResponse.data.data) {
            vehicleData = vehicleResponse.data.data;
          } else if (vehicleResponse.data.vehicle) {
            vehicleData = vehicleResponse.data.vehicle;
          } else {
            vehicleData = vehicleResponse.data;
          }
          
          setData(vehicleData);
          setDebugInfo(prev => ({...prev, apiEndpoint: `/api/vehicle/${id}`, data: vehicleData}));
          console.log("Processed vehicle data:", vehicleData);
          
          try {
            // Fetch reservations with the corrected endpoint
            const reservationResponse = await axios.get(`/api/vehiclereservation/traveler/vehicles/${id}`);
            console.log("Reservation API response:", reservationResponse);
            
            // modify the reservation data format to match the input type of date fields
            const formattedReservationData = reservationResponse.data.map(reservation => ({
              ...reservation,
              pickupDate: new Date(reservation.pickupDate).toISOString().slice(0, 10),
              returnDate: new Date(reservation.returnDate).toISOString().slice(0, 10),
            }));
            
            setReserveData(formattedReservationData);
          } catch (reservationError) {
            console.error("Error fetching reservations (non-critical):", reservationError);
            apiErrors.push(`Reservation API: ${reservationError.message}`);
            // Continue without reservations data - this is not critical
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error fetching vehicle data:", error);
          apiErrors.push(`Main API (/api/vehicle/${id}): ${error.message}`);
          
          // Try getting all vehicles and find the one with matching ID
          try {
            const allVehiclesResponse = await axios.get(`/api/vehicle`);
            console.log("All vehicles response:", allVehiclesResponse);
            
            if (allVehiclesResponse.data && Array.isArray(allVehiclesResponse.data)) {
              // Find the vehicle by ID
              const foundVehicle = allVehiclesResponse.data.find(v => v._id === id);
              
              if (foundVehicle) {
                console.log("Found vehicle in all vehicles:", foundVehicle);
                setData(foundVehicle);
                setDebugInfo(prev => ({...prev, apiEndpoint: '/api/vehicle (all)', data: foundVehicle}));
                setLoading(false);
                return;
              } else {
                apiErrors.push("Vehicle not found in the complete vehicle list");
              }
            }
          } catch (allVehiclesError) {
            console.error("Error fetching all vehicles:", allVehiclesError);
            apiErrors.push(`All vehicles API: ${allVehiclesError.message}`);
          }
          
          setDebugInfo(prev => ({...prev, errors: apiErrors, vehicleId: id}));
          setError(`Vehicle not found. Please verify the vehicle ID or return to the vehicle list.`);
          setLoading(false);
        }
      };
      
      fetchData();
    }, [id, user, navigate, location]);

    const calculateTotalDays = () => {
      if (!pickupDate || !returnDate) return 0;
      
      const start = new Date(pickupDate);
      const end = new Date(returnDate);
      
      // Calculate the difference in milliseconds
      const diffTime = Math.abs(end - start);
      
      // Convert to days and add 1 (to include the pickup day)
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    };
    
    const calculateTotalPrice = () => {
      const days = calculateTotalDays();
      const basePrice = data.price || 0;
      const driverCost = driver ? 1500 : 0; // Example driver cost per day
      
      return (basePrice * days) + (driverCost * days);
    };

    const handleReserveClick = (e) => {
      e.preventDefault();
      
      // Make sure user is logged in
      if (!user) {
        navigate("/login", { state: { from: location.pathname } });
        return;
      }
      
      setShowPayment(true);
    };
    
    const handlePaymentSuccess = (paymentData) => {
      console.log("Payment successful:", paymentData);
      
      // Here you would typically save the reservation to your database
      navigate("/vehicle/payment-success", { 
        state: { 
          vehicleData: data, 
          bookingDetails: {
            pickupDate,
            returnDate,
            driver,
            fullName: user.name,
            email: user.email,
            phone: user.phone || "",
            totalPrice: calculateTotalPrice()
          } 
        } 
      });
    };
    
    const handlePaymentError = (error) => {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen flex-col p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
        
        <div className="flex gap-4 mt-4">
          <button 
            onClick={() => navigate('/vehicles')}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View All Vehicles
          </button>
          
          <Link 
            to="/"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Return Home
          </Link>
        </div>
        
        <details className="mt-8 bg-gray-100 p-4 rounded-lg max-w-2xl w-full">
          <summary className="cursor-pointer font-medium text-gray-700">Debug Information</summary>
          <div className="mt-2 text-sm">
            <p><strong>Vehicle ID:</strong> {debugInfo.vehicleId}</p>
            <p><strong>API Endpoint:</strong> {debugInfo.apiEndpoint || "None"}</p>
            <p><strong>Errors:</strong></p>
            <ul className="list-disc pl-5">
              {debugInfo.errors?.map((err, i) => (
                <li key={i} className="text-red-600">{err}</li>
              ))}
            </ul>
            <div className="mt-4">
              <p><strong>Browser URL:</strong> {window.location.href}</p>
            </div>
          </div>
        </details>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen flex-col p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded max-w-md mb-4">
          <p className="font-bold">Login Required</p>
          <p>You need to be logged in to book a vehicle.</p>
        </div>
        
        <div className="flex gap-4 mt-4">
          <Link 
            to="/login"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Login
          </Link>
          
          <Link 
            to="/vehicles"
            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
          >
            Back to Vehicles
          </Link>
        </div>
      </div>
    );
  }

  const totalDays = calculateTotalDays();
  const totalPrice = calculateTotalPrice();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Vehicle Image and Details Section */}
            <div className="p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-white">
              <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <FaCar className="text-blue-500 mr-2" /> 
                {data.brand ? `${data.brand} ${data.model || ''}` : 'Vehicle Details'}
              </h1>
              
              <div className="mb-8">
                {data.vehicleMainImg ? (
                  <img
                    src={`http://localhost:5000/api/vehicle/images/${data.vehicleMainImg}`}
                    alt={`${data.brand || 'Vehicle'} ${data.model || ''}`}
                    className="w-full rounded-xl shadow-md object-cover h-64 md:h-80"
                    onError={(e) => {
                      console.error("Error loading vehicle image");
                      e.target.onerror = null;
                      e.target.src = '/logo512.png';
                    }}
                  />
                ) : (
                  <div className="w-full h-64 md:h-80 bg-gray-200 rounded-xl flex items-center justify-center">
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <FaMapMarkerAlt className="text-red-500 mr-3 text-xl" />
                  <span className="font-medium">Location:</span>
                  <span className="ml-2">{data.location || 'Not specified'}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 mb-1">
                      <MdAirlineSeatReclineNormal className="text-blue-500 mr-2 text-xl" />
                      <span className="font-medium">Capacity</span>
                    </div>
                    <p>{data.capacity || 'N/A'} People</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 mb-1">
                      <FaGasPump className="text-blue-500 mr-2 text-xl" />
                      <span className="font-medium">Fuel Type</span>
                    </div>
                    <p>{data.fuelType || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 mb-1">
                      <MdLocalCarWash className="text-blue-500 mr-2 text-xl" />
                      <span className="font-medium">Transmission</span>
                    </div>
                    <p>{data.transmissionType || 'N/A'}</p>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center text-gray-700 mb-1">
                      <FaCalendarAlt className="text-blue-500 mr-2 text-xl" />
                      <span className="font-medium">Year</span>
                    </div>
                    <p>{data.year || 'N/A'}</p>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-gray-600">{data.description || 'No description available'}</p>
                </div>
              </div>
            </div>
            
            {/* Booking Form Section */}
            <div className="p-6 lg:p-8">
              {!showPayment ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Reserve Your Vehicle</h2>
                  
                  <div className="bg-blue-50 p-5 rounded-lg mb-6">
                    <h3 className="text-lg font-medium mb-2 flex items-center">
                      <FaUser className="text-blue-600 mr-2" />
                      Booking as:
                    </h3>
                    <div className="grid grid-cols-1 gap-1 ml-7">
                      <p><span className="font-medium">Name:</span> {user.name}</p>
                      <p><span className="font-medium">Email:</span> {user.email}</p>
                      {user.phone && <p><span className="font-medium">Phone:</span> {user.phone}</p>}
                    </div>
                  </div>
                  
                  <form onSubmit={handleReserveClick} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          <FaCalendarAlt className="inline mr-2 text-blue-500" /> 
                          Pickup Date
                        </label>
                        <input 
                          type="date" 
                          required 
                          min={today} 
                          value={pickupDate} 
                          onChange={(e) => setPickupDate(e.target.value)} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-medium mb-2">
                          <FaCalendarAlt className="inline mr-2 text-blue-500" /> 
                          Return Date
                        </label>
                        <input 
                          type="date" 
                          required 
                          min={pickupDate} 
                          value={returnDate} 
                          onChange={(e) => setReturnDate(e.target.value)} 
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        Do you need a driver?
                      </label>
                      <div className="flex space-x-6 mt-1">
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="driver" 
                            checked={driver === true}
                            onChange={() => setDriver(true)} 
                            required
                            className="h-5 w-5 text-blue-500" 
                          />
                          <span className="ml-2 flex items-center">
                            <FaCheck className="text-green-500 mr-1" /> Yes, I need a driver
                          </span>
                        </label>
                        
                        <label className="flex items-center">
                          <input 
                            type="radio" 
                            name="driver" 
                            checked={driver === false}
                            onChange={() => setDriver(false)} 
                            required
                            className="h-5 w-5 text-blue-500" 
                          />
                          <span className="ml-2 flex items-center">
                            <FaTimes className="text-red-500 mr-1" /> No, I'll drive myself
                          </span>
                        </label>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Booking Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Base Price:</span>
                          <span>Rs. {data.price || 0} /day</span>
                        </div>
                        {driver && (
                          <div className="flex justify-between">
                            <span>Driver Fee:</span>
                            <span>Rs. 1,500 /day</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Duration:</span>
                          <span>{totalDays} days</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                          <span>Total Amount:</span>
                          <span>Rs. {totalPrice}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center">
                        <FaCheck className="text-green-500 mr-2" />
                        <p className="text-blue-700">Free Cancellation available</p>
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.02]"
                    >
                      Continue to Payment
                    </button>
                  </form>
                </>
              ) : (
                <div className="payment-section space-y-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Payment</h2>
                  
                  <div className="bg-blue-50 p-6 rounded-lg mb-6">
                    <h3 className="font-semibold text-lg mb-4">Booking Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vehicle:</span>
                        <span className="font-medium">{data.brand} {data.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pickup Date:</span>
                        <span>{new Date(pickupDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Return Date:</span>
                        <span>{new Date(returnDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span>{totalDays} days</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Driver:</span>
                        <span>{driver ? "Yes" : "No"}</span>
                      </div>
                      <div className="border-t border-gray-300 pt-3 mt-3 flex justify-between font-bold">
                        <span>Total Amount:</span>
                        <span>Rs. {totalPrice}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-gray-600 mb-4">
                      You'll be redirected to Khalti's secure payment page to complete your transaction.
                    </p>
                    
                    <KhaltiPayment 
                      amount={totalPrice}
                      orderId={`vehicle-${id}-${Date.now()}`}
                      orderName={`Vehicle Rental: ${data.brand} ${data.model}`}
                      customerInfo={{
                        name: user.name,
                        email: user.email,
                        phone: user.phone || ""
                      }}
                      productDetails={[
                        {
                          identity: `vehicle-${id}`,
                          name: `${data.brand} ${data.model} (${totalDays} days)`,
                          total_price: totalPrice * 100, // in paisa
                          quantity: 1,
                          unit_price: totalPrice * 100 // in paisa
                        }
                      ]}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                    
                    <button 
                      onClick={() => setShowPayment(false)}
                      className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-6 rounded transition duration-200"
                    >
                      Back to Booking Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleBook;
