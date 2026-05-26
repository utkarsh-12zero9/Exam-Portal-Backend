import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Protect routes
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. Token is missing.',
      });
    }

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback_key_123456');
      
      req.user = await User.findById(decoded.id);
      
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User matching token was not found.',
        });
      }

      next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. Invalid or expired token.',
      });
    }
  } catch (error) {
    next(error);
  }
};

// Grant access to specific roles
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user ? req.user.role : 'guest'}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

// Optionally protect routes (parse user if token exists, but don't reject if not)
export const optionalProtect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback_key_123456');
      req.user = await User.findById(decoded.id);
    }
    next();
  } catch (error) {
    // Fail silently and proceed as guest
    next();
  }
};
