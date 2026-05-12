import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Product from '../models/productModel.js';

// @desc    Get all Products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? { name: { $regex: req.query.keyword, $options: 'i' } } // Case Insensitive - $option: 'i'
    : {};

  const count = await Product.countDocuments({ ...keyword });

  const products = await Product.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1));
  res.json({ products, page, pages: Math.ceil(count / pageSize) });
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
    price,
    image,
    images,
    brand,
    category,
    countInStock,
    description,
    material,
    dimensions,
    weight,
    isFeatured,
    isNewArrival,
    isBestSeller,
    variants,
  } = req.body;

  const product = new Product({
    user: req.user._id,
    name,
    price,
    image,
    images,
    brand,
    category,
    countInStock,
    description,
    material,
    dimensions,
    weight,
    isFeatured,
    isNewArrival,
    isBestSeller,
    variants,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc Update a product
// @route PUT /api/product/:id
// @access Private/Admin
const updateProduct = asyncHandler(async (req, res, next) => {
  const {
    name,
    price,
    description,
    image,
    images,
    brand,
    category,
    countInStock,
    material,
    isFeatured,
    isNewArrival,
    isBestSeller,
    weight,
    dimensions,
    variants,
  } = req.body;

  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  product.name = name || product.name;
  product.price = price ?? product.price;
  product.description = description || product.description;
  product.brand = brand || product.brand;
  product.category = category || product.category;
  product.countInStock = countInStock ?? product.countInStock;
  product.material = material || product.material;
  product.isFeatured = isFeatured ?? product.isFeatured;
  product.isNewArrival = isNewArrival ?? product.isNewArrival;
  product.isBestSeller = isBestSeller ?? product.isBestSeller;
  product.weight = weight ?? product.weight;
  product.dimensions = dimensions || product.dimensions;
  product.variants = variants || product.variants;

  // IMAGES
  product.image = image || product.image;
  product.images = images?.length ? images : product.images;

  // SAFETY:
  // Ensure main image exists
  if (product.images.length > 0) {
    product.image = product.images[0];
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

export {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview,
  getTopProducts,
  getProductBySlug,
};
