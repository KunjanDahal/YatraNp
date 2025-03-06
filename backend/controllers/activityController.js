const SpecialActivity = require('../models/SpecialActivityModel.js');

const moment = require('moment');
const createActivity = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      id,
      name,
      location,
      dateRange,
      timeRange,
      type,
      description,
      image,
    } = req.body;

    // Validate required fields
    if (!name || !location || !dateRange || !timeRange || !type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['name', 'location', 'dateRange', 'timeRange', 'type']
      });
    }

    // Validate date range
    const startDate = new Date(dateRange.startDate);
    const endDate = new Date(dateRange.endDate);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      });
    }

    if (endDate < startDate) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (id) {
      // Editing an existing activity
      const existingActivity = await SpecialActivity.findById(id);

      if (!existingActivity) {
        return res.status(404).json({
          success: false,
          message: 'Activity not found'
        });
      }

      // Update the activity
      existingActivity.name = name;
      existingActivity.location = location;
      existingActivity.dateRange = {
        startDate: startDate,
        endDate: endDate
      };
      existingActivity.timeRange = timeRange;
      existingActivity.type = type;
      existingActivity.description = description;
      existingActivity.image = image;

      const updatedActivity = await existingActivity.save();

      return res.status(200).json({
        success: true,
        updated: true,
        activity: updatedActivity
      });
    } else {
      // Creating a new activity
      const newActivity = new SpecialActivity({
        user: user._id,
        name,
        location,
        dateRange: {
          startDate: startDate,
          endDate: endDate
        },
        timeRange,
        type,
        description,
        image,
        status: 'PENDING'
      });

      const savedActivity = await newActivity.save();

      return res.status(201).json({
        success: true,
        created: true,
        activity: savedActivity
      });
    }
  } catch (error) {
    console.error('Error in createActivity:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to save activity',
      error: error.message
    });
  }
};

const approveActivity = async (req, res) => {
  try {
    console.log(req.params);
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findByIdAndUpdate(
      activityId,
      { $set: { status: 'APPROVED' } },
      { new: true }
    );
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getApprovedActivities = async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  try {
    const activities = await SpecialActivity.find({ status: 'APPROVED' })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await SpecialActivity.countDocuments({ status: 'APPROVED' });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyActivities = async (req, res) => {
  const { page = 1, limit = 100 } = req.query;
  const user = req.user;
  try {
    const activities = await SpecialActivity.find({ user: user })
      .sort({ createdAt: 1 }) // add this line to sort by creation date in descending order
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await SpecialActivity.countDocuments({ user: user });

    res.status(200).json({
      success: true,
      page,
      limit,
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      activities,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPendingActivities = async (req, res) => {
  try {
    // Debug logging
    console.log('Request headers:', req.headers);
    console.log('Request user:', req.user);
    console.log('Request cookies:', req.cookies);

    // Check if user exists and is authenticated
    const user = req.user;
    if (!user) {
      console.log('No user found in request');
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Check if user is admin or event organizer
    if (!user.isAdmin && user.type !== 'eventOrganizer') {
      console.log('User is not authorized:', user);
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only administrators and event organizers can view pending activities.'
      });
    }

    const { page = 1, limit = 100 } = req.query;

    // If user is an event organizer, only show their activities
    const query = user.isAdmin ? { status: 'PENDING' } : { status: 'PENDING', user: user._id };
    console.log('MongoDB query:', query);

    try {
      const activities = await SpecialActivity.find(query)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean()
        .exec();

      console.log('Found activities:', activities.length);

      const count = await SpecialActivity.countDocuments(query);
      console.log('Total count:', count);

      return res.status(200).json({
        success: true,
        page,
        limit,
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        activities,
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return res.status(500).json({ 
        success: false,
        message: 'Database error while fetching activities',
        error: dbError.message
      });
    }
  } catch (error) {
    console.error('Detailed error in getPendingActivities:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return res.status(500).json({ 
      success: false,
      message: 'Failed to fetch pending activities',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

const declineActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findByIdAndUpdate(
      activityId,
      { $set: { status: 'DECLINED' } },
      { new: true }
    );
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const updatedActivity = await SpecialActivity.findOneAndDelete(activityId);
    res.status(200).json({ success: true, activity: updatedActivity });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const filterActivities = async (req, res) => {
  try {
    const { name, type, startDate, endDate, startTime, endTime, searchQuery } =
      req.query;

    const filter = { status: 'APPROVED' };
    if (name) filter.name = { $regex: name, $options: 'i' };
    if (type) filter.type = type;

    if (startDate && endDate)
      filter['dateRange.startDate'] = { $lte: moment(endDate).toDate() };
    if (startDate && endDate)
      filter['dateRange.endDate'] = { $gte: moment(startDate).toDate() };
    if (startTime && endTime) filter['timeRange.startTime'] = { $lte: endTime };
    if (startTime && endTime) filter['timeRange.endTime'] = { $gte: startTime };

    if (searchQuery) {
      filter.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
      ];
    }

    const activities = await SpecialActivity.find(filter);
    res.status(200).json({ activities });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getActivity = async (req, res) => {
  try {
    const activityId = req.params.id;
    const activity = await SpecialActivity.findById(activityId);
    res.status(200).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createActivity,
  approveActivity,
  getApprovedActivities,
  getPendingActivities,
  declineActivity,
  filterActivities,
  getMyActivities,
  getActivity,
  deleteActivity,
};
