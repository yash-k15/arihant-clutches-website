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
  // changeUserPhone,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  // verifyPhoneChangeOTP,
  // registerWithPhone,
  // sendPasswordChangeOTP,
  // verifyPasswordChangeOTP,
  // changeAdminPassword,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  authLimiter,
  otpLimiter,
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

// router.put('/change-phone', protect, changeUserPhone);

// router.post('/verify-phone-change-otp', protect, verifyPhoneChangeOTP);
// router.post(
//   '/send-password-change-otp',
//   protect,
//   otpLimiter,
//   sendPasswordChangeOTP,
// );

// router.post(
//   '/verify-password-change-otp',
//   protect,
//   otpLimiter,
//   verifyPasswordChangeOTP,
// );

// router.put('/change-password', protect, changeAdminPassword);

router.post('/send-otp', otpLimiter, sendOTP);
router.post('/verify-otp', otpLimiter, verifyOTP);
// router.post('/register-phone', authLimiter, registerWithPhone);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.post('/forgotpassword', passwordResetLimiter, forgotPassword);
router.put('/resetpassword/:token', passwordResetLimiter, resetPassword);

export default router;
