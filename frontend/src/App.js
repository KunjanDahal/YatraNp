import { BrowserRouter } from "react-router-dom";
import React from "react";
import Layout from "./components/Layout/Layout";
import "./App.css";
import { SearchProvider } from "./context/searchContext";

export default function App() {
  return (
    <BrowserRouter>
      <SearchProvider>
        <Layout />
      </SearchProvider>
    </BrowserRouter>
  );
}
