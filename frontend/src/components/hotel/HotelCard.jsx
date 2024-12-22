import { Link } from "react-router-dom";
import useFetch from "../../hooks/useFetch";

const HotelCard = () => {
  const { data, loading, error } = useFetch(`/hotels`);

  if (loading) {
    return <div className="text-center">Loading...</div>; // Loading indicator
  }

  if (error) {
    return <div className="text-center text-red-500">Error: {error.message}</div>; // Error handling
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 lg:px-16 xl:px-20 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {data.map((item) => (
          <div
            className="bg-white rounded-lg shadow-md overflow-hidden"
            key={item._id} // Assuming you are using _id as the unique key
          >
            <img
              src={item.HotelImg} // Updated to use the HotelImg field from the API
              alt={`Image of ${item.name}`} // Improved alt text for accessibility
              className="w-full object-cover h-64"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'path/to/your/fallback/image.jpg'; // Fallback image if HotelImg fails
              }}
            />
            <div className="p-4">
              <h2 className="font-bold text-gray-700 text-lg mb-2">
                {item.name}
              </h2>
              <p className="font-light text-gray-500 mb-2">{item.city}</p>
              <p className="font-medium text-gray-900 mb-2">
                Starting from Rs.{item.cheapestPrice}
              </p>
              <div className="flex items-center">
                <Link to={`/hotelOverview/${item._id}`}>
                  <button className="bg-blue-700 text-white font-bold px-3 py-1 rounded mr-2" type="button">
                    View
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HotelCard;
