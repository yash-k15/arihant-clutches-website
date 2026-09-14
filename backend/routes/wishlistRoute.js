import express from 'express';

import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  createWishlistShare,
  getSharedWishlist,
  addToSharedWishlist,
  removeFromSharedWishlist,
  clearSharedWishlist,
} from '../controllers/wishlistController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Logged-in user's wishlist
router
  .route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist)
  .delete(protect, clearWishlist);

// Create/retrieve share link for logged-in user's wishlist
router.post('/share', protect, createWishlistShare);

// Shared wishlist
router
  .route('/shared/:shareToken')
  .get(getSharedWishlist)
  .post(addToSharedWishlist)
  .delete(clearSharedWishlist);

// Remove an item from shared wishlist
router.delete(
  '/shared/:shareToken/:productId/:variantId',
  removeFromSharedWishlist,
);

// Remove an item from logged-in user's wishlist
router.delete('/:productId/:variantId', protect, removeFromWishlist);

export default router;
