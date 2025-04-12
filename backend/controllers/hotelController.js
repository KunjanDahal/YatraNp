// Get count of hotels for dashboard
const getHotelCount = async (req, res) => {
  try {
    const count = await Hotel.countDocuments();
    res.status(200).json({ count });
  } catch (err) {
    console.error("Error getting hotel count:", err);
    res.status(500).json({ message: "Error getting hotel count", error: err.message });
  }
};

// Get monthly hotel bookings for dashboard
const getMonthlyBookings = async (req, res) => {
  try {
    const pipeline = [
      {
        $project: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" }
        }
      },
      {
        $group: {
          _id: { month: "$month", year: "$year" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      }
    ];

    const bookings = await HotelBooking.aggregate(pipeline);
    
    // Transform data to include month names
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const result = bookings.map(booking => ({
      month: months[booking._id.month - 1],
      year: booking._id.year,
      count: booking.count
    }));
    
    res.status(200).json(result);
  } catch (err) {
    console.error("Error getting monthly bookings:", err);
    res.status(500).json({ message: "Error getting monthly bookings", error: err.message });
  }
};

module.exports = {
  getHotelCount,
  getMonthlyBookings
}; 