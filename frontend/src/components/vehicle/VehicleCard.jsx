import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaStar } from "react-icons/fa";

const VehicleCard = (props) => {
  useEffect(() => {
    // Debug logs for component props
    console.log(`VehicleCard for ${props.brand} ${props.model}:`, props);
    
    // Check for missing required properties
    const requiredProps = ['brand', 'model', 'price', 'vehicleMainImg', 'capacity', 'transmissionType', 'fuelType', 'id'];
    const missingProps = requiredProps.filter(prop => !props[prop]);
    
    if (missingProps.length > 0) {
      console.error(`VehicleCard missing required properties: ${missingProps.join(', ')}`);
    }
    
    console.log(`Image URL: http://localhost:5000/api/vehicle/images/${props.vehicleMainImg}`);
  }, [props]);

  return (
    <div className='flex flex-col w-[300px] md:w-[300px] items-center border shadow-lg m-auto mb-8 rounded-lg bg-white'>
      <img 
        src={`http://localhost:5000/api/vehicle/images/${props.vehicleMainImg}`} 
        alt={`${props.brand} ${props.model}`} 
        className='w-full h-[200px] object-cover rounded-t-lg'
        onError={(e) => {
          console.error(`Error loading image for ${props.brand} ${props.model}:`, e);
          e.target.onerror = null;
          e.target.src = 'logo512.png'; // Fallback image if vehicleMainImg fails
        }}
      />
      
      <h1 className='py-2 text-xl font-bold border-b'>{props.brand} {props.model}</h1>
      {/* <div className='flex items-center'>
            <div className='flex'>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            </div>
            <p className='px-2'>4.5</p>
        </div> */}
      <div className='flex space-x-4 mt-2'>
        <p className='text-gray-600'>{props.capacity} People</p>
        <p className='text-gray-600'>{props.transmissionType}</p>
      </div>
      <p className='text-gray-600 mt-1'>{props.fuelType}</p>
      <div className='flex items-center justify-center mt-2'>
        <h1 className='text-2xl font-bold'>Rs. {props.price}</h1>
        <span className='ml-2'>/per day</span>
      </div>
      <Link to={`/vehicle/book/${props.id}`} className='w-full mt-4'>
        <button className='bg-[#41A4FF] text-white rounded-md font-medium py-3 w-full hover:bg-blue-600 transition-colors'>
          Reserve Now
        </button>
      </Link>
    </div>
  )
}

export default VehicleCard