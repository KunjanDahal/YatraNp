import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const HotelOverview = () => {
  const [data, setData] = useState(null); // Set to null initially
  const { id } = useParams();

  useEffect(() => {
    axios
      .get(`/api/hotels/find/${id}`)
      .then((response) => {
        setData(response.data);
        console.log(response.data.HotelImg); // Log fetched HotelImg directly
      })
      .catch((err) => {
        console.error("Error fetching hotel data:", err);
      });
  }, [id]); // Add id to dependency array

  // Check if data is still loading
  if (!data) {
    return <div>Loading...</div>; // Show loading message
  }

  // Destructure data for easier access
  const { name, type, title, description, city, distance, cheapestPrice, HotelImg, HotelImgs } = data;

  return (
    <div>
      <div className="lg:p-24">
        <h1 className="ml-18 md:ml-20 lg:ml-20 text-center lg:text-left py-5 font-bold text-3xl">
          {name} {type}
        </h1>
        <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
          <img
            src={`http://localhost:5000/api/hotels/images/${data.HotelImg}`}
            alt="Hotel Image"
            className="w-[320px] md:w-[700px] lg:w-[800px] rounded-lg mb-10"
            onError={(e) => { e.target.onerror = null; e.target.src = ''; }} // Fallback image
          />

          <div className="lg:px-24">
            <h1 className="text-center md:text-left py-5 font-bold text-1.5xl">
              {title}
            </h1>
            <p className="max-w-[320px] md:max-w-[700px] lg:max-w-[600px] text-justify">
              {description}
            </p>
            <div className="flex items-center">
              <h1 className="font-bold py-5">City:</h1>
              <h1 className="px-4">{city}</h1>
            </div>
            <div className="flex flex-col md:flex-row py-4">
              <h1 className="text-[#41A4FF]">Free Cancellation available</h1>
            </div>
            <div className="flex flex-col md:flex-row py-4">
              <h1 className="text-[#636363]">
                Excellent location – {distance} Km from {city}
              </h1>
            </div>
            <div className="flex flex-col md:flex-row py-4 justify-between lg:items-center">
              <div className="flex items-center">
                <h1 className="font-bold text-2xl">
                  Book a stay over Rs.{cheapestPrice}
                </h1>
                <h1 className="ml-3 md:text-1xl">/per day</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <h1 className="text-center lg:text-left py-5 font-bold text-2xl ml-10">
  Images of our hotel
</h1>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
  {HotelImgs && HotelImgs.map((image, index) => (
    <img
      src={`http://localhost:5000/api/hotels/images/${image}`}
      alt={`Hotel Image ${index}`}
      key={index}
      className="ml-10 w-64 h-64 rounded-lg mb-2"
      onError={(e) => { 
        e.target.onerror = null; 
        e.target.src = 'logo512.png';
      }}
    />
  ))}
</div>

{/* Hotel Certificates Section */}
<h1 className="text-center lg:text-left py-5 font-bold text-2xl ml-10">
  Hotel Certificates
</h1>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 px-10">
  {data.certificates && data.certificates.map((certificate, index) => (
    <div key={index} className="flex flex-col items-center">
      <img
        src={`http://localhost:5000/api/hotels/images/${certificate}`}
        alt={`Certificate ${index + 1}`}
        className="w-full max-w-lg rounded-lg shadow-md"
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'logo512.png';
        }}
      />
      <p className="mt-2 text-gray-600 font-medium">Certificate {index + 1}</p>
    </div>
  ))}
  {(!data.certificates || data.certificates.length === 0) && (
    <p className="text-gray-500 italic">No certificates available</p>
  )}
</div>
    </div>
  );
};

export default HotelOverview;
