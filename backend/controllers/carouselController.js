import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Carousel from '../models/carouselModel.js';
import Product from '../models/productModel.js';

// @desc    Get carousel
// @route   GET /api/carousel
// @access  Public
const getCarousel = asyncHandler(async (req, res, next) => {
  const carousel = await Carousel.findOne().populate({
    path: 'items.product',
    select: 'name slug variants',
  });

  if (!carousel) {
    return res.status(200).json({
      items: [],
    });
  }

  res.status(200).json(carousel);
});

// @desc    Add product variant to carousel
// @route   POST /api/carousel/items
// @access  Private/Admin
const addCarouselItem = asyncHandler(async (req, res, next) => {
  const { product, variantId } = req.body;

  if (!product || !variantId) {
    return res.status(400).json({
      message: 'Product and variant are required',
    });
  }

  const productExists = await Product.findById(product);

  if (!productExists) {
    return next(new ErrorResponse('Product not found', 404));
  }

  const variantExists = productExists.variants.some(
    (variant) => variant._id.toString() === variantId,
  );

  if (!variantExists) {
    return next(new ErrorResponse('Variant not found', 404));
  }

  let carousel = await Carousel.findOne();

  if (!carousel) {
    carousel = await Carousel.create({
      items: [],
    });
  }

  const alreadyExists = carousel.items.some(
    (item) =>
      item.product.toString() === product &&
      item.variantId.toString() === variantId,
  );

  if (alreadyExists) {
    return res.status(400).json({
      message: 'This product variant is already in the carousel',
    });
  }

  carousel.items.push({
    product,
    variantId,
  });

  await carousel.save();

  const updatedCarousel = await Carousel.findById(carousel._id).populate({
    path: 'items.product',
    select: 'name slug variants',
  });

  res.status(201).json(updatedCarousel);
});

// @desc    Remove product variant from carousel
// @route   DELETE /api/carousel/items
// @access  Private/Admin
const removeCarouselItem = asyncHandler(async (req, res, next) => {
  const { product, variantId } = req.body;

  if (!product || !variantId) {
    return res.status(400).json({
      message: 'Product and variant are required',
    });
  }

  const carousel = await Carousel.findOne();

  if (!carousel) {
    return next(new ErrorResponse('Carousel not found', 404));
  }

  carousel.items = carousel.items.filter(
    (item) =>
      !(
        item.product.toString() === product &&
        item.variantId.toString() === variantId
      ),
  );

  await carousel.save();

  res.status(200).json(carousel);
});

// @desc    Reorder carousel
// @route   PUT /api/carousel
// @access  Private/Admin
const updateCarousel = asyncHandler(async (req, res, next) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({
      message: 'Carousel items must be an array',
    });
  }

  const seenItems = new Set();

  for (const item of items) {
    if (!item.product || !item.variantId) {
      return res.status(400).json({
        message: 'Each carousel item must contain a product and variant',
      });
    }

    const itemKey = `${item.product}-${item.variantId}`;

    if (seenItems.has(itemKey)) {
      return res.status(400).json({
        message: 'Duplicate product variants are not allowed',
      });
    }

    seenItems.add(itemKey);

    const product = await Product.findById(item.product);

    if (!product) {
      return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
    }

    const variantExists = product.variants.some(
      (variant) => variant._id.toString() === item.variantId.toString(),
    );

    if (!variantExists) {
      return next(
        new ErrorResponse(
          `Variant not found for product: ${product.name}`,
          404,
        ),
      );
    }
  }

  let carousel = await Carousel.findOne();

  if (!carousel) {
    carousel = new Carousel();
  }

  carousel.items = items;

  await carousel.save();

  const updatedCarousel = await Carousel.findById(carousel._id).populate({
    path: 'items.product',
    select: 'name slug variants',
  });

  res.status(200).json(updatedCarousel);
});

export { getCarousel, addCarouselItem, removeCarouselItem, updateCarousel };
