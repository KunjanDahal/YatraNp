import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import FileBase from "react-file-base64";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
axios.defaults.withCredentials = true; // Enable sending cookies with requests

const ActivityForm = () => {
  const navigate = useNavigate();
  const locationRoute = useLocation();
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [activityType, setActivityType] = useState("INDOOR");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check authentication and user type on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get('/api/auth/check');
        if (!response.data.isAuthenticated) {
          Swal.fire({
            icon: 'warning',
            title: 'Authentication Required',
            text: 'Please log in to create activities',
          });
          navigate('/login');
          return;
        }

        // Check if user is an event organizer
        if (response.data.user.type !== 'eventOrganizer') {
          Swal.fire({
            icon: 'error',
            title: 'Access Denied',
            text: 'Only event organizers can create activities',
          });
          navigate('/');
          return;
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        Swal.fire({
          icon: 'error',
          title: 'Authentication Error',
          text: 'Please log in to continue',
        });
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const activity = locationRoute.state?.activity;
    if (activity) {
      setIsEditing(true);
      setName(activity.name);
      setLocation(activity.location);
      setStartDate(new Date(activity.dateRange.startDate));
      setEndDate(new Date(activity.dateRange.endDate));
      setStartTime(activity.timeRange.startTime);
      setEndTime(activity.timeRange.endTime);
      setActivityType(activity.type || "INDOOR");
      setDescription(activity.description);
      setImage(activity.image);
    }
  }, [locationRoute.state]);

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  const handleStartDateChange = (date) => {
    setStartDate(date);
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  function handleEndTimeChange(event) {
    const selectedEndTime = event.target.value;
    const selectedStartTime = startTime;

    // Convert the selected times to Date objects
    const endDate = new Date(`2000-01-01T${selectedEndTime}`);
    const startDate = new Date(`2000-01-01T${selectedStartTime}`);

    // Check if the end time is before the start time
    if (endDate <= startDate) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "End time must be after start time",
      });
      return;
    }

    // Update the state with the selected end time
    setEndTime(selectedEndTime);
  }

  const handleActivityTypeChange = (e) => {
    setActivityType(e.target.value);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const activityData = {
        name,
        location,
        dateRange: {
          startDate,
          endDate,
        },
        timeRange: {
          startTime,
          endTime,
        },
        type: activityType,
        description,
        image,
      };

      if (isEditing) {
        activityData.id = locationRoute.state.activity._id;
      }

      const response = await axios.post("/api/activities", activityData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success || response.data.created || response.data.updated) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: isEditing ? "Activity updated successfully!" : "Activity created successfully!",
        });
        navigate("/my-activities");
      } else {
        throw new Error("Failed to save activity");
      }
    } catch (error) {
      console.error(error);
      if (error.response?.status === 401) {
        Swal.fire({
          icon: "error",
          title: "Authentication Error",
          text: "Please log in to create activities",
        });
        navigate('/login');
      } else if (error.response?.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Only event organizers can create activities",
        });
        navigate('/');
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.response?.data?.message || "Failed to save activity. Please try again.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="max-w-3xl mx-auto mt-20"
        style={{ marginBottom: "20rem" }}
      >
        <p
          className="block text-blue-500 font-bold mb-6"
          style={{ fontSize: "28px" }}
        >
          {isEditing ? "Edit Activity" : "Create a new Special Activity!"}
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="name"
            >
              Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Activity name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="location"
            >
              Location
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="location"
              type="text"
              placeholder="Malabe"
              value={location}
              onChange={handleLocationChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="date-range"
            >
              Date Range
            </label>
            <DatePicker
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              selected={startDate}
              startDate={startDate}
              endDate={endDate}
              onChange={(date) => handleStartDateChange(date)}
              value={startDate}
              selectsStart
              dateFormat="yyyy-MM-dd"
              minDate={new Date()}
              required
            />
            <DatePicker
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
              selected={endDate}
              startDate={startDate}
              endDate={endDate}
              onChange={(date) => handleEndDateChange(date)}
              selectsEnd
              dateFormat="yyyy-MM-dd"
              minDate={startDate}
              maxDate={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="time-range"
            >
              Time Range
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="start-time"
              type="time"
              value={startTime}
              onChange={handleStartTimeChange}
              required
            />
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
              id="end-time"
              type="time"
              value={endTime}
              onChange={handleEndTimeChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="activity-type"
            >
              Activity Type
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="activity-type"
              value={activityType}
              onChange={handleActivityTypeChange}
              required
            >
              <option value="INDOOR">Indoor</option>
              <option value="OUTDOOR">Outdoor</option>
            </select>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="description"
            >
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-auto"
              id="description"
              rows="20"
              placeholder="Activity description"
              value={description}
              onChange={handleDescriptionChange}
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="image"
            >
              Image
            </label>
            <FileBase
              type="file"
              multiple={false}
              onDone={({ base64 }) => setImage(base64)}
              required
            />

            {image && (
              <img
                src={image}
                alt="Preview"
                style={{
                  maxWidth: "500",
                  maxHeight: "400px",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              />
            )}
          </div>
          <button
            className={`${
              isLoading
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-700"
            } text-white font-bold mb-20 py-2 px-4 rounded focus:outline-none focus:shadow-outline`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="inline-block animate-spin mr-2">⌛</span>
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              isEditing ? "Update Activity" : "Create Activity"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default ActivityForm;
