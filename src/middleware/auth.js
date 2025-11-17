import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';
import Client from '../models/Client.js';

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    try {
      // Verify token
      const decoded = verifyToken(token);

      // Check if it's a client token
      if (decoded.type === 'client') {
        req.client = await Client.findById(decoded.clientId);
        req.taskId = decoded.taskId;
        req.userType = 'client';
      } else {
        // Regular user token
        req.user = await User.findById(decoded.id).select('-password');
        req.userType = 'user';
        
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }

        if (!req.user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'User account is deactivated'
          });
        }
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

/**
 * Authorize specific roles
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (req.userType === 'client') {
      return res.status(403).json({
        success: false,
        message: 'Clients are not authorized for this action'
      });
    }

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user?.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = verifyToken(token);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but continue anyway
      }
    }

    next();
  } catch (error) {
    next();
  }
};

