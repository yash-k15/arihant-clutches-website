import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Product, { Category } from '../models/productModel.js';
import slugify from 'slugify';
import escapeRegex from '../utils/escapeRegex.js';

// @desc    Get all Products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res, next) => {
  const pageSize =
    req.query.admin === 'true'
      ? Number(process.env.ADMIN_PRODUCTS_PER_PAGE) || 10
      : req.query.home === 'true'
        ? Number(process.env.HOME_PRODUCTS_LIMIT) || 10
        : Number(process.env.PRODUCTS_PER_PAGE) || 10;

  const page = Number(req.query.pageNumber) || 1;

  const filters = {};

  if (req.query.keyword) {
    const searchRegex = {
      $regex: escapeRegex(req.query.keyword),
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
      $regex: escapeRegex(req.query.adminSearch),
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

  // Stock filter
  if (req.query.adminStock === 'in-stock') {
    filters.variants = {
      $not: {
        $elemMatch: {
          countInStock: { $lte: 0 },
        },
      },
    };
  } else if (req.query.adminStock === 'out-stock') {
    filters.variants = {
      $elemMatch: {
        countInStock: { $lte: 0 },
      },
    };
  } else if (req.query['filter.v.availability'] === '1') {
    filters.variants = {
      $elemMatch: {
        countInStock: { $gt: 0 },
      },
    };
  }

  // Price filters
  const priceFilter = {};

  // Admin price filter
  if (req.query.adminPriceGte !== undefined) {
    const minPrice = Number(req.query.adminPriceGte);

    if (Number.isFinite(minPrice)) {
      priceFilter.$gte = minPrice;
    }
  }

  if (req.query.adminPriceLte !== undefined) {
    const maxPrice = Number(req.query.adminPriceLte);

    if (Number.isFinite(maxPrice)) {
      priceFilter.$lte = maxPrice;
    }
  }

  // Storefront price filter
  if (req.query['filter.v.price.gte'] !== undefined) {
    const minPrice = Number(req.query['filter.v.price.gte']);

    if (Number.isFinite(minPrice)) {
      priceFilter.$gte = minPrice;
    }
  }

  if (req.query['filter.v.price.lte'] !== undefined) {
    const maxPrice = Number(req.query['filter.v.price.lte']);

    if (Number.isFinite(maxPrice)) {
      priceFilter.$lte = maxPrice;
    }
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

  // Admin category filter
  const adminCategories = req.query.adminCategory;

  if (adminCategories) {
    const selectedAdminCategories = Array.isArray(adminCategories)
      ? adminCategories
      : [adminCategories];

    filters.category = {
      $in: selectedAdminCategories,
    };
  }

  // Admin visibility filter
  const adminVisibility = req.query.adminVisibility;

  if (adminVisibility) {
    const selectedVisibility = Array.isArray(adminVisibility)
      ? adminVisibility
      : [adminVisibility];

    const visibilityFilters = [];

    if (selectedVisibility.includes('featured')) {
      visibilityFilters.push({
        isFeatured: true,
      });
    }

    if (selectedVisibility.includes('new-arrival')) {
      visibilityFilters.push({
        isNewArrival: true,
      });
    }

    if (selectedVisibility.includes('best-seller')) {
      visibilityFilters.push({
        isBestSeller: true,
      });
    }

    if (visibilityFilters.length > 0) {
      filters.$and = filters.$and || [];

      filters.$and.push({
        $or: visibilityFilters,
      });
    }
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

// @desc    Update a product
// @route   PUT /api/product/:slug
// @access  Private/Admin
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
  product.dimensions = dimensions ?? product.dimensions;

  if (video !== undefined) {
    product.video = video;
  }

  if (Array.isArray(variants)) {
    const incomingIds = new Set(
      variants
        .filter((variant) => variant._id)
        .map((variant) => String(variant._id)),
    );

    // Do not allow an existing variant with stock to be removed.
    const blockedVariant = product.variants.find(
      (variant) =>
        !incomingIds.has(String(variant._id)) && variant.countInStock > 0,
    );

    if (blockedVariant) {
      return next(
        new ErrorResponse(
          `Cannot remove "${blockedVariant.color}" while it has ${blockedVariant.countInStock} in stock. Set stock to 0 first.`,
          400,
        ),
      );
    }

    // Update existing variants.
    // IMPORTANT: countInStock is intentionally excluded.
    variants.forEach((incomingVariant) => {
      if (!incomingVariant._id) {
        return;
      }

      const existingVariant = product.variants.id(incomingVariant._id);

      if (!existingVariant) {
        return;
      }

      existingVariant.color = incomingVariant.color ?? existingVariant.color;

      existingVariant.price = incomingVariant.price ?? existingVariant.price;

      existingVariant.images = incomingVariant.images ?? existingVariant.images;
    });

    // Remove variants that are no longer present in the submitted list.
    // Variants with stock were already blocked above.
    product.variants = product.variants.filter((variant) =>
      incomingIds.has(String(variant._id)),
    );

    // Add genuinely new variants.
    // New variants ALWAYS start with zero stock.
    variants
      .filter((variant) => !variant._id)
      .forEach((variant) => {
        const initialStock = variant.countInStock ?? 0;

        if (!Number.isInteger(initialStock) || initialStock < 0) {
          return next(
            new ErrorResponse(
              'Initial stock must be a non-negative integer',
              400,
            ),
          );
        }

        product.variants.push({
          color: variant.color,
          price: variant.price,
          images: variant.images || [],
          countInStock: initialStock,
        });
      });
  }

  const updatedProduct = await product.save();

  res.status(200).json(updatedProduct);
});

// @desc    Adjust variant stock
// @route   PATCH /api/product/:slug/variants/:variantId/stock
// @access  Private/Admin
const adjustVariantStock = asyncHandler(async (req, res, next) => {
  const { delta, setTo } = req.body;

  const hasDelta = Number.isInteger(delta);
  const hasSetTo = Number.isInteger(setTo);

  if (hasDelta === hasSetTo) {
    return next(
      new ErrorResponse('Provide either an integer delta or setTo', 400),
    );
  }

  if (hasSetTo && setTo < 0) {
    return next(new ErrorResponse('Stock cannot be negative', 400));
  }

  const { slug, variantId } = req.params;

  const filter = {
    slug,
    'variants._id': variantId,
  };

  let update;

  if (hasDelta) {
    if (delta < 0) {
      filter.variants = {
        $elemMatch: {
          _id: variantId,
          countInStock: { $gte: Math.abs(delta) },
        },
      };
    }

    update = {
      $inc: {
        'variants.$.countInStock': delta,
      },
    };
  } else {
    update = {
      $set: {
        'variants.$.countInStock': setTo,
      },
    };
  }

  const updatedProduct = await Product.findOneAndUpdate(filter, update, {
    new: true,
    runValidators: true,
  });

  if (!updatedProduct) {
    return next(
      new ErrorResponse(
        hasDelta && delta < 0
          ? 'Variant not found or insufficient stock for that adjustment'
          : 'Product or variant not found',
        404,
      ),
    );
  }

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
const createProductReview = asyncHandler(async (req, res, next) => {
  const { rating, comment } = req.body;

  // Validate rating before any database work.
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return next(
      new ErrorResponse('Rating must be an integer between 1 and 5', 400),
    );
  }

  // Validate comment before any database work.
  if (typeof comment !== 'string') {
    return next(new ErrorResponse('Review comment must be text', 400));
  }

  const trimmedComment = comment.trim();

  if (!trimmedComment) {
    return next(new ErrorResponse('Review comment is required', 400));
  }

  if (trimmedComment.length > 2000) {
    return next(
      new ErrorResponse('Review comment cannot exceed 2000 characters', 400),
    );
  }

  const product = await Product.findOne({ slug: req.params.slug });

  if (!product) {
    return next(new ErrorResponse('Resource not found', 404));
  }

  // Prevent duplicate reviews during normal requests.
  const review = {
    name: req.user.name,
    rating,
    comment: trimmedComment,
    user: req.user._id,
  };

  const updatedProduct = await Product.findOneAndUpdate(
    {
      _id: product._id,
      reviews: {
        $not: {
          $elemMatch: {
            user: req.user._id,
          },
        },
      },
    },
    {
      $push: {
        reviews: review,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedProduct) {
    return next(new ErrorResponse('Product already reviewed', 409));
  }

  updatedProduct.numReviews = updatedProduct.reviews.length;

  updatedProduct.rating =
    updatedProduct.reviews.reduce((acc, review) => acc + review.rating, 0) /
    updatedProduct.reviews.length;

  await updatedProduct.save();

  res.status(201).json({ message: 'Review added' });
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
      $regex: escapeRegex(req.query.keyword),
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
    name: {
      $regex: `^${escapeRegex(trimmedName)}$`,
      $options: 'i',
    },
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
    name: {
      $regex: `^${escapeRegex(trimmedName)}$`,
      $options: 'i',
    },
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
};
