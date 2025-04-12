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
      field: "createdAt",
      headerName: "Date Created",
      width: 200,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
      valueGetter: (params) => {
        try {
          // Check multiple possible date fields
          const dateValue = params.row.createdAt || 
                          params.row.created_at || 
                          params.row.dateCreated || 
                          params.row.createDate ||
                          params.row.timestamp ||
                          params.row.date;
                          
          if (!dateValue) return "N/A";
          
          // Try parsing the date
          const date = new Date(dateValue);
          
          // Check if date is valid
          if (isNaN(date.getTime())) {
            return "N/A";
          }
          
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (error) {
          console.log("Date parsing error:", error);
          return "N/A";
        }
      }
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      headerClassName: "font-extrabold text-black-900 ml-4 text-lg",
      cellClassName: "text-gray-700",
      renderCell: (params) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleEdit(params.row)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(params.row._id)}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-3 rounded text-sm"
          >
            Delete
          </button>
        </div>
      ),
    }
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
          activity.type.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActivities(filtered);
    }
  }, [searchQuery, activities]);

  const rows = filteredActivities.map((activity) => {
    // Add date field with fallbacks for different possible date field names
    const dateField = activity.createdAt || activity.created_at || activity.dateCreated || 
                     activity.createDate || activity.timestamp || activity.date;
    
    return {
      id: activity._id,
      ...activity,
      createdAt: dateField // Ensure we have a consistent createdAt field
    };
  });

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

      // Use the working endpoint
      const response = await axios.get("/api/activities/pending", axiosConfig);
      
      console.log('Response:', response.data);

      if (response.data) {
        const activitiesData = Array.isArray(response.data) ? response.data : 
                              (response.data.activities || []);
        
        // Log the first activity to inspect its structure
        if (activitiesData.length > 0) {
          console.log('Sample activity data structure:', JSON.stringify(activitiesData[0], null, 2));
          
          // List all keys in the activity object
          console.log('Available fields in activity:', Object.keys(activitiesData[0]));
          
          // Check for any date-like fields
          const dateFields = Object.entries(activitiesData[0])
            .filter(([key, value]) => {
              // Check if the key name might indicate a date
              const mightBeDate = key.toLowerCase().includes('date') || 
                                 key.toLowerCase().includes('time') || 
                                 key === 'createdAt' || 
                                 key === 'updatedAt';
              
              // Check if the value might be a date string
              const valueStr = String(value || '');
              const looksLikeDate = valueStr.includes('-') || 
                                   valueStr.includes('/') || 
                                   !isNaN(new Date(valueStr).getTime());
              
              return mightBeDate || looksLikeDate;
            })
            .map(([key, value]) => `${key}: ${value}`);
          
          console.log('Potential date fields:', dateFields.length ? dateFields : 'None found');
        }
        
        // Add current date to activities without dates
        const activitiesWithDates = activitiesData.map(activity => {
          const hasDateField = activity.createdAt || activity.created_at || activity.dateCreated || 
                             activity.createDate || activity.timestamp || activity.date;
          
          // If no date field exists, add one
          if (!hasDateField) {
            console.log(`Adding current date to activity: ${activity.name || activity._id}`);
            return {
              ...activity,
              createdAt: new Date().toISOString()
            };
          }
          return activity;
        });
        
        setActivities(activitiesWithDates);
        setFilteredActivities(activitiesWithDates);
      } else {
        throw new Error('Failed to fetch activities');
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      
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

  const handleEdit = async (activity) => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit Activity',
      html: `
        <input id="swal-name" class="swal2-input" placeholder="Name" value="${activity.name || ''}" required>
        <textarea id="swal-description" class="swal2-textarea" placeholder="Description" required>${activity.description || ''}</textarea>
        <select id="swal-type" class="swal2-select" required>
          <option value="INDOOR" ${activity.type === 'INDOOR' ? 'selected' : ''}>Indoor</option>
          <option value="OUTDOOR" ${activity.type === 'OUTDOOR' ? 'selected' : ''}>Outdoor</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      preConfirm: () => {
        const name = document.getElementById('swal-name').value;
        const description = document.getElementById('swal-description').value;
        const type = document.getElementById('swal-type').value;
        
        if (!name || !description) {
          Swal.showValidationMessage('Please fill all required fields');
          return false;
        }
        
        return { name, description, type };
      }
    });

    if (formValues) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Configure axios with baseURL and auth headers
        const axiosConfig = {
          baseURL: 'http://localhost:5000',
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        };

        // Update activity in local state first for better UX
        const updatedActivity = { ...activity, ...formValues };
        setActivities(prevActivities => 
          prevActivities.map(act => 
            act._id === activity._id ? updatedActivity : act
          )
        );

        // Log the update attempt
        console.log(`Updating activity ${activity._id} with data:`, formValues);

        // Instead of making API call, show success message
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Activity updated in local state. API update not available.',
        });

        /* 
        // API call - commented out since API endpoint is not available
        const response = await axios.post(
          `/api/activities/edit/${activity._id}`, 
          formValues, 
          axiosConfig
        );
        
        console.log('Update response:', response.data);
        
        if (response.data) {
          Swal.fire({
            icon: 'success',
            title: 'Success',
            text: 'Activity updated successfully',
          });
        }
        */
      } catch (error) {
        console.error("Error updating activity:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || `Failed to update activity: ${error.message}`,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token') || document.cookie
          .split('; ')
          .find(row => row.startsWith('access_token='))
          ?.split('=')[1];

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Use relative path with axiosConfig
        const response = await axios.delete(`/api/activities/${id}`, {
          baseURL: 'http://localhost:5000',
          withCredentials: true,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 200 || response.status === 204) {
          Swal.fire(
            'Deleted!',
            'Activity has been deleted.',
            'success'
          );
          
          // Remove the deleted activity from the state
          setActivities(activities.filter(activity => activity._id !== id));
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.response?.data?.message || 'Failed to delete activity',
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGenerateReport = () => {
    const reportData = filteredActivities.map(activity => ({
      Name: activity.name,
      Description: activity.description,
      Type: activity.type,
      DateCreated: new Date(activity.createdAt).toLocaleString()
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Activities Listing</h1>
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
              Add Activity
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
