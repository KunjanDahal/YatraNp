const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv").config();
const path = require("path");
const app = express();
const bodyParser = require("body-parser");
const colors = require("colors");
const userRoutes = require("./routes/userRoutes");



const cors = require("cors");
//db connection
const connectDB = require("./config/db");
connectDB();
app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(cors());

//to accept body data

//to use json

//middlewares

app.use(bodyParser.json({ limit: "50mb" }));

//to accept body data
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());

//calling the routes
//isuru
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));



//yasiru


app.use("/api/vehicle/images", express.static(path.join(__dirname, "images")));





app.use('/api/hotels/images', express.static(path.join(__dirname, 'images')));

//navindi




// sehan













//hansika


app.get("/", (req, res) => {
  res.send("API is Running Succesfully");
});



app.use("/api/user", userRoutes);



//define the port number
const port = process.env.PORT || 5000;

//start the server
const server = app.listen(port, () =>
  console.log(`Server running on port ${port} 🔥`)
);

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    orgin: "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  console.log("Connected to socket.io");
});
