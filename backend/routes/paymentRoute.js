import express from 'express';
import {
  createOrder,
  verifyPayment,
  handleRazorpayWebhook,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/create-order').post(protect, createOrder);
router.route('/verify-payment').post(protect, verifyPayment);
router.route('/webhook').post(handleRazorpayWebhook);

export default router;
