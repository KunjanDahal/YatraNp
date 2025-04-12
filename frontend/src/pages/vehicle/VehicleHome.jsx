import VehicleHero from "../../components/vehicle/VehicleHero";
import SearchBar from "../../components/vehicle/SearchBar";
import VehicleListHeader from "../../components/vehicle/VehicleListHeader";
import RentCarAd from "../../components/vehicle/RentCarAd";
import { useLocation } from "react-router-dom";
import VehicleCard from "../../components/vehicle/VehicleCard";
import useFetch from "../../hooks/useFetch";

const VehicleHome = () => {
  const location = useLocation();
  const searchData = location.state;
  
  // If there's no search data, fetch all vehicles
  const { data, loading, error } = useFetch("/api/vehicle");
  
  // Use either the search results or the fetched data
  const vehicles = searchData || data;

  // Debug logs
  console.log("VehicleHome - data from API:", data);
  console.log("VehicleHome - searchData:", searchData);
  console.log("VehicleHome - vehicles to display:", vehicles);
  
  // Check each vehicle record individually
  if (vehicles && vehicles.length > 0) {
    vehicles.forEach((vehicle, index) => {
      console.log(`Vehicle ${index + 1}:`, {
        id: vehicle._id,
        brand: vehicle.brand,
        model: vehicle.model,
        vehicleMainImg: vehicle.vehicleMainImg,
        price: vehicle.price,
        allProps: Object.keys(vehicle)
      });
    });
  }

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div>
      <VehicleHero />
      <SearchBar />
      <VehicleListHeader />
      <div className="md:px-24">
        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
          {vehicles?.map((item) => (
            <VehicleCard
              key={item._id}
              brand={item.brand}
              model={item.model}
              price={item.price}
              transmissionType={item.transmissionType}
              fuelType={item.fuelType}
              capacity={item.capacity}
              vehicleMainImg={item.vehicleMainImg}
              id={item._id}
            />
          ))}
          {(!vehicles || vehicles.length === 0) && (
            <div className="col-span-full text-center py-10 text-gray-500">
              No vehicles found
            </div>
          )}
        </div>
      </div>
      <RentCarAd />
    </div>
  );
};

export default VehicleHome;
