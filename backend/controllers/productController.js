import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Product, { Category } from '../models/productModel.js';
import slugify from 'slugify';

// @desc    Get all Products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const filters = {};

  if (req.query.keyword) {
    const searchRegex = {
      $regex: req.query.keyword,
      $options: 'i',
    };

    filters.$or = [
      { name: searchRegex },
      { brand: searchRegex },
      { category: searchRegex },
      { description: searchRegex },
      { 'variants.color': searchRegex },
    ];
  }

  if (req.query.adminSearch) {
    const searchRegex = {
      $regex: req.query.adminSearch,
      $options: 'i',
    };

    filters.$or = [{ name: searchRegex }, { 'variants.color': searchRegex }];
  }

  if (req.query.category) {
    const category = await Category.findOne({
      slug: req.query.category,
    });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    filters.category = category.name;
  }

  if (req.query.isFeatured === 'true') {
    filters.isFeatured = true;
  }

  if (req.query.isNewArrival === 'true') {
    filters.isNewArrival = true;
  }

  if (req.query.isBestSeller === 'true') {
    filters.isBestSeller = true;
  }

  // Availability filter
  if (req.query['filter.v.availability'] === '1') {
    filters.variants = {
      $elemMatch: {
        countInStock: { $gt: 0 },
      },
    };
  }

  // Price filter
  const priceFilter = {};

  if (req.query['filter.v.price.gte'] !== undefined) {
    priceFilter.$gte = Number(req.query['filter.v.price.gte']);
  }

  if (req.query['filter.v.price.lte'] !== undefined) {
    priceFilter.$lte = Number(req.query['filter.v.price.lte']);
  }

  if (Object.keys(priceFilter).length > 0) {
    filters['variants.0.price'] = priceFilter;
  }

  // Product Type filter
  const productTypes = req.query['filter.p.product_type'];

  if (productTypes) {
    const selectedProductTypes = Array.isArray(productTypes)
      ? productTypes
      : [productTypes];

    filters.category = {
      $in: selectedProductTypes,
    };
  }

  const count = await Product.countDocuments(filters);

  let sortOption = { createdAt: -1 };

  switch (req.query.sort) {
    case 'price-asc':
      sortOption = {
        'variants.0.price': 1,
        createdAt: -1,
      };
      break;

    case 'price-desc':
      sortOption = {
        'variants.0.price': -1,
        createdAt: -1,
      };
      break;

    case 'rating':
      sortOption = {
        rating: -1,
        createdAt: -1,
      };
      break;

    case 'latest':
    default:
      sortOption = {
        createdAt: -1,
      };
      break;
  }

  const products = await Product.find(filters)
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Get Single Products
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
  });

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc Create a product
// @route POST /api/products
// @access Private/Admin
const createProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    brand,
    category,
    description,
    material,
    dimensions,
    weight,
    isFeatured,
    isNewArrival,
    isBestSeller,
    variants,
    video,
  } = req.body;

  const product = new Product({
    user: req.user._id,
    name,
    brand,
    category,
    description,
    material,
    dimensions,
    weight,
    isFeatured,
    isNewArrival,
    isBestSeller,
    variants,
    video,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc Update a product
// @route PUT /api/product/:slug
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    description,
    brand,
    category,
    material,
    isFeatured,
    isNewArrival,
    isBestSeller,
    weight,
    dimensions,
    variants,
    video,
  } = req.body;

  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  product.name = name || product.name;
  product.description = description || product.description;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.material = material || product.material;
  product.isFeatured = isFeatured ?? product.isFeatured;
  product.isNewArrival = isNewArrival ?? product.isNewArrival;
  product.isBestSeller = isBestSeller ?? product.isBestSeller;
  product.weight = weight ?? product.weight;
  product.dimensions = dimensions || product.dimensions;
  product.variants = variants || product.variants;

  if (video !== undefined) {
    product.video = video;
  }

  const updatedProduct = await product.save();
  res.status(200).json(updatedProduct);
});

// @desc Delete a product
// @route DELETE /api/product/:id
// @access Private/Admin
const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  await Product.deleteOne({ _id: product._id });
  res.status(200).json({ message: 'Product deleted' });
});

// @desc Create a new review
// @route POST /api/product/:id/reviews
// @access Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findOne({ slug: req.params.slug });

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString(),
    );

    if (alreadyReviewed) {
      res.status(404);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;

    product.rating =
      product.reviews.reduce((acc, review) => acc + review.rating, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Resource not found');
  }
});

// @desc Get top rated products
// @route GET /api/products/top
// @access Public
const getTopProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).sort({ rating: -1 }).limit(3);
  res.status(200).json(products);
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });

  res.status(200).json(categories);
});

// @desc    Get product counts for each category
// @route   GET /api/products/category-counts
// @access  Public
const getCategoryCounts = asyncHandler(async (req, res) => {
  const filters = {};

  if (req.query.keyword) {
    filters.name = {
      $regex: req.query.keyword,
      $options: 'i',
    };
  }

  if (req.query.category) {
    const category = await Category.findOne({
      slug: req.query.category,
    });

    if (!category) {
      res.status(404);
      throw new Error('Category not found');
    }

    filters.category = category.name;
  }

  if (req.query.isFeatured === 'true') {
    filters.isFeatured = true;
  }

  if (req.query.isNewArrival === 'true') {
    filters.isNewArrival = true;
  }

  if (req.query.isBestSeller === 'true') {
    filters.isBestSeller = true;
  }

  if (req.query.availability === '1') {
    filters.variants = {
      $elemMatch: {
        countInStock: { $gt: 0 },
      },
    };
  }

  if (req.query.priceGte !== undefined || req.query.priceLte !== undefined) {
    const priceFilter = {};

    if (req.query.priceGte !== undefined) {
      priceFilter.$gte = Number(req.query.priceGte);
    }

    if (req.query.priceLte !== undefined) {
      priceFilter.$lte = Number(req.query.priceLte);
    }

    filters['variants.0.price'] = priceFilter;
  }

  const counts = await Product.aggregate([
    {
      $match: filters,
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  const categoryCounts = {};

  counts.forEach((item) => {
    categoryCounts[item._id] = item.count;
  });

  res.status(200).json(categoryCounts);
});

// @desc    Create a category
// @route   POST /api/products/categories
// @access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const trimmedName = name.trim();

  const existingCategory = await Category.findOne({
    name: { $regex: `^${trimmedName}$`, $options: 'i' },
  });

  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const category = await Category.create({
    name: trimmedName,
    slug: slugify(trimmedName, {
      lower: true,
      strict: true,
    }),
  });

  res.status(201).json(category);
});

// @desc    Update a category
// @route   PUT /api/products/categories/:id
// @access  Private/Admin
const updateCategory = asyncHandler(async (req, res, next) => {
  const { name } = req.body;

  if (!name?.trim()) {
    res.status(400);
    throw new Error('Category name is required');
  }

  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  const trimmedName = name.trim();

  const existingCategory = await Category.findOne({
    name: { $regex: `^${trimmedName}$`, $options: 'i' },
    _id: { $ne: category._id },
  });

  if (existingCategory) {
    res.status(400);
    throw new Error('Category already exists');
  }

  const oldName = category.name;

  category.name = trimmedName;
  category.slug = slugify(trimmedName, {
    lower: true,
    strict: true,
  });

  const updatedCategory = await category.save();

  // Keep existing products in sync with the renamed category.
  await Product.updateMany(
    { category: oldName },
    { $set: { category: updatedCategory.name } },
  );

  res.status(200).json(updatedCategory);
});

// @desc    Delete a category
// @route   DELETE /api/products/categories/:id
// @access  Private/Admin
const deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ErrorResponse('Category not found', 404));
  }

  // Do not allow deletion while products still use this category.
  const productsUsingCategory = await Product.exists({
    category: category.name,
  });

  if (productsUsingCategory) {
    res.status(400);
    throw new Error(
      `Cannot delete "${category.name}" because products are using this category`,
    );
  }

  await Category.deleteOne({ _id: category._id });

  res.status(200).json({
    message: 'Category deleted',
  });
});

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductBySlug,
  getCategories,
  getCategoryCounts,
  createCategory,
  updateCategory,
  deleteCategory,
};
