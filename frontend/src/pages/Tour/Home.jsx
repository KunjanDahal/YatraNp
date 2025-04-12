import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroTour from "./HeroTour";
import HiddenPlaces from "./HiddenPlaces";

import ServiceCard from "./Services/ServiceCard";
import TourCategories from "./Services/ServiceCategories";
import TourNav from "../../components/navbar/TourNav";
import { Link } from "react-router-dom";
import { AiOutlineRight } from "react-icons/ai";
import { FaMapMarkerAlt, FaCalendarAlt, FaPhoneAlt, FaUsers } from "react-icons/fa";
import { MdSupportAgent, MdCompareArrows, MdDirectionsWalk } from "react-icons/md";
import CustomForm from "./Services/CustomForm";

import welcome from "../../assets/Tour/Tour-Welcome.jpg";

const Home = () => {
  const navigate = useNavigate();
  const [fromWhere, setFromWhere] = useState("");
  const [toWhere, setToWhere] = useState("");
  const [duration, setDuration] = useState("");

  // Handle travel planner form submission
  const handleTravelPlanSubmit = (e) => {
    e.preventDefault();
    
    if (!toWhere) {
      alert("Please enter a destination");
      return;
    }
    
    // Navigate to search results with the form data
    navigate(`/tours/search/${toWhere}/${duration || "0"}/0`);
  };

  return (
    <div>
      <HeroTour />

      {/* Navigated menu start*/}
      <nav className="bg-grey-light w-full rounded-md pl-20 pt-10">
        <ol className="list-reset flex">
          <li>
            <Link
              to={"/"}
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Home
            </Link>
          </li>
          <li>
            <AiOutlineRight className="mt-1 mx-2" />
          </li>
          <li>
            <Link
              to={"#"}
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Tour Packages
            </Link>
          </li>
          <li>
            <AiOutlineRight className="mt-1 mx-2" />
          </li>
          <li className="text-neutral-500 dark:text-neutral-400">
            Explore Nepal
          </li>
        </ol>
      </nav>
      {/* Navigated menu end*/}

     

      {/* Categories */}
      <div className="mx-auto max-w-2xl px-4  sm:px-6  lg:max-w-7xl lg:px-8">
        {/* welcome image */}
        <img src={""} alt="" />
        <h1 className="text-4xl mt-10 mb-10 ml-2">Tour Categories</h1>
        <TourCategories />
      </div>
      {/* Service Card Brief start */}
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h1 className="text-4xl mb-10 ml-2">Perfect Picks For You</h1>
        <ServiceCard />
       
      </div>
      {/* Service Card Brief end*/}

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6  lg:max-w-7xl lg:px-8">
        <h1 className="text-black uppercase text-center pt-0 mt-0 text-5xl">
          don't fit All these Packages to <br /> your unique interests and{" "}
          <br /> preferences?
        </h1>
      </div>

      {/* customer form */}
      <div>
        <CustomForm />
      </div>
      <div>
        <HiddenPlaces />
      </div>
    </div>
  );
};

export default Home;
