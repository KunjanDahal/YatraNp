import React, { useContext } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import VehicleHome from "../pages/vehicle/VehicleHome";
import VehicleBook from "../pages/vehicle/VehicleBook";
import VehiclePayment from "../pages/vehicle/VehiclePayment";
import Register from "../pages/Register";
import Userlist from "../pages/Userlist";
import ToursHome from "../pages/Tour/Home";
import TourDetails from "../pages/Tour/TourDetails";
import TourView from "../pages/Tour/Admin/ViewTour";
import UpdateTour from "../pages/Tour/Admin/updateAddedTour";
import SearchResults from "../pages/Tour/SerachResults";
import AllTourCategories from "../components/Tour/AllTourCategories";
import AddTourPackage from "../pages/Tour/Admin/AddTourPackage";
import { AuthContext } from "../context/authContext";
import {
  hotelColumns,
  tourColumns,
  tourReservationColumns,
  trainColumns,
  userColumns,
  vehicleColumns,
  vehicleReservationColumns,
} from "../components/datatable/datatablesource";
import Vehiclelist from "../pages/Vehiclelist";
import Activity from "../pages/special_activity/Activity";
import PendingActivities from "../pages/special_activity/PendingActivities";
import FilterActivities from "../pages/special_activity/FilterActivities";
import ActivityForm from "../pages/special_activity/AddNewActivity";
import MyActivities from "../pages/special_activity/MyActivities";
import ReservationPage from "../pages/special_activity/Reservations";
import PendingReservationsPage from "../pages/special_activity/PendingReservations";
import UserpageA from "../pages/UserpageA";
import UpdateuserA from "../pages/UpdateuserA";
import Profile from "../pages/Profile";
import Profileupdate from "../pages/Profileupdate";



import Adduser from "../pages/Adduser";
import { HotelHome } from "../pages/hotel/HotelHome";
import AddHotel from "../pages/hotel/AddHotel";
import { AddRoom } from "../pages/hotel/AddRoom";
import UpdateHotel from "../pages/hotel/UpdateHotel";
import AddVehicle from "../pages/vehicle/AddVehicle";
import EditVehicle from "../pages/vehicle/EditVehicle";
import HotelView from "../components/hotel/HotelView";
import HotelOverView from "../components/hotel/HotelOverview";
import VehicleView from "../pages/vehicle/VehicleView";

import RestaurentForm from "../pages/Restaturant/RestaurantForm";
import HadminView from "../pages/hotel/HadminView";
import HotelReserve from "../components/hotel/HotelReserve";
import Hotellist from "../pages/Hotellist";
import Tourlist from "../pages/Tourlist";
import Trainlist from "../pages/Trainlist";
import ContactUs from "../pages/ContactUs";
import HotelBook from "../pages/hotel/HotelBook";
import ResetPassword from "../pages/ResetPassword";
import Tourreservations from "../pages/Tourreservations";
import Vehiclereservation from "../pages/Vehiclereservation";


import { Main } from "../pages/Main";
import Refund from "../components/Refund";
import RefundReq from "../components/RefundReq";
import RefundUpdate from "../components/RefundUpdate";
import { SalaryCalculation } from "../pages/SalaryCalculation";
import { EmployeeList } from "../pages/EmployeeList";
import { SalarySheet } from "../pages/SalarySheet";
import { FinanceHealth } from "../pages/FinanceHealth";
import RestaurantForm from "../pages/Restaturant/RestaurantForm";
import Restaurantlist from "../pages/Restaurantlist";
import Restaurants from "../pages/Restaurants";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import KhaltiPaymentExample from "../pages/payment/KhaltiPaymentExample";

const RouteTour = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Public routes - accessible without login
  const PublicRoute = ({ children }) => {
    if (user) {
      return user.isAdmin ? <Navigate to="/admin" /> : <Navigate to="/" />;
    }
    return children;
  };

  // Shared routes - accessible by both admin and regular users
  const SharedRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // Admin only routes
  const AdminRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    // Only allow access if user is an admin
    if (user.isAdmin) {
      return children;
    }
    // If not admin, show access denied message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only administrators can access this section.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Regular user only routes
  const UserRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    // Only allow access if user is NOT an admin
    if (!user.isAdmin) {
      return children;
    }
    // If admin, redirect to admin dashboard
    return <Navigate to="/admin" />;
  };

  // Event Management Route - accessible by both admins and event organizers
  const EventManagementRoute = ({ children }) => {
    if (!user) {
      return <Navigate to="/login" />;
    }
    // Allow access if user is admin or event organizer
    if (user.isAdmin || user.type === "eventOrganizer") {
      return children;
    }
    // If not authorized, show access denied message
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center">
            <div className="mb-4 text-red-500">
              <svg className="mx-auto w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">Only administrators and event organizers can access this section.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Payment routes */}
      <Route path="/payment/success" element={<SharedRoute><PaymentSuccess /></SharedRoute>} />
      <Route path="/payment/example" element={<SharedRoute><KhaltiPaymentExample /></SharedRoute>} />

      {/* Shared routes - different layout based on user type */}
      <Route path="/profile" element={<SharedRoute><Profile /></SharedRoute>} />
      <Route path="/updateProfile" element={<SharedRoute><Profileupdate /></SharedRoute>} />

      {/* Admin-only routes */}
      <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
      <Route path="/users" element={<AdminRoute><Userlist columns={userColumns} /></AdminRoute>} />
      <Route path="/hotels" element={<AdminRoute><Hotellist columns={hotelColumns} /></AdminRoute>} />
      <Route path="/tours" element={<AdminRoute><Tourlist columns={tourColumns} /></AdminRoute>} />
      <Route path="/vehicle" element={<AdminRoute><Vehiclelist columns={vehicleColumns} /></AdminRoute>} />
      <Route path="/vehicle/add" element={<AdminRoute><AddVehicle /></AdminRoute>} />
      <Route path="/adduser" element={<AdminRoute><Adduser /></AdminRoute>} />

      {/* User-only routes */}
      <Route path="/" element={<UserRoute><Home /></UserRoute>} />
      <Route path="/vehicles" element={<UserRoute><VehicleHome /></UserRoute>} />
      <Route path="/tours/home" element={<UserRoute><ToursHome /></UserRoute>} />
      <Route path="/tours/:id" element={<UserRoute><TourDetails /></UserRoute>} />
      <Route path="/hotelhome" element={<UserRoute><HotelHome /></UserRoute>} />
      <Route path="/hotel/:id" element={<UserRoute><HotelView /></UserRoute>} />
      <Route path="/events" element={<SharedRoute><FilterActivities /></SharedRoute>} />

      {/* Protected routes that need specific handling */}
      <Route path="/vehicle/edit/:id" element={<AdminRoute><EditVehicle /></AdminRoute>} />
      <Route path="/vehicle/view" element={<UserRoute><VehicleView /></UserRoute>} />
      <Route path="/vehicle/book/:id" element={<UserRoute><VehicleBook /></UserRoute>} />
      <Route path="/vehicle/payment" element={<UserRoute><VehiclePayment /></UserRoute>} />
      
      {/* Add protection to all other routes as needed */}
      <Route 
        path="/vehiclereservation" 
        element={
          <SharedRoute>
            <Vehiclereservation columns={vehicleReservationColumns} />
          </SharedRoute>
        }
      />
      <Route
        path="/tours/search/:destination/:duration/:maxsize"
        element={
          <UserRoute>
            <SearchResults />
          </UserRoute>
        }
      />
      <Route path="/addtour" element={<AdminRoute><AddTourPackage /></AdminRoute>} />
      <Route path="/tour/view" element={<AdminRoute><TourView /></AdminRoute>} />
      <Route path="/tour/update" element={<AdminRoute><UpdateTour /></AdminRoute>} />
      
      {/* User Tour Categories */}
      <Route path="/sunandbeach" element={<UserRoute><AllTourCategories /></UserRoute>} />
      <Route path="/hikingandtrekking" element={<UserRoute><AllTourCategories /></UserRoute>} />
      <Route path="/wildsafari" element={<UserRoute><AllTourCategories /></UserRoute>} />
      <Route path="/special" element={<UserRoute><AllTourCategories /></UserRoute>} />
      <Route path="/cultural" element={<UserRoute><AllTourCategories /></UserRoute>} />
      <Route path="/festival" element={<UserRoute><AllTourCategories /></UserRoute>} />
      
      {/* Public Route */}
      <Route path="/contactus" element={<ContactUs />} />
      
      {/* Admin Activity Management */}
      <Route 
        path="/add-new-activity" 
        element={
          <AdminRoute>
            <ActivityForm />
          </AdminRoute>
        } 
      />
      <Route 
        path="/add-new-activity/:id" 
        element={
          <AdminRoute>
            <ActivityForm />
          </AdminRoute>
        } 
      />
      <Route 
        path="/pending-activities" 
        element={
          <AdminRoute>
            <PendingActivities />
          </AdminRoute>
        } 
      />
      <Route 
        path="/pending-reservations" 
        element={
          <AdminRoute>
            <PendingReservationsPage />
          </AdminRoute>
        } 
      />
      
      {/* Admin Hotel Management */}
      <Route path="/addrestaurant" element={<AdminRoute><RestaurantForm /></AdminRoute>} />
      <Route path="/hotels/new" element={<AdminRoute><AddHotel /></AdminRoute>} />
      <Route path="/rooms/new/:id" element={<AdminRoute><AddRoom /></AdminRoute>} />
      <Route path="/hotels/update/:id" element={<AdminRoute><UpdateHotel /></AdminRoute>} />
      <Route path="/hoteloverview/:id" element={<SharedRoute><HotelOverView /></SharedRoute>} />
      <Route path="/hoteladmin" element={<AdminRoute><HadminView /></AdminRoute>} />
      
      {/* User Hotel Booking */}
      <Route path="/hotelreserve/:id" element={<UserRoute><HotelReserve /></UserRoute>} />
      <Route path="/hotelbooking" element={<UserRoute><HotelBook /></UserRoute>} />
      
      {/* Admin Restaurant Management */}
      <Route path="/addrestaurants" element={<AdminRoute><RestaurantForm /></AdminRoute>} />
      
      {/* Finance Management - Admin Only */}
      <Route path="/finance" element={<AdminRoute><Main /></AdminRoute>} />
      <Route path="/finance/salary" element={<AdminRoute><SalaryCalculation /></AdminRoute>} />
      <Route path="/finance/employee" element={<AdminRoute><EmployeeList /></AdminRoute>} />
      <Route path="/finance/salarySheet" element={<AdminRoute><SalarySheet /></AdminRoute>} />
      <Route path="/finance/FinanceHealth" element={<AdminRoute><FinanceHealth /></AdminRoute>} />
      <Route path="/finance/refund" element={<AdminRoute><Refund /></AdminRoute>} />
      <Route path="/finance/addRefund" element={<AdminRoute><RefundReq /></AdminRoute>} />
      <Route path="/finance/updateRefund/:id" element={<AdminRoute><RefundUpdate /></AdminRoute>} />
      
      {/* Restaurant Routes */}
      <Route path="/restaurant" element={<AdminRoute><Restaurantlist /></AdminRoute>} />
      <Route path="/restaurants" element={<UserRoute><Restaurants /></UserRoute>} />
    </Routes>
  );
};

export default RouteTour;
