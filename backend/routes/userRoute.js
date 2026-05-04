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
} from '../controllers/userController.js';
const router = express.Router();

router.post('/login', authUser);

router.route('/').post(registerUser).get(getUsers);

router.post('/logout', logoutUser);

router.route('/profile').get(getUserProfile).put(updateUserProfile);

router.route('/:id').get(getUserById).put(updateUser).delete(deleteUser);

export default router;
