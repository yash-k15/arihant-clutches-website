import express from 'express';
import {
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  checkStock,
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getOrders);

router.route('/mine').get(protect, getMyOrders);

router.route('/checkStock').post(protect, checkStock);

router.route('/:id').get(protect, getOrderById);

router.route('/:id/pay').put(protect, admin, updateOrderToPaid);

router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
