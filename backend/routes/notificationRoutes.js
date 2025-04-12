const express = require("express");
const router = express.Router();
const { 
  createNotification, 
  getUserNotifications, 
  markAsRead, 
  markAllAsRead 
} = require("../controllers/notificationController");

// Create a new notification
router.post("/", createNotification);

// Get notifications for a user
router.get("/", getUserNotifications);

// Mark a notification as read
router.put("/:id", markAsRead);

// Mark all notifications as read
router.put("/mark-all-read", markAllAsRead);

module.exports = router; 