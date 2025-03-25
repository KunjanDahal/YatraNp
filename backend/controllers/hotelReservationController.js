const mongoose = require("mongoose");

// Create a simple schema for testing
const hotelReservationSchema = new mongoose.Schema({
  userName: String,
  checkInDate: Date,
  nights: Number,
  phone: String,
  status: {
    type: String,
    enum: ["PENDING", "APPROVED", "DECLINED"],
    default: "PENDING"
  }
}, { timestamps: true });

// Create model if it doesn't exist yet
let HotelReservation;
try {
  HotelReservation = mongoose.model("HotelReservation");
} catch {
  HotelReservation = mongoose.model("HotelReservation", hotelReservationSchema);
}

const getAllReservations = async (req, res) => {
  try {
    const allReservations = await HotelReservation.find();
    console.log("Hotel reservations found:", allReservations);
    
    // If no reservations exist, create a sample one for testing
    if (allReservations.length === 0) {
      console.log("No hotel reservations found, creating a sample one");
      const sampleReservation = new HotelReservation({
        userName: "John Smith",
        checkInDate: new Date(),
        nights: 3,
        phone: "9876543210",
        status: "PENDING"
      });
      
      await sampleReservation.save();
      console.log("Sample hotel reservation created");
      const updatedReservations = await HotelReservation.find();
      res.status(200).send(updatedReservations);
    } else {
      res.status(200).send(allReservations);
    }
  } catch (err) {
    console.log(err);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Approve a hotel reservation
const approveReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedReservation = await HotelReservation.findByIdAndUpdate(
      id,
      { status: "APPROVED" },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reservation approved successfully",
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Decline a hotel reservation
const declineReservation = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedReservation = await HotelReservation.findByIdAndUpdate(
      id,
      { status: "DECLINED" },
      { new: true }
    );

    if (!updatedReservation) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Reservation declined successfully",
      data: {
        reservation: updatedReservation,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = { 
  getAllReservations,
  approveReservation,
  declineReservation
}; 