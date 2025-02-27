import React, { useState, useEffect } from 'react'
import { } from "react-icons/fa";
import useFetch from '../../hooks/useFetch';
import { useNavigate } from 'react-router-dom';


const SearchBar = () => {
  const today = new Date().toISOString().slice(0, 10);

  const [vehicleType, setVehicleType] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupDate, setPickupDate] = useState(today);
  const [returnDate, setReturnDate] = useState(today);

  const url = pickupLocation && vehicleType 
    ? `/api/vehicle/type/${vehicleType}/location/${pickupLocation}`
    : pickupLocation 
    ? `/api/vehicle/location/${pickupLocation}`
    : vehicleType 
    ? `/api/vehicle/type/${vehicleType}`
    : null;

  const { data } = useFetch(url);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (data) {
      navigate('/vehicles', { state: data });
    }
  };

  return (
    <div className="bg-white mt-4 lg:mt-[-52px] px-8 shadow-lg max-w-[1240px] p-4 lg:text-left text-center h-full items-center mx-auto rounded-lg">
      <form onSubmit={handleSearch} className="flex flex-col lg:flex-row justify-between px-4 gap-4">
        <div className="flex flex-col flex-1">
          <label htmlFor="vehicleType" className="py-3">Vehicle Type</label>
          <select 
            id="vehicleType"
            className="p-3 border rounded-md w-full" 
            value={vehicleType} 
            onChange={(e) => setVehicleType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="E-Vehicles">E-Vehicles</option>
            <option value="Car">Car</option>
            <option value="SUV">SUV</option>
            <option value="Van">Van</option>
            <option value="Motor Bike">Motor Bike</option>
            <option value="Tuk Tuk">Tuk Tuk</option>
            <option value="Bus">Bus</option>
          </select>
        </div>

        <div className="flex flex-col flex-1">
          <label htmlFor="location" className="py-3">Location</label>
          <input
            type="text"
            id="location"
            className="p-3 border rounded-md w-full"
            placeholder="Enter pickup location"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>

        <div className="flex flex-col flex-1">
          <label htmlFor="pickupDate" className="py-3">Pickup Date</label>
          <input
            type="date"
            id="pickupDate"
            className="p-3 border rounded-md w-full"
            min={today}
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col flex-1">
          <label htmlFor="returnDate" className="py-3">Return Date</label>
          <input
            type="date"
            id="returnDate"
            className="p-3 border rounded-md w-full"
            min={pickupDate}
            value={returnDate}
            onChange={(e) => setReturnDate(e.target.value)}
          />
        </div>

        <div className="flex items-end pb-3">
          <button 
            type="submit"
            className="bg-[#41A4FF] text-white rounded-md font-medium py-3 px-6 hover:bg-blue-600 transition-colors"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

export default SearchBar