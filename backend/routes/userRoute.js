import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultUserAddress,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  authLimiter,
  otpSendLimiter,
  otpVerifyLimiter,
  passwordResetLimiter,
} from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/login', authLimiter, authUser);

router.route('/').post(authLimiter, registerUser).get(protect, admin, getUsers);

router.post('/logout', logoutUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router
  .route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addUserAddress);

router
  .route('/addresses/:addressId')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

router.put('/addresses/:addressId/default', protect, setDefaultUserAddress);

router.post('/send-otp', otpSendLimiter, sendOTP);
router.post('/verify-otp', otpVerifyLimiter, verifyOTP);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.post('/forgotpassword', passwordResetLimiter, forgotPassword);
router.put('/resetpassword/:token', passwordResetLimiter, resetPassword);

export default router;
