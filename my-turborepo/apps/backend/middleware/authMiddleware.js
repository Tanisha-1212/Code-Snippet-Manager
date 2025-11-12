// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (req.isAuthenticated && req.isAuthenticated()) {
      return next();
    }

    res.status(401).json({ message: 'Not authorized, please login' });
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
// Optional authentication - doesn't fail if no token

export const optionalAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated via session
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      // req.user is already populated by passport.deserializeUser
      // which includes the populated fields (snippets, collections, favorites)
      return next();
    }
    
    // No user authenticated, continue anyway
    req.user = null;
    next();
  } catch (error) {
    // If there's any error, just continue without user
    console.error('Optional auth error:', error);
    req.user = null;
    next();
  }
};
