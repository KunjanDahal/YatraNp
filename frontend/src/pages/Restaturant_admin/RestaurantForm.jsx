import React, { useState } from "react";
import FileBase from "react-file-base64";
import axios from "axios";
import { useNavigate } from "react-router-dom";

// Add axios default base URL
axios.defaults.baseURL = "http://localhost:5000";

const RestaurantForm = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [restaurantType, setRestaurantType] = useState("");
  const [staffAmount, setStaffAmount] = useState("");
  const [qualification, setQualification] = useState("");
  const [capacity, setCapacity] = useState("20-30");
  const [regNo, setRegNo] = useState("");
  const [city, setDistrict] = useState("");
  const [address, setAddress] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [priceRange, setPrice] = useState("");
  const [uploadResimage, setImage] = useState("");
  const [uploadRegimage, setImg] = useState("");

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  const handleTypeChange = (e) => {
    setRestaurantType(e.target.value);
  };

  const handleStaffAmountChange = (e) => {
    setStaffAmount(e.target.value);
  };

  const handleQualificationChange = (e) => {
    setQualification(e.target.value);
  };

  const handleCapacityChange = (e) => {
    setCapacity(e.target.value);
  };

  const handleRegNoChange = (e) => {
    setRegNo(e.target.value);
  };

  const handleDistrictChange = (e) => {
    setDistrict(e.target.value);
  };

  const handleAddressChange = (e) => {
    setAddress(e.target.value);
  };

  const handleContactNoChange = (e) => {
    setContactNo(e.target.value);
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting restaurant form...");
      
      // Validate all required fields
      const requiredFields = [
        { name: 'Restaurant name', value: name },
        { name: 'Restaurant type', value: restaurantType },
        { name: 'Staff amount', value: staffAmount },
        { name: 'Chef qualification', value: qualification },
        { name: 'Restaurant capacity', value: capacity },
        { name: 'Registration number', value: regNo },
        { name: 'City/District', value: city },
        { name: 'Address', value: address },
        { name: 'Contact number', value: contactNo },
        { name: 'Price range', value: priceRange },
        { name: 'Restaurant image', value: uploadResimage },
        { name: 'Registration certificate', value: uploadRegimage }
      ];
      
      const emptyFields = requiredFields.filter(field => !field.value || field.value === 'staffAmount' || field.value === 'qualification' || field.value === 'priceRange' || field.value === 'city');
      
      if (emptyFields.length > 0) {
        alert(`Please fill in all required fields: ${emptyFields.map(f => f.name).join(', ')}`);
        return;
      }

      // Phone number validation
      if (!/^\d{10}$/.test(contactNo)) {
        alert("Please enter a valid 10-digit contact number");
        return;
      }

      // Since we're using FileBase64, we don't need FormData
      const restaurantData = {
        name,
        restaurantType,
        staffAmount,
        qualification,
        capacity,
        regNo,
        city,
        Address: address, // Note the capital A to match schema
        contactNo,
        priceRange,
        uploadResimage,
        uploadRegimage,
        isApproved: false // Set default approval status
      };
      
      console.log("Sending data to server:", restaurantData);
      
      const response = await axios.post("/api/restaurant", restaurantData);
      console.log("Server response:", response.data);
      
      if (response.data.success) {
        alert("Restaurant added successfully!");
        navigate("/restaurant");
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error submitting restaurant:", error);
      if (error.response && error.response.data) {
        alert("Error adding restaurant: " + (error.response.data.message || error.message));
      } else {
        alert("Error connecting to server. Please check if the backend server is running.");
      }
    }
  };

  return (
    <>
      <div className="max-w-3xl mx-auto mt-20">
        <p
          className="block text-blue-500 font-bold mb-6"
          style={{ fontSize: "28px" }}
        >
          Add Restaurant!
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="name"
            >
              Restaurant Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Restaurant name"
              value={name}
              onChange={handleNameChange}
              required
            />
          </div>
          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="type"
            >
              Restaurant Type
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="type"
              value={restaurantType}
              onChange={handleTypeChange}
              required
            >
              <option value="">Restaurant Type</option>
              <option value="korean">Korean</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="indian">Indian</option>
              <option value="nepali">Nepali</option>
              <option value="italian">Italian</option>
              <option value="mexican">Mexican</option>
              <option value="thai">Thai</option>
              <option value="vietnamese">Vietnamese</option>
              <option value="american">American</option>
              <option value="french">French</option>
              <option value="mediterranean">Mediterranean</option>
              <option value="fusion">Fusion</option>
              <option value="cafe">Cafe</option>
              <option value="fastfood">Fast Food</option>
              <option value="buffet">Buffet</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="staff-amount"
            >
              Staff Amount
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="staffAmount"
              value={staffAmount}
              onChange={handleStaffAmountChange}
              required
            >
              <option value="">Select Staff Amount</option>
              <option value="4-7">4-7</option>
              <option value="7-10">7-10</option>
              <option value="10-15">10-15</option>
              <option value="15-30">15-30</option>
              <option value="30-50">30-50</option>
              <option value="50-70">50-70</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="qualifications"
            >
              Culinary Qualification of Chief Cheaf
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="qualification"
              value={qualification}
              onChange={handleQualificationChange}
              required
            >
              <option value="">Select Qualification</option>
              <option value="none">None</option>
              <option value="diploma">Diploma in Culinary Arts</option>
              <option value="bsc">Bsc in Culinary Arts</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="restaurant-capacity"
            >
              Restaurant Capacity
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="capacity"
              value={capacity}
              onChange={handleCapacityChange}
              required
            >
              <option value="">Select Capacity</option>
              <option value="20-30">20-30</option>
              <option value="30-50">30-50</option>
              <option value="50-70">50-70</option>
              <option value="70-100">70-100</option>
              <option value="100-150">100-150</option>
              <option value="150-200">150-200</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="uploadResimage"
            >
              Upload Restaurant Images
            </label>
            <FileBase
              type="file"
              multiple={false}
              onDone={({ base64 }) => setImage(base64)}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="description"
            >
              Restaurant Registration Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-auto"
              id="regNo"
              placeholder="RegNo"
              value={regNo}
              onChange={handleRegNoChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="district"
            >
              District
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="city"
              value={city}
              onChange={handleDistrictChange}
              required
            >
              <option value="">Select District</option>
              <option value="kathmandu">Kathmandu</option>
              <option value="lalitpur">Lalitpur</option>
              <option value="bhaktapur">Bhaktapur</option>
              <option value="pokhara">Pokhara</option>
              <option value="chitwan">Chitwan</option>
              <option value="kaski">Kaski</option>
              <option value="rupandehi">Rupandehi</option>
              <option value="banke">Banke</option>
              <option value="parsa">Parsa</option>
              <option value="morang">Morang</option>
              <option value="sunsari">Sunsari</option>
              <option value="jhapa">Jhapa</option>
              <option value="kailali">Kailali</option>
              <option value="dang">Dang</option>
              <option value="kavre">Kavre</option>
              <option value="makwanpur">Makwanpur</option>
              <option value="gorkha">Gorkha</option>
              <option value="dhading">Dhading</option>
              <option value="tanahu">Tanahu</option>
              <option value="nawalparasi">Nawalparasi</option>
              <option value="palpa">Palpa</option>
              <option value="bardiya">Bardiya</option>
              <option value="doti">Doti</option>
              <option value="kanchanpur">Kanchanpur</option>
              <option value="dolakha">Dolakha</option>
              <option value="ramechhap">Ramechhap</option>
              <option value="sindhuli">Sindhuli</option>
              <option value="sarlahi">Sarlahi</option>
              <option value="dhanusha">Dhanusha</option>
              <option value="mahottari">Mahottari</option>
              <option value="saptari">Saptari</option>
              <option value="siraha">Siraha</option>
              <option value="ilam">Ilam</option>
              <option value="udayapur">Udayapur</option>
              <option value="solukhumbu">Solukhumbu</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="Address"
            >
              Address
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="Address"
              type="text"
              placeholder="Address"
              value={address}
              onChange={handleAddressChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="contactNo"
            >
              Contact Number
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="contactNo"
              type="text"
              placeholder="contactNo"
              value={contactNo}
              onChange={handleContactNoChange}
              required
            />
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="priceRange"
            >
              Pricing Range for Cuisines
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="priceRange"
              value={priceRange}
              onChange={handlePriceChange}
              required
            >
              <option value="">Select Price Range</option>
              <option value="200-3000">200-3000</option>
              <option value="200-5000">200-5000</option>
              <option value="200-6000">200-6000</option>
              <option value="200-7000">200-7000</option>
              <option value="200-8000">200-8000</option>
              <option value="200-10000">200-10000</option>
            </select>
          </div>

          <div className="mb-4">
            <label
              className="block text-gray-700 font-bold mb-2"
              htmlFor="uploadRegimage"
            >
              Upload Restaurant Registered Certificate
            </label>
            <FileBase
              type="file"
              multiple={false}
              onDone={({ base64 }) => setImg(base64)}
              required
            />
          </div>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold mb-20 py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Add Restaurant
          </button>
        </form>
      </div>
    </>
  );
};

export default RestaurantForm;
