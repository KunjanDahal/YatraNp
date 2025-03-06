import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../../context/authContext";
import Swal from "sweetalert2";

const PendingActivities = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const columns = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      headerClassName: "font-extrabold text-black-900 ml-4 text-xl",
      cellClassName: "text-gray-700 ml-4",
    },
    {
      field: "description",
      headerName: "Description",
      width: 400,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
    },
    {
      field: "type",
      headerName: "Type",
      width: 150,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
    },
    {
      field: "status",
      headerName: "Status",
      width: 150,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
      renderCell: (params) => (
        <div>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mr-3"
            onClick={() => handleAccept(params.id)}
          >
            Accept
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={() => handleDecline(params.id)}
          >
            Decline
          </button>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchActivities();
  }, [user, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredActivities(activities);
    } else {
      const filtered = activities.filter(
        (activity) =>
          activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          activity.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  }, [searchQuery, activities]);

  const rows = filteredActivities.map((activity) => ({
    id: activity._id,
    ...activity,
  }));

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      // Try to get token from localStorage first, then from cookies
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) {
        console.log('No token found, redirecting to login');
        navigate('/login');
        return;
      }

      console.log('Using token:', token.substring(0, 20) + '...');

      // Configure axios
      const axiosConfig = {
        baseURL: 'http://localhost:5000',
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      console.log('Making request with config:', axiosConfig);

      const response = await axios.get("/api/activities/pending", axiosConfig);
      
      console.log('Response:', response.data);

      if (response.data.success) {
        setActivities(response.data.activities || []);
        setFilteredActivities(response.data.activities || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error("Error fetching activities:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      
      if (error.response?.status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in again to continue',
        });
        navigate('/login');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to fetch activities. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`http://localhost:5000/api/activities/approve/${id}`, {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchActivities();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Activity approved successfully',
      });
    } catch (error) {
      console.error("Error details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to approve activity',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecline = async (id) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1];

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.put(`http://localhost:5000/api/activities/decline/${id}`, {}, {
        withCredentials: true,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      await fetchActivities();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Activity declined successfully',
      });
    } catch (error) {
      console.error("Error details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'Failed to decline activity',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    const reportData = filteredActivities.map(activity => ({
      Name: activity.name,
      Description: activity.description,
      Type: activity.type,
      Status: activity.status
    }));

    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map(obj => Object.values(obj).join(',')).join('\n');
    const csvContent = `${headers}\n${rows}`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'activities-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 mt-20" style={{ marginBottom: "20rem" }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Event Management</h1>
        <div className="flex justify-between items-center">
          <input
            type="text"
            placeholder="Search by name, description, type or status..."
            className="w-96 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="space-x-4">
            <button
              onClick={() => navigate("/add-new-activity")}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
            >
              Add Event
            </button>
            <button
              onClick={handleGenerateReport}
              className="bg-gray-800 hover:bg-gray-900 text-white font-bold py-2 px-6 rounded"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
      <div style={{ height: 600, width: "100%" }}>
        <DataGrid
          columns={columns}
          rows={rows}
          loading={isLoading}
          loadingOverlay={
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress />
            </div>
          }
        />
      </div>
    </div>
  );
};

export default PendingActivities;
