// Script to approve all existing vehicles in the database
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('Connected to MongoDB');
  approveVehicles();
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Function to approve all vehicles
async function approveVehicles() {
  try {
    // Find all vehicles that aren't approved yet
    const unapprovedVehicles = await Vehicle.find({ isAccepted: false });
    
    console.log(`Found ${unapprovedVehicles.length} unapproved vehicles`);
    
    if (unapprovedVehicles.length === 0) {
      console.log('No vehicles need approval');
      mongoose.connection.close();
      return;
    }

    // Update all unapproved vehicles to be approved
    const result = await Vehicle.updateMany(
      { isAccepted: false },
      { $set: { isAccepted: true } }
    );

    console.log(`Updated ${result.modifiedCount} vehicles to approved status`);
    
    // Close the MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');

  } catch (error) {
    console.error('Error approving vehicles:', error);
    mongoose.connection.close();
    process.exit(1);
  }
} 