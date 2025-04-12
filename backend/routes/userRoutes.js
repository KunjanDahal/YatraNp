const express = require("express");
const userController = require("../controllers/userController");
const {
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  getUserCount
} = userController;
const {
  verifyToken,
  verifyUser,
  verifyAdmin,
} = require("../middleware/verifyToken");

const {
  registerUser,
  allUsers,
  authUser,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/verifyToken");

const router = express.Router();

router.get("/checkauthentication", verifyToken, (req, res, next) => {
  res.status(200).json({ message: "Authenticated" });
});

router.get("/checkuser/:id", verifyUser, (req, res, next) => {
  res
    .status(200)
    .json({ message: "Hello user,You are logged in you can do this" });
});

router.get("/checkadmin/:id", verifyAdmin, (req, res, next) => {
  res
    .status(200)
    .json({ message: "Hello admin,You are logged in you can do this" });
});

// Analytics routes for dashboard - must be placed before the general routes
router.get("/count", getUserCount);

//update
router.put("/:id", verifyUser, updateUser);
//delete
router.delete("/:id", verifyUser, deleteUser);
//get
router.get("/:id", verifyUser, getUser);

// Post route for creating users
router.post("/", registerUser);

// Admin route for getting all users
router.get("/admin/all", verifyAdmin, getAllUsers);

// Search API
router.get("/search", protect, allUsers);

// Login route
router.post("/login", authUser);

module.exports = router;
