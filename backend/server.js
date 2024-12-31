const express = require("express");
const dotenv = require("dotenv").config();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const colors = require("colors");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
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

// Passport.js configuration
require('./config/passport');

// Session Middleware (Required before Passport.js initialization)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
}));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Google Authentication Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:3000/'); // Redirect to frontend after successful login
  }
);


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
