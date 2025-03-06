const jwt = require('jsonwebtoken');
//normal user
const User = require('../models/userModel.js');

const getTokenFromRequest = (req) => {
  // First try to get token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Extract the token and remove any quotes or extra whitespace
    const token = authHeader.split(' ')[1].trim().replace(/['"]+/g, '');
    console.log('Token from Authorization header:', token);
    return token;
  }
  
  // If no Authorization header, try to get from cookies
  const cookieToken = req.cookies.access_token;
  if (cookieToken) {
    console.log('Token from cookies:', cookieToken);
    return cookieToken.replace(/['"]+/g, '');
  }
  
  console.log('No token found in request');
  return null;
};

const verifyJWT = (token) => {
  try {
    console.log('Verifying token with JWT secret');
    const decoded = jwt.verify(token, process.env.JWT);
    console.log('Decoded token:', decoded);
    return decoded;
  } catch (err) {
    console.error('JWT Verification error:', err);
    throw err;
  }
};

const userMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('User middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};
//admin
const adminMiddleware = async (req, res, next) => {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No token provided' 
      });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied - Admin privileges required' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};
//activity organizer
const organizerMiddleware = (req, res, next) => {
    if (req.user.type !== 'eventOrganizer') {
        return res.status(403).json({ message: 'Access denied. Only event organizers can perform this action.' });
    }
    next();
};

const eventManagementMiddleware = async (req, res, next) => {
  try {
    console.log('Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    
    const token = getTokenFromRequest(req);
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token found' 
      });
    }

    const decoded = verifyJWT(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    if (!user.isAdmin && user.type !== 'eventOrganizer') {
      return res.status(403).json({ 
        success: false,
        message: 'Access denied. Only administrators and event organizers can perform this action.' 
      });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Event management middleware error:', err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token format' 
      });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token has expired' 
      });
    }
    return res.status(500).json({ 
      success: false,
      message: 'Authentication failed',
      error: err.message 
    });
  }
};

module.exports = {
  userMiddleware,
  adminMiddleware,
  organizerMiddleware,
  eventManagementMiddleware
};
