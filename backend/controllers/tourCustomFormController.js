const customForm = require("../models/tourCustomForm");
const Notification = require("../models/notification");
const axios = require("axios");

const createForm = async (req, res) => {
  try {
    const newForm = new customForm(req.body);
    const savedForm = await newForm.save();

    res.status(200).json({
      status: "success",
      message: "Details Saved! Our Agent will contact you",
      data: {
        form: savedForm,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Unsuccess",
      message: err.message,
    });
  }
};

// Get all custom form submissions
const getAllForms = async (req, res) => {
  try {
    const allForms = await customForm.find().sort('-createdAt');
    res.status(200).json(allForms);
  } catch (err) {
    console.log(err.message);
    res.status(404).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Update a custom form submission
const updateForm = async (req, res) => {
  try {
    const updatedForm = await customForm.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    
    if (!updatedForm) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Form not found with that ID",
      });
    }
    
    res.status(200).json({
      status: "success",
      data: {
        form: updatedForm,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Delete a custom form submission
const deleteForm = async (req, res) => {
  try {
    const deletedForm = await customForm.findByIdAndDelete(req.params.id);
    
    if (!deletedForm) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Form not found with that ID",
      });
    }
    
    res.status(200).json({
      status: "success",
      message: "Form deleted successfully",
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

// Respond to a form submission
const respondToForm = async (req, res) => {
  try {
    const updatedForm = await customForm.findByIdAndUpdate(
      req.params.id,
      { 
        status: "responded", 
        adminResponse: req.body.response,
        respondedAt: Date.now()
      },
      { new: true }
    );
    
    if (!updatedForm) {
      return res.status(404).json({
        status: "unsuccess",
        message: "Form not found with that ID",
      });
    }
    
    // Create notification for user
    try {
      const notification = {
        userId: updatedForm.currentUserId || "unknown",
        userEmail: updatedForm.currentUser,
        message: `Your tour request from ${updatedForm.whereFrom} to ${updatedForm.whereTo} has received a response.`,
        type: "tour_request",
        linkTo: "/profile" // Link to view responses
      };
      
      // Create notification
      const newNotification = new Notification(notification);
      await newNotification.save();
      
      // Emit socket event for real-time notification
      if (req.app.get('io')) {
        req.app.get('io').to(updatedForm.currentUser).emit('newNotification', newNotification);
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      // Continue even if notification creation fails
    }
    
    res.status(200).json({
      status: "success",
      message: "Response sent successfully",
      data: {
        form: updatedForm,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "unsuccess",
      message: err.message,
    });
  }
};

module.exports = { 
  createForm, 
  getAllForms, 
  updateForm, 
  deleteForm, 
  respondToForm 
};
