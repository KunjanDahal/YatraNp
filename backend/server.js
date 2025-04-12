const express = require("express");
const dotenv = require('dotenv').config();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const cookieSession = require('cookie-session');
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require('./config/passport'); 
const connectDB = require("./config/db");
const { createImagesDirectory } = require('./config/init');

// Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const activityRoutes = require("./routes/activityRoute");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Initialize Express app
const app = express();

// Create necessary directories
createImagesDirectory();

// Database Connection
connectDB();

// Middleware for handling CORS
app.use(cors({
  origin: ["http://localhost:30000", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware for parsing cookies
app.use(cookieParser());


app.use(session({
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(passport.initialize());
app.use(passport.session());


// Static file serving for images
app.use("/api/vehicle/images", express.static(path.join(__dirname, "images")));
app.use("/api/hotels/images", express.static(path.join(__dirname, "images")));
app.use("/api/tours/images", express.static(path.join(__dirname, "images")));
app.use("/images", express.static(path.join(__dirname, "images")));


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", notificationRoutes);

//tour
const tourRouter = require("./routes/tourRouter");
app.use("/api/tours", tourRouter);

//hotel
const hotels = require('./routes/hotels');
app.use('/api/hotels', hotels);

//restaurant
const restaurants = require('./routes/restaurants');
app.use('/api/restaurant', restaurants);

//restaurant reservations
const restaurantRouter = require('./routes/restaurantRouter');
app.use('/api/restaurants', restaurantRouter);

//vehicle
const vehicles = require('./routes/vehicles');
app.use('/api/vehicle', vehicles);

// Default Route
app.get("/", (req, res) => {
  res.send("API is Running Successfully");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message, err.stack);
  // Don't crash the server, just log the error
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥');
  console.error(err.name, err.message, err.stack);
  // Don't crash the server, just log the error
});

// Define Port and Start Server
const port = process.env.PORT || 5000;
const server = app.listen(port, () =>
  console.log(`Server running on port ${port} 🔥`.yellow.bold)
);

// Socket.io Configuration
const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: ["http://localhost:30000", "http://localhost:3000"],
  },
});

// Store the io instance in the app for use in controllers
app.set('io', io);

io.on("connection", (socket) => {
  console.log("User connected to socket.io".cyan.bold);

  // Join a room with the user's email
  socket.on("join", (userEmail) => {
    if (userEmail) {
      console.log(`User joined room: ${userEmail}`.cyan);
      socket.join(userEmail);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected from socket.io".yellow);
  });
});

