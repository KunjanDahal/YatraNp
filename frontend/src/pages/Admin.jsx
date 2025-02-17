import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
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

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

const data2 = [
  { name: "Users", value: 800 },
  { name: "Hotels", value: 300 },
  { name: "Vehicles", value: 300 },
  { name: "Tours", value: 200 },
];

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
                to="/vehicle"
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

              {/* Reservation Management Card */}
              <Link
                to=""
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-pink-100 p-3 rounded-full group-hover:bg-pink-500 transition-colors duration-300">
                    <FaBookmark className="text-pink-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-pink-500">Reservation Management</h3>
                    <p className="text-gray-600">Manage reservations</p>
                  </div>
                </div>
              </Link>

              {/* Other Card */}
              <Link
                to=""
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 group"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-3 rounded-full group-hover:bg-gray-500 transition-colors duration-300">
                    <FaCog className="text-gray-500 text-2xl group-hover:text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 group-hover:text-gray-500">Other</h3>
                    <p className="text-gray-600">Additional settings</p>
                  </div>
                </div>
              </Link>
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Activity Overview</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data}
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
                      <Bar dataKey="pv" fill="#4F46E5" />
                      <Bar dataKey="uv" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribution Overview</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data2}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {data2.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {data2.map((item, index) => (
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
