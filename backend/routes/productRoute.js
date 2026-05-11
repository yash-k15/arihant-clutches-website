import express from 'express';
import {
  getProducts,
  getProduct,
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
  .route('/admin/:id')
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:slug').get(getProductBySlug);

router.route('/:id/reviews').post(protect, createProductReview);
export default router;
