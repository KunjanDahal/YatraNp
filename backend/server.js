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

// Import Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");

// Initialize Express app
const app = express();



// Database Connection
connectDB();

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Middleware for handling CORS
app.use(cors());

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


// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("API is Running Successfully");
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
    origin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io".cyan.bold);
});

//tour
const tourRouter = require("./routes/tourRouter");
app.use("/api/tours", tourRouter);
