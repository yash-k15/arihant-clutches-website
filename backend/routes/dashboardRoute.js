import express from 'express';
import {
  getDashboardOverview,
  getDashboardSales,
} from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getDashboardOverview);
router.route('/sales').get(protect, admin, getDashboardSales);

export default router;
