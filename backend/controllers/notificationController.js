const Notification = require("../models/notification");

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    const savedNotification = await newNotification.save();

    // Emit socket event for real-time notification
    if (req.app.get('io')) {
      req.app.get('io').to(req.body.userEmail).emit('newNotification', savedNotification);
    }

    res.status(200).json({
      status: "success",
      data: {
        notification: savedNotification,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Get notifications for a specific user
const getUserNotifications = async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({
        status: "unsuccess",
        message: "User email is required",
      });
    }

    const notifications = await Notification.find({ userEmail })
      .sort('-createdAt')
      .limit(10);
      
    res.status(200).json({
      status: "success",
      results: notifications.length,
      data: {
        notifications,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    if (!updatedNotification) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Notification not found",
      });
    }
    
    res.status(200).json({
      status: "success",
      data: {
        notification: updatedNotification,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    const userEmail = req.body.email;
    if (!userEmail) {
      return res.status(400).json({
        status: "unsuccess",
        message: "User email is required",
      });
    }

    const result = await Notification.updateMany(
      { userEmail, read: false },
      { read: true }
    );
    
    res.status(200).json({
      status: "success",
      message: `${result.modifiedCount} notifications marked as read`,
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
}; 