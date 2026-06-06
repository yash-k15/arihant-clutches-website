import express from 'express';
import {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
  sendOTP,
  verifyOTP,
  registerWithPhone,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

import { sendMSG91OTP } from '../utils/msg91Service.js';

const router = express.Router();

router.post('/login', authUser);

router.route('/').post(registerUser).get(protect, admin, getUsers);

router.post('/logout', logoutUser);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/register-phone', registerWithPhone);

router.get('/test-msg91', async (req, res) => {
  const result = await sendMSG91OTP('9167015147');

  res.json(result);
});

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:token', resetPassword);

export default router;
