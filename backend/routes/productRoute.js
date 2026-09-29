import express from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  adjustVariantStock,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductBySlug,
  getCategories,
  getCategoryCounts,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getProducts).post(protect, admin, createProduct);

router.get('/top', getTopProducts);

// Category routes
router
  .route('/categories')
  .get(getCategories)
  .post(protect, admin, createCategory);

router.get('/category-counts', getCategoryCounts);

router
  .route('/categories/:id')
  .put(protect, admin, updateCategory)
  .delete(protect, admin, deleteCategory);

router.patch(
  '/:slug/variants/:variantId/stock',
  protect,
  admin,
  adjustVariantStock,
);

router
  .route('/:slug')
  .get(getProductBySlug)
  .put(protect, admin, updateProduct)
  .delete(protect, admin, deleteProduct);

router.route('/:slug/reviews').post(protect, createProductReview);

export default router;
