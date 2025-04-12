import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import axios from "axios";
import backgroundImage from "../assets/images/bg.jpg";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { FaUsers, FaHotel, FaCar, FaRoute, FaUtensils, FaCalendarAlt, FaBookmark, FaCog } from 'react-icons/fa';

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  index,
}) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const Admin = () => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [distributionData, setDistributionData] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Set default counts
        let userCount = 0;
        let hotelCount = 0;
        let vehicleCount = 0;
        let tourCount = 0;
        let restaurantCount = 0;
        
        // Fetch counts for distribution chart, with individual error handling
        try {
          const usersRes = await axios.get('/api/users/count');
          userCount = usersRes.data.count || 0;
        } catch (err) {
          console.error("Error fetching user count:", err);
        }
        
        try {
          const hotelsRes = await axios.get('/api/hotels/count');
          hotelCount = hotelsRes.data.count || 0;
        } catch (err) {
          console.error("Error fetching hotel count:", err);
        }
        
        try {
          const vehiclesRes = await axios.get('/api/vehicle/count');
          vehicleCount = vehiclesRes.data.count || 0;
        } catch (err) {
          console.error("Error fetching vehicle count:", err);
        }
        
        try {
          const toursRes = await axios.get('/api/tours/count');
          tourCount = toursRes.data.count || 0;
        } catch (err) {
          console.error("Error fetching tour count:", err);
        }
        
        try {
          const restaurantsRes = await axios.get('/api/restaurant/count');
          restaurantCount = restaurantsRes.data.count || 0;
        } catch (err) {
          console.error("Error fetching restaurant count:", err);
        }

        // Create distribution data
        const distribution = [
          { name: "Users", value: userCount },
          { name: "Hotels", value: hotelCount },
          { name: "Vehicles", value: vehicleCount },
          { name: "Tours", value: tourCount },
          { name: "Restaurants", value: restaurantCount }
        ];
        
        // For bookings data, use default data if API fails
        let hotelBookings = [];
        let vehicleBookings = [];
        let tourBookings = [];
        let restaurantBookings = [];
        
        try {
          const hotelBookingsRes = await axios.get('/api/hotels/bookings/monthly');
          hotelBookings = hotelBookingsRes.data || [];
        } catch (err) {
          console.error("Error fetching hotel bookings:", err);
        }
        
        try {
          const vehicleBookingsRes = await axios.get('/api/vehicle/bookings/monthly');
          vehicleBookings = vehicleBookingsRes.data || [];
        } catch (err) {
          console.error("Error fetching vehicle bookings:", err);
        }
        
        try {
          const tourBookingsRes = await axios.get('/api/tours/bookings/monthly');
          tourBookings = tourBookingsRes.data || [];
        } catch (err) {
          console.error("Error fetching tour bookings:", err);
        }
        
        try {
          const restaurantBookingsRes = await axios.get('/api/restaurants/bookings/monthly');
          restaurantBookings = restaurantBookingsRes.data || [];
        } catch (err) {
          console.error("Error fetching restaurant bookings:", err);
        }

        // Process data for activity chart - last 6 months
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentMonth = new Date().getMonth();
        
        // Get last 6 months
        const lastSixMonths = Array.from({length: 6}, (_, i) => {
          const monthIndex = (currentMonth - i + 12) % 12;
          return months[monthIndex];
        }).reverse();
        
        // Create activity data for the chart
        const activity = lastSixMonths.map((month, index) => {
          // Find the corresponding month data in each result
          const hotelData = hotelBookings.find(item => item.month === month) || { count: 0 };
          const vehicleData = vehicleBookings.find(item => item.month === month) || { count: 0 };
          const tourData = tourBookings.find(item => item.month === month) || { count: 0 };
          const restaurantData = restaurantBookings.find(item => item.month === month) || { count: 0 };
          
          return {
            name: month,
            hotels: hotelData.count,
            vehicles: vehicleData.count,
            tours: tourData.count,
            restaurants: restaurantData.count
          };
        });
        
        setDistributionData(distribution);
        setActivityData(activity);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching analytics data:", err);
        setError("Failed to load analytics data");
        setLoading(false);
        
        // Set fallback data if API calls fail
        setDistributionData([
          { name: "Users", value: 123 },
          { name: "Hotels", value: 45 },
          { name: "Vehicles", value: 38 },
          { name: "Tours", value: 27 },
          { name: "Restaurants", value: 19 }
        ]);
        
        setActivityData([
          { name: "Jul", hotels: 25, vehicles: 15, tours: 10, restaurants: 5 },
          { name: "Aug", hotels: 30, vehicles: 20, tours: 15, restaurants: 10 },
          { name: "Sep", hotels: 28, vehicles: 22, tours: 12, restaurants: 8 },
          { name: "Oct", hotels: 35, vehicles: 25, tours: 18, restaurants: 12 },
          { name: "Nov", hotels: 40, vehicles: 30, tours: 22, restaurants: 15 },
          { name: "Dec", hotels: 45, vehicles: 35, tours: 25, restaurants: 18 }
        ]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="md:px-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h1 className="text-center text-3xl font-bold text-gray-800 mb-2">
              YatraNp Admin Dashboard
            </h1>
            <p className="text-center text-gray-600 mb-6">Welcome back, {user.name}</p>

            {/* Main Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* User Management Card */}
              <Link
                to="/users"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-full group-hover:bg-blue-500 transition-colors duration-300">
                    <FaUsers className="text-blue-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-500">User Management</h3>
                    <p className="text-gray-600">Manage system users</p>
                  </div>
                </div>
              </Link>

              {/* Hotel Management Card */}
              <Link
                to="/hotels"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 p-3 rounded-full group-hover:bg-green-500 transition-colors duration-300">
                    <FaHotel className="text-green-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-500">Hotel Management</h3>
                    <p className="text-gray-600">Manage hotels and rooms</p>
                  </div>
                </div>
              </Link>

              {/* Tour Packages Card */}
              <Link
                to="/tours"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-full group-hover:bg-purple-500 transition-colors duration-300">
                    <FaRoute className="text-purple-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-500">Tour Packages</h3>
                    <p className="text-gray-600">Manage tour packages</p>
                  </div>
                </div>
              </Link>

              {/* Vehicle Management Card */}
              <Link
                to="/vehicles/admin"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-yellow-100 p-3 rounded-full group-hover:bg-yellow-500 transition-colors duration-300">
                    <FaCar className="text-yellow-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-yellow-500">Vehicle Management</h3>
                    <p className="text-gray-600">Manage vehicles</p>
                  </div>
                </div>
              </Link>

              {/* Restaurant Management Card */}
              <Link
                to="/restaurant"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-red-100 p-3 rounded-full group-hover:bg-red-500 transition-colors duration-300">
                    <FaUtensils className="text-red-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-500">Restaurant Management</h3>
                    <p className="text-gray-600">Manage restaurants</p>
                  </div>
                </div>
              </Link>

              {/* Event Management Card */}
              <Link
                to="/pending-activities"
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-full group-hover:bg-indigo-500 transition-colors duration-300">
                    <FaCalendarAlt className="text-indigo-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-500">Event Management</h3>
                    <p className="text-gray-600">Manage events</p>
                  </div>
                </div>
              </Link>

             
                
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Bookings Overview (Last 6 Months)</h3>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={activityData}
                        margin={{
                          top: 5,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hotels" name="Hotels" fill="#00C49F" />
                        <Bar dataKey="vehicles" name="Vehicles" fill="#FFBB28" />
                        <Bar dataKey="tours" name="Tours" fill="#FF8042" />
                        <Bar dataKey="restaurants" name="Restaurants" fill="#0088FE" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Service Distribution</h3>
                {loading ? (
                  <div className="h-80 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : error ? (
                  <div className="h-80 flex items-center justify-center">
                    <p className="text-red-500">{error}</p>
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={distributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={150}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {distributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-4">
                      {distributionData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-sm text-gray-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
