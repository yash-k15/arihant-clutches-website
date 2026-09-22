import express from 'express';
import { getDashboardOverview } from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getDashboardOverview);

export default router;
