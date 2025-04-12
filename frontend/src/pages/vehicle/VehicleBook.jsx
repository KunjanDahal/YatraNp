import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate, useParams, Link } from "react-router-dom";

const VehicleBook = () => {
    const [data, setData] = useState({}); 
    const [reserveData, setReserveData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [debugInfo, setDebugInfo] = useState({});
    const navigate = useNavigate();

    const today = new Date().toISOString().slice(0, 10);  
  
    const [pickupDate, setPickupDate] = useState(today);
    const [returnDate, setReturnDate] = useState(today);
    const [driver, setDriver] = useState(false);

    const { id } = useParams();

    useEffect(() => {
      const fetchData = async () => {
        const apiErrors = [];
        
        try {
          setLoading(true);
          
          // Log the vehicle ID to check if it's valid
          console.log("Fetching vehicle with ID:", id);
          
          // Using correct endpoint based on VehicleHome.jsx: /api/vehicle (not vehicles)
          // This is found by examining the codebase for successful API calls
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
    }, [id]);

    const handleReserveClick = (e) => {
      e.preventDefault();
      navigate("/vehicle/payment", { state: { data, pickupDate, returnDate, driver } });
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

  return (
    <div className="lg:p-20">
      <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
        {data.vehicleMainImg ? (
          <img
            src={`http://localhost:5000/api/vehicle/images/${data.vehicleMainImg}`}
            alt={`${data.brand || 'Vehicle'} ${data.model || ''}`}
            className="w-[320px] md:w-[700px] lg:w-[600px] rounded-lg"
            onError={(e) => {
              console.error("Error loading vehicle image");
              e.target.onerror = null;
              e.target.src = '/logo512.png'; // Fallback image
            }}
          />
        ) : (
          <div className="w-[320px] md:w-[700px] lg:w-[600px] h-[300px] bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">No image available</p>
          </div>
        )}

        <div className="lg:px-24">
          <h1 className="text-center lg:text-left py-5 font-bold text-2xl">
            {data.brand ? `${data.brand} ${data.model || ''}` : 'Vehicle Details'}
          </h1>
          <p className="max-w-[320px] md:max-w-[700px] lg:max-w-[600px] text-justify">
            {data.description || 'No description available'}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="font-bold py-5">Location : </h1>
              <h1 className="px-4">{data.location || 'Not specified'}</h1>
            </div>
            <div>
              <h1 className="text-[#41A4FF]">Free Cancellation</h1>
            </div>
          </div>

          <form onSubmit={handleReserveClick}>
            <div className="flex justify-between md:flex-row">
              <div className="flex flex-col text-left">
                <h1 className="font-bold text-left">Pickup Date :</h1>
                <input type='date' required min={today} value={pickupDate} className='border rounded-md p-3 w-full' onChange={(e) => setPickupDate(e.target.value)} />
              </div>

              <div className="flex flex-col">
                <h1 className="font-bold text-left">Return Date :</h1>
                <input type='date' required min={pickupDate} value={returnDate} className='border rounded-md p-3 w-full' onChange={(e) => setReturnDate(e.target.value)} />
              </div>
            </div>
            
            <div className="pt-4 flex">
              <h1 className="text-[#41A4FF] font-bold">Do you need a Driver?</h1>
              <p className="ml-6">Yes</p>
              <input type="radio" name="driver" className="ml-2" onChange={() => setDriver(true)} required></input>

              <p className="ml-6">No</p>
              <input type="radio" name="driver" className="ml-2" onChange={() => setDriver(false)} required></input>
            </div>
           
            <div className="flex flex-col md:flex-row mt-6 py-2 justify-between lg:items-center">
              <div className="flex items-center">
                <h1 className="font-bold text-2xl">Rs.{data.price || 0}</h1>
                <h1 className="md:text-1xl">/per day</h1>
              </div>
              
              <button className="bg-[#41A4FF] text-white rounded-md lg:ml-8 font-bold p-3 my-5 lg:my-0 w-full md:w-[350px] md:my-0 lg:w-[300px]" type="submit">
                Reserve
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleBook;
