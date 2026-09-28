import crypto from 'crypto';

import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';

import Wishlist from '../models/wishlistModel.js';
import Product from '../models/productModel.js';

const getOrCreateWishlist = async (ownerId) => {
  return Wishlist.findOneAndUpdate(
    { owner: ownerId },
    {
      $setOnInsert: {
        owner: ownerId,
        items: [],
      },
    },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    },
  );
};

// @desc    Get logged-in user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  await wishlist.populate({
    path: 'items.product',
    select: 'name slug image images variants',
  });

  res.status(200).json(wishlist);
});

// @desc    Add product variant to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res, next) => {
  const { productId, variantId } = req.body;

  if (!productId || !variantId) {
    return next(new ErrorResponse('Product and variant are required', 400));
  }

  const product = await Product.findById(productId);

  if (!product) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const variant = product.variants.id(variantId);

  if (!variant) {
    return next(new ErrorResponse('Variant not found', 404));
  }

  const wishlist = await getOrCreateWishlist(req.user._id);

  const existingItem = wishlist.items.find(
    (item) =>
      item.product.toString() === productId &&
      item.variant.toString() === variantId,
  );

  if (existingItem) {
    return res.status(200).json({
      message: 'Product variant is already in wishlist',
      wishlist,
    });
  }

  wishlist.items.push({
    product: productId,
    variant: variantId,
  });

  await wishlist.save();

  await wishlist.populate({
    path: 'items.product',
    select: 'name slug image images variants',
  });

  res.status(201).json(wishlist);
});

// @desc    Remove product variant from wishlist
// @route   DELETE /api/wishlist/:productId/:variantId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res, next) => {
  const { productId, variantId } = req.params;

  const wishlist = await Wishlist.findOne({
    owner: req.user._id,
  });

  if (!wishlist) {
    return next(new ErrorResponse('Wishlist not found', 404));
  }

  const originalLength = wishlist.items.length;

  wishlist.items = wishlist.items.filter(
    (item) =>
      !(
        item.product.toString() === productId &&
        item.variant.toString() === variantId
      ),
  );

  if (wishlist.items.length === originalLength) {
    return next(new ErrorResponse('Wishlist item not found', 404));
  }

  await wishlist.save();

  await wishlist.populate({
    path: 'items.product',
    select: 'name slug image images variants',
  });

  res.status(200).json(wishlist);
});

// @desc    Clear logged-in user's wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({
    owner: req.user._id,
  });

  if (!wishlist) {
    return res.status(200).json({
      message: 'Wishlist cleared',
      wishlist: null,
    });
  }

  wishlist.items = [];

  await wishlist.save();

  res.status(200).json({
    message: 'Wishlist cleared',
    wishlist,
  });
});

// @desc    Create shareable wishlist
// @route   POST /api/wishlist/share
// @access  Private
const createWishlistShare = asyncHandler(async (req, res, next) => {
  const wishlist = await getOrCreateWishlist(req.user._id);

  if (!wishlist.shareToken) {
    wishlist.shareToken = crypto.randomBytes(32).toString('hex');

    await wishlist.save();
  }

  res.status(200).json({
    shareToken: wishlist.shareToken,
  });
});

// @desc Create a shareable guest wishlist
// @route POST /api/wishlist/guest/share
// @access Public
const createGuestWishlistShare = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return next(
      new ErrorResponse('Wishlist must contain at least one item', 400),
    );
  }

  const productIds = [...new Set(items.map((item) => String(item.productId)))];

  const products = await Product.find({
    _id: { $in: productIds },
  }).select('_id variants._id');

  const productMap = new Map(
    products.map((product) => [String(product._id), product]),
  );

  const validItems = items
    .filter((item) => item.productId && item.variantId)
    .map((item) => {
      const product = productMap.get(String(item.productId));

      if (!product) {
        return null;
      }

      const variantExists = product.variants.some(
        (variant) => String(variant._id) === String(item.variantId),
      );

      if (!variantExists) {
        return null;
      }

      return {
        product: product._id,
        variant: item.variantId,
      };
    })
    .filter(Boolean);

  if (validItems.length === 0) {
    return next(new ErrorResponse('No valid wishlist items found', 400));
  }

  const shareToken = crypto.randomBytes(32).toString('hex');

  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const wishlist = await Wishlist.create({
    items: validItems,
    shareToken,
    expiresAt,
  });

  res.status(201).json({
    shareToken: wishlist.shareToken,
  });
});

// @desc    Get shared wishlist
// @route   GET /api/wishlist/shared/:shareToken
// @access  Public
const getSharedWishlist = asyncHandler(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({
    shareToken: req.params.shareToken,
  }).populate({
    path: 'items.product',
    select: 'name slug image images variants',
  });

  if (!wishlist) {
    return next(new ErrorResponse('Shared wishlist not found', 404));
  }

  res.status(200).json(wishlist);
});

// @desc Get products for guest wishlist
// @route POST /api/wishlist/guest
// @access Public
const getGuestWishlistProducts = asyncHandler(async (req, res, next) => {
  const { productIds } = req.body;

  if (!Array.isArray(productIds)) {
    return next(new ErrorResponse('Product IDs must be an array', 400));
  }

  if (productIds.length === 0) {
    return res.status(200).json([]);
  }

  const products = await Product.find({
    _id: { $in: productIds },
  }).select('name slug image images variants');

  res.status(200).json(products);
});

// @desc    Merge guest wishlist into user's wishlist
// @route   POST /api/wishlist/merge
// @access  Private
const mergeWishlist = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return next(new ErrorResponse('Wishlist items must be an array', 400));
  }

  const wishlist = await getOrCreateWishlist(req.user._id);

  for (const item of items) {
    const { productId, variantId } = item;

    if (!productId || !variantId) {
      continue;
    }

    const product = await Product.findById(productId);

    if (!product) {
      continue;
    }

    const variant = product.variants.id(variantId);

    if (!variant) {
      continue;
    }

    const alreadyExists = wishlist.items.some(
      (wishlistItem) =>
        wishlistItem.product.toString() === productId &&
        wishlistItem.variant.toString() === variantId,
    );

    if (!alreadyExists) {
      wishlist.items.push({
        product: productId,
        variant: variantId,
      });
    }
  }

  await wishlist.save();

  await wishlist.populate({
    path: 'items.product',
    select: 'name slug image images variants',
  });

  res.status(200).json(wishlist);
});

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  createWishlistShare,
  createGuestWishlistShare,
  getSharedWishlist,
  getGuestWishlistProducts,
  mergeWishlist,
};
