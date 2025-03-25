import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { CgSpinner } from "react-icons/cg";
import ApproveButton from "../components/ApproveButton";
import DeclineButton from "../components/DeclineButton";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ReservationManagement = () => {
  const [value, setValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tourRes, setTourRes] = useState([]);
  const [hotelRes, setHotelRes] = useState([]);
  const [vehicleRes, setVehicleRes] = useState([]);
  const [restaurantRes, setRestaurantRes] = useState([]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const tourResponse = await axios.get("/api/tours/tourReservations");
      console.log("Tour reservations data received:", tourResponse.data);
      
      // Map the data properly for the DataGrid
      const mappedTourData = tourResponse.data.map((reservation) => ({
        id: reservation._id,
        tourName: "Sample Tour", // This would normally come from the tour details
        userName: `${reservation.firstName} ${reservation.lastName}`,
        bookingDate: new Date(reservation.createdAt).toLocaleDateString(),
        startDate: new Date(reservation.date).toLocaleDateString(),
        peopleCount: reservation.guestCount,
        totalAmount: "Rs. 10,000", // This would normally come from the tour details
        status: reservation.status,
        phone: reservation.phone,
        reservationType: "tour",
      }));
      
      setTourRes(mappedTourData);
      console.log("Mapped tour data:", mappedTourData);
    } catch (error) {
      console.error("Error fetching tour reservations:", error);
      setTourRes([]);
    }

    try {
      const hotelResponse = await axios.get("/api/hotels/hotelReservations");
      // Map hotel data
      const mappedHotelData = hotelResponse.data.map((reservation) => ({
        id: reservation._id,
        hotelName: "Sample Hotel", // This would come from hotel details
        userName: reservation.userName || "Guest",
        bookingDate: new Date(reservation.createdAt).toLocaleDateString(),
        checkInDate: new Date(reservation.checkInDate).toLocaleDateString(),
        nightsCount: reservation.nights || 1,
        phone: reservation.phone || "N/A",
        status: reservation.status,
        reservationType: "hotel",
      }));
      setHotelRes(mappedHotelData);
    } catch (error) {
      console.error(error);
      setHotelRes([]);
    }

    try {
      const vehicleResponse = await axios.get("/api/vehicles/vehicleReservations");
      // Map vehicle data
      const mappedVehicleData = vehicleResponse.data.map((reservation) => ({
        id: reservation._id,
        vehicleName: "Sample Vehicle", // This would come from vehicle details
        userName: reservation.userName || "Guest",
        bookingDate: new Date(reservation.createdAt).toLocaleDateString(),
        pickupDate: new Date(reservation.pickupDate).toLocaleDateString(),
        daysCount: reservation.days || 1,
        phone: reservation.phone || "N/A",
        status: reservation.status,
        reservationType: "vehicle",
      }));
      setVehicleRes(mappedVehicleData);
    } catch (error) {
      console.error(error);
      setVehicleRes([]);
    }

    try {
      const restaurantResponse = await axios.get("/api/restaurants/restaurantReservations");
      // Map restaurant data
      const mappedRestaurantData = restaurantResponse.data.map((reservation) => ({
        id: reservation._id,
        restaurantName: "Sample Restaurant", // This would come from restaurant details
        userName: reservation.userName || "Guest",
        bookingDate: new Date(reservation.createdAt).toLocaleDateString(),
        reservationDate: new Date(reservation.reservationDate).toLocaleDateString(),
        guestCount: reservation.guests || 1,
        phone: reservation.phone || "N/A",
        status: reservation.status,
        reservationType: "restaurant",
      }));
      setRestaurantRes(mappedRestaurantData);
    } catch (error) {
      console.error(error);
      setRestaurantRes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveReservation = async (id, type) => {
    console.log(`Approving reservation: ${id}, type: ${type}`);
    
    let endpoint;
    switch (type) {
      case "tour":
        endpoint = `/api/tours/tourReservations/${id}/approve`;
        break;
      case "hotel":
        endpoint = `/api/hotels/hotelReservations/${id}/approve`;
        break;
      case "vehicle":
        endpoint = `/api/vehicles/vehicleReservations/${id}/approve`;
        break;
      case "restaurant":
        endpoint = `/api/restaurants/restaurantReservations/${id}/approve`;
        break;
      default:
        console.error(`Unknown reservation type: ${type}`);
        return;
    }
    
    console.log(`Calling endpoint: ${endpoint}`);
    
    try {
      const response = await axios.put(endpoint);
      console.log("Approval response:", response.data);
      
      // Refresh data after approval
      fetchData();
    } catch (error) {
      console.error("Error approving reservation:", error);
    }
  };

  const handleDeclineReservation = async (id, type) => {
    console.log(`Declining reservation: ${id}, type: ${type}`);
    
    let endpoint;
    switch (type) {
      case "tour":
        endpoint = `/api/tours/tourReservations/${id}/decline`;
        break;
      case "hotel":
        endpoint = `/api/hotels/hotelReservations/${id}/decline`;
        break;
      case "vehicle":
        endpoint = `/api/vehicles/vehicleReservations/${id}/decline`;
        break;
      case "restaurant":
        endpoint = `/api/restaurants/restaurantReservations/${id}/decline`;
        break;
      default:
        console.error(`Unknown reservation type: ${type}`);
        return;
    }
    
    console.log(`Calling endpoint: ${endpoint}`);
    
    try {
      const response = await axios.put(endpoint);
      console.log("Decline response:", response.data);
      
      // Refresh data after declining
      fetchData();
    } catch (error) {
      console.error("Error declining reservation:", error);
    }
  };

  const tourColumns = [
    { field: "tourName", headerName: "Tour Name", width: 150 },
    { field: "userName", headerName: "Customer", width: 150 },
    { field: "bookingDate", headerName: "Booking Date", width: 130 },
    { field: "startDate", headerName: "Start Date", width: 130 },
    { field: "peopleCount", headerName: "Group Size", width: 130 },
    { field: "phone", headerName: "Contact", width: 130 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex" }}>
            <ApproveButton onClick={() => handleApproveReservation(params.row.id, params.row.reservationType)} />
            <DeclineButton onClick={() => handleDeclineReservation(params.row.id, params.row.reservationType)} />
          </Box>
        );
      },
    },
  ];

  const hotelColumns = [
    { field: "hotelName", headerName: "Hotel Name", width: 150 },
    { field: "userName", headerName: "Customer", width: 150 },
    { field: "bookingDate", headerName: "Booking Date", width: 130 },
    { field: "checkInDate", headerName: "Check-in Date", width: 130 },
    { field: "nightsCount", headerName: "Nights", width: 80 },
    { field: "phone", headerName: "Contact", width: 130 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex" }}>
            <ApproveButton onClick={() => handleApproveReservation(params.row.id, params.row.reservationType)} />
            <DeclineButton onClick={() => handleDeclineReservation(params.row.id, params.row.reservationType)} />
          </Box>
        );
      },
    },
  ];

  const vehicleColumns = [
    { field: "vehicleName", headerName: "Vehicle", width: 150 },
    { field: "userName", headerName: "Customer", width: 150 },
    { field: "bookingDate", headerName: "Booking Date", width: 130 },
    { field: "pickupDate", headerName: "Pickup Date", width: 130 },
    { field: "daysCount", headerName: "Days", width: 80 },
    { field: "phone", headerName: "Contact", width: 130 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex" }}>
            <ApproveButton onClick={() => handleApproveReservation(params.row.id, params.row.reservationType)} />
            <DeclineButton onClick={() => handleDeclineReservation(params.row.id, params.row.reservationType)} />
          </Box>
        );
      },
    },
  ];

  const restaurantColumns = [
    { field: "restaurantName", headerName: "Restaurant", width: 150 },
    { field: "userName", headerName: "Customer", width: 150 },
    { field: "bookingDate", headerName: "Booking Date", width: 130 },
    { field: "reservationDate", headerName: "Reservation Date", width: 130 },
    { field: "guestCount", headerName: "Guests", width: 80 },
    { field: "phone", headerName: "Contact", width: 130 },
    { field: "status", headerName: "Status", width: 100 },
    {
      field: "actions",
      headerName: "Actions",
      width: 200,
      renderCell: (params) => {
        return (
          <Box sx={{ display: "flex" }}>
            <ApproveButton onClick={() => handleApproveReservation(params.row.id, params.row.reservationType)} />
            <DeclineButton onClick={() => handleDeclineReservation(params.row.id, params.row.reservationType)} />
          </Box>
        );
      },
    },
  ];

  return (
    <Box sx={{ width: "90%", m: "0 auto" }}>
      <Typography className="panel-heading" variant="h3" sx={{ my: 3 }}>
        Reservation Management
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="reservation tabs"
          centered
        >
          <Tab label="Tour Reservations" />
          <Tab label="Hotel Reservations" />
          <Tab label="Vehicle Reservations" />
          <Tab label="Restaurant Reservations" />
        </Tabs>
      </Box>
      <div role="tabpanel" hidden={value !== 0}>
        {value === 0 && (
          <Box sx={{ height: 400, width: "100%" }}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : (
              <DataGrid
                rows={tourRes}
                columns={tourColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            )}
          </Box>
        )}
      </div>
      <div role="tabpanel" hidden={value !== 1}>
        {value === 1 && (
          <Box sx={{ height: 400, width: "100%" }}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : (
              <DataGrid
                rows={hotelRes}
                columns={hotelColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            )}
          </Box>
        )}
      </div>
      <div role="tabpanel" hidden={value !== 2}>
        {value === 2 && (
          <Box sx={{ height: 400, width: "100%" }}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : (
              <DataGrid
                rows={vehicleRes}
                columns={vehicleColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            )}
          </Box>
        )}
      </div>
      <div role="tabpanel" hidden={value !== 3}>
        {value === 3 && (
          <Box sx={{ height: 400, width: "100%" }}>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <CgSpinner className="animate-spin text-blue-500 text-4xl" />
              </div>
            ) : (
              <DataGrid
                rows={restaurantRes}
                columns={restaurantColumns}
                pageSize={5}
                rowsPerPageOptions={[5]}
                disableSelectionOnClick
              />
            )}
          </Box>
        )}
      </div>
    </Box>
  );
};

export default ReservationManagement; 