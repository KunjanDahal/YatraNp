import React from "react";
import { Routes, Route } from "react-router-dom";
import Vehicle from "./pages/vehicle/Vehicle";
import RestaurantDetails from "./pages/Restaurant/RestaurantDetails";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/vehicle/:id" element={<Vehicle />} />
      <Route path="/restaurant/:id" element={<RestaurantDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App; 