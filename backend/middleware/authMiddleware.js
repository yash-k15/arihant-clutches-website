import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/userModel.js';

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token;

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not Authorized to access this route`, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'arihant-clutches-api',
      audience: 'arihant-clutches-web',
    });

    req.user = await User.findById(decoded.userId).select(
      '_id name email phone isAdmin tokenVersion',
    );

    // User no longer exists
    if (!req.user) {
      return next(
        new ErrorResponse('Not Authorized to access this route', 401),
      );
    }

    // Session has been revoked
    if (decoded.tokenVersion !== req.user.tokenVersion) {
      return next(
        new ErrorResponse('Not Authorized to access this route', 401),
      );
    }

    next();
  } catch (err) {
    return next(new ErrorResponse(`Not Authorized to access this route`, 401));
  }
});

// User must be an admin
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return next(new ErrorResponse('Not authorized as an admin', 401));
  }
};

export { protect, admin };
