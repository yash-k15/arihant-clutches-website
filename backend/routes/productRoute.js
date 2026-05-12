import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductBySlug,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);

router.get('/top', getTopProducts);

router
  .route('/:slug')
  .get(getProductBySlug)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:slug/reviews').post(protect, createProductReview);
export default router;
