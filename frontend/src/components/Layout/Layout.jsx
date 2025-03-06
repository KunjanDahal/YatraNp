import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import RouteTour from "../../router/RouteTour";
import Footer from "../footer/Footer";
import AdminNavbar from "../navbar/AdminNavbar";
import Navbar from "../navbar/Navbar";

const Layout = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // List of routes that should use admin layout
  const adminRoutes = [
    '/admin',
    '/users',
    '/hotels',
    '/tours',
    '/vehicle',
    '/train',
    '/adduser',
    '/userpage',
    '/update',
    '/profile',  // Profile will use admin layout for admin users
    '/updateProfile'
  ];

  // List of routes that should use finance layout
  const financeRoutes = [
    '/finance',
    '/finance/salary',
    '/finance/employee',
    '/finance/salarySheet',
    '/finance/FinanceHealth',
    '/finance/refund',
    '/finance/addRefund',
    '/finance/updateRefund'
  ];

  // Determine which layout to show based on user type and current route
  const shouldShowAdminLayout = () => {
    if (!user) return false;
    if (user.isAdmin) {
      // Admin users should always see admin layout
      return true;
    }
    if (user.type === "financeManager") {
      // Finance managers see admin layout only on finance routes
      return financeRoutes.some(route => location.pathname.startsWith(route));
    }
    return false;
  };

  return (
    <div>
      {shouldShowAdminLayout() ? <AdminNavbar /> : <Navbar />}
      <RouteTour />
      <Footer />
    </div>
  );
};

export default Layout;
