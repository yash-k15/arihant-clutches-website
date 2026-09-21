import express from 'express';

import {
  getCarousel,
  addCarouselItem,
  removeCarouselItem,
  updateCarousel,
} from '../controllers/carouselController.js';

import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getCarousel).put(protect, admin, updateCarousel);

router
  .route('/items')
  .post(protect, admin, addCarouselItem)
  .delete(protect, admin, removeCarouselItem);

export default router;
