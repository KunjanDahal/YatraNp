import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import HeroTour from "./HeroTour";
import TourNav from "../../components/navbar/TourNav";
import { AiFillStar, AiOutlineStar, AiOutlineCalendar, AiOutlineTrophy, AiOutlineUser, AiOutlineGlobal } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { MdOutlineLocationOn } from "react-icons/md";
import { FaRegComment, FaUser } from "react-icons/fa";
import DaysShow from "../../components/Tour/DaysShow";
import InclusionExclusion from "../../components/Tour/InclusionExclusion";
import { AuthContext } from "../../context/authContext";
import TourKhaltiPayment from "../../components/payment/TourKhaltiPayment";
import Swal from "sweetalert2";
import axios from "axios";

// Rating Star component
const RatingStars = ({ rating, setRating, editable = false, size = "text-xl" }) => {
  const stars = [1, 2, 3, 4, 5];
  
  return (
    <div className="flex">
      {stars.map((star) => (
        <span 
          key={star}
          onClick={() => editable && setRating(star)}
          className={`${editable ? 'cursor-pointer' : ''} ${size}`}
        >
          {star <= rating ? (
            <AiFillStar className="text-yellow-500" />
          ) : (
            <AiOutlineStar className="text-gray-400" />
          )}
        </span>
      ))}
    </div>
  );
};

const TourDetails = () => {
  const { id } = useParams();
  const [showPayment, setShowPayment] = useState(false);
  const [firstName, setFname] = useState("");
  const [lastName, setLname] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");
  const [guestCount, setGuests] = useState("");
  const [allTours, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tourRating, setTourRating] = useState({ rating: 0, count: 0 });
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  
  // get email of current user
  const { user } = useContext(AuthContext);
  const currentUser = user?.email;

  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/tours/${id}`);
        console.log(response.data.data.oneTour);
        setTour(response.data.data.oneTour);
        
        // First fetch reviews, then calculate rating
        await fetchReviews(response.data.data.oneTour._id);
      } catch (err) {
        console.log(err.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load tour details. Please try again.",
        });
      } finally {
        setLoading(false);
      }
    };
    getTours();
  }, [id]);
  
  // Fetch reviews and calculate the rating based on them
  const fetchReviews = async (tourId) => {
    try {
      // Fetch reviews from API
      const response = await axios.get(`/api/tours/reviews/${tourId}`);
      
      if (response.data.status === "success") {
        setReviews(response.data.data.reviews || []);
        setTourRating({
          rating: response.data.data.averageRating,
          count: response.data.data.count
        });
        
        // Check if current user has already reviewed
        if (user?.email) {
          const userExistingReview = response.data.data.reviews.find(
            review => review.userEmail === user.email
          );
          if (userExistingReview) {
            // Disable review form button if user already has a review
            setShowReviewForm(false);
          }
        }
      }
    } catch (err) {
      console.log('Error fetching reviews:', err.message);
      setReviews([]);
      setTourRating({ rating: "0.0", count: 0 });
    }
  };
  
  const handleDeleteReview = async (reviewId) => {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await axios.delete(`/api/tours/reviews/delete/${reviewId}`, {
            data: { userEmail: user.email }
          });
          
          if (response.data.status === "success") {
            // Refresh reviews
            fetchReviews(id);
            
            Swal.fire(
              'Deleted!',
              'Your review has been deleted.',
              'success'
            );
          }
        }
      });
    } catch (err) {
      console.log('Error deleting review:', err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to delete review",
      });
    }
  };
  
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!userRating) {
      Swal.fire({
        icon: "error",
        title: "Rating Required",
        text: "Please select a rating before submitting your review.",
      });
      return;
    }
    
    try {
      // Submit new review
      const reviewData = {
        userId: user?.id || user?._id || "unknown",
        userName: user?.name || "Anonymous",
        userEmail: user?.email || "anonymous@example.com",
        rating: userRating,
        comment: userReview
      };
      
      const response = await axios.post(`/api/tours/reviews/${id}`, reviewData);
      
      if (response.data.status === "success") {
        // Refresh reviews
        fetchReviews(id);
        
        // Reset form
        setUserReview("");
        setUserRating(0);
        setShowReviewForm(false);
        
        Swal.fire({
          icon: "success",
          title: "Review Submitted",
          text: "Thank you for sharing your experience!",
        });
      }
    } catch (err) {
      console.log('Error submitting review:', err);
      let errorMessage = "Failed to submit your review. Please try again.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errorMessage,
      });
    }
  };

  const validateBookingForm = () => {
    if (!firstName || !lastName || !date || !phone || !guestCount) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Information",
        text: "Please fill in all required fields.",
      });
      return false;
    }

    if (phone.length !== 10) {
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Please enter a valid 10-digit mobile number.",
      });
      return false;
    }

    if (allTours && Number(guestCount) > allTours.groupCount) {
      Swal.fire({
        icon: "error",
        title: "Group Size Exceeded",
        text: `This tour can have a maximum of ${allTours.groupCount} members.`,
      });
      return false;
    }
    
    return true;
  };

  const handleBookNow = (e) => {
    e.preventDefault();
    
    if (!validateBookingForm()) {
      return;
    }
    
    // Instead of directly submitting, show payment component
    setShowPayment(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Prepare booking data for payment
  const bookingData = {
    firstName,
    lastName,
    date,
    phone,
    guestCount,
    email: currentUser
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {/* import upper section */}
      <HeroTour />
      <TourNav />
      
      {/* details brief */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        {/* title */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800">{allTours?.name}</h1>
          
          {/* Location + ID */}
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {allTours?.cities && (
              <div className="flex items-center text-gray-600">
                <MdOutlineLocationOn className="text-xl mr-1 text-blue-600" />
                <span>{allTours.cities}</span>
              </div>
            )}
            <div className="text-gray-500 text-sm">
              Tour ID: {allTours?._id?.substring(0, 8) || "T0027"}
            </div>
          </div>
        </div>

        {/* Tour info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <BiCategory className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Category</h3>
            </div>
            <p className="text-lg">{allTours?.category || "Adventure"}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineCalendar className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Duration</h3>
            </div>
            <p className="text-lg">{allTours?.duration || "0"} days</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineTrophy className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Rating</h3>
            </div>
            <div className="flex items-center">
              {Number(tourRating.rating) > 0 ? (
                <>
                  <p className="text-lg mr-1">{tourRating.rating}</p>
                  <AiFillStar className="text-yellow-500 text-xl" />
                </>
              ) : (
                <p className="text-lg">No ratings yet</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineUser className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Group Size</h3>
            </div>
            <p className="text-lg">Max {allTours?.groupCount || "10"}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <AiOutlineGlobal className="text-blue-600 text-xl" />
              <h3 className="font-semibold">Languages</h3>
            </div>
            <p className="text-lg">{allTours?.languages || "English"}</p>
          </div>
        </div>

        {/* Main content - image, details, booking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column: Tour image and actions */}
          <div>
            <div className="rounded-xl overflow-hidden shadow-md mb-6">
              <img
                src={allTours?.img ? `http://localhost:5000/api/tours/images/${allTours.img}` : "https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"}
                alt={allTours?.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
          </div>
          
          {/* Right column: Booking and payment */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            {!showPayment ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-gray-600 font-medium">Starting From</p>
                      <p className="text-3xl font-bold text-blue-600">
                        NPR {allTours?.price || "0"}
                        <span className="text-sm text-gray-500 font-normal">/person</span>
                      </p>
                    </div>
                    <div className="flex items-center">
                      {Number(tourRating.rating) > 0 ? (
                        <>
                          <AiFillStar className="text-yellow-500 text-xl" />
                          <span className="ml-1 font-medium">{tourRating.rating}</span>
                          <span className="ml-1 text-gray-500 text-sm">({tourRating.count} reviews)</span>
                        </>
                      ) : (
                        <span className="text-gray-500 text-sm">No reviews yet</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-xl font-bold mb-4">Reserve Your Spot</h3>
                    <form onSubmit={handleBookNow}>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">First Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={firstName}
                            onChange={(e) => setFname(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Last Name</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={lastName}
                            onChange={(e) => setLname(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-700 mb-1 text-sm font-medium">Tour Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min={new Date().toISOString().split("T")[0]}
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Phone Number</label>
                          <input
                            type="tel"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-700 mb-1 text-sm font-medium">Number of Guests</label>
                          <input
                            type="number"
                            min="1"
                            max={allTours?.groupCount || 10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={guestCount}
                            onChange={(e) => setGuests(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4 bg-blue-50 p-3 rounded-md">
                        <p className="text-sm text-blue-700">
                          By proceeding, you'll be redirected to a secure payment page after form submission.
                        </p>
                      </div>
                      
                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        Continue to Payment
                      </button>
                    </form>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <h3 className="text-xl font-bold mb-4">Complete Your Booking</h3>
                <TourKhaltiPayment 
                  tourData={allTours} 
                  bookingData={bookingData} 
                  user={user} 
                />
                <button 
                  onClick={() => setShowPayment(false)}
                  className="mt-4 w-full py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Back to Booking Form
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Description</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            {allTours?.description}
          </p>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Tour Overview</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <p className="text-gray-700 leading-relaxed">
            {allTours?.introduction}
          </p>
        </div>
      </div>

      {/* Daily Itinerary */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">Daily Itinerary</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <DaysShow />
        </div>
      </div>

      {/* Inclusions & Exclusions */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <h2 className="text-3xl font-bold mb-6">What's Included</h2>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <InclusionExclusion />
        </div>
      </div>
      
      {/* Reviews Section */}
      <div className="mx-auto max-w-2xl px-4 py-8 sm:px-4 lg:max-w-7xl lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Reviews & Ratings</h2>
          <div className="flex space-x-3">
            {user && !showReviewForm && !reviews.some(review => review.userEmail === user.email) && (
              <button 
                onClick={() => {
                  setUserRating(0);
                  setUserReview("");
                  setShowReviewForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
              >
                Write a Review
              </button>
            )}
          </div>
        </div>
        
        {showReviewForm && (
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
            <h3 className="text-xl font-bold mb-4">Share Your Experience</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Rating</label>
                <RatingStars rating={userRating} setRating={setUserRating} editable={true} />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Your Review</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Share your experience with this tour..."
                  value={userReview}
                  onChange={(e) => setUserReview(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setUserRating(0);
                    setUserReview("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <FaRegComment className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-500">Be the first to review this tour!</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <div className="flex items-center mr-4">
                  <span className="text-3xl font-bold text-gray-900 mr-2">{tourRating.rating}</span>
                  <RatingStars rating={Math.round(Number(tourRating.rating))} setRating={() => {}} size="text-2xl" />
                </div>
                <p className="text-gray-500">Based on {tourRating.count} {tourRating.count === 1 ? 'review' : 'reviews'}</p>
              </div>
              
              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-full mr-3">
                          <FaUser />
                        </div>
                        <div>
                          <h4 className="font-medium">{review.userName}</h4>
                          <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <RatingStars rating={review.rating} setRating={() => {}} />
                        
                        {/* Delete button for user's own review */}
                        {user && user.email === review.userEmail && (
                          <div className="ml-4 flex space-x-2">
                            <button 
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 mt-2">{review.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TourDetails;