import jwt from 'jsonwebtoken';
import asyncHandler from './asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return next(new ErrorResponse('Not Authorized to access this route', 401));

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'arihant-clutches-api',
      audience: 'arihant-clutches-web',
    });
  } catch {
    return next(new ErrorResponse('Not Authorized to access this route', 401));
  }

  // Keep database failures separate from invalid-token responses.
  req.user = await User.findById(decoded.userId).select('_id name email phone isAdmin tokenVersion');
  if (!req.user || decoded.tokenVersion !== req.user.tokenVersion) {
    return next(new ErrorResponse('Not Authorized to access this route', 401));
  }
  next();
});

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) next();
  else return next(new ErrorResponse('Not authorized as an admin', 401));
};

export { protect, admin };
