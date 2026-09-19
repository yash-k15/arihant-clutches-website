import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// @desc    Create new Order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res, next) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    paymentMethod,
    totalPrice,
  } = req.body;

  if (orderItems && orderItems.length === 0) {
    return next(new ErrorResponse('No order item', 400));
  }

  const order = new Order({
    orderItems: orderItems.map((item) => ({
      product: item.product,
      slug: item.slug,
      variantId: item.variantId,
      name: item.name,
      image: item.image,
      color: item.color,
      price: item.price,
      qty: item.qty,
    })),
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  });

  if (!['COD', 'ONLINE'].includes(paymentMethod)) {
    res.status(400);
    throw new Error('Invalid payment method');
  }

  const createdOrder = await order.save();

  res.status(201).json(createdOrder);
});

// @desc    Get logged in user order
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// @desc    Get order by id
// @route   GET /api/orders/;id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email phone',
  );

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  res.status(200).json(order);
});

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private/Admin
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json(updatedOrder);
});

// @desc    Update order to delivered
// @route   PUT /api/orders/:id/deliver
// @access  Private/Admin
const updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorResponse('Order not found', 404));
  }

  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json(updatedOrder);
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res, next) => {
  const pageSize = process.env.PAGINATION_LIMIT;
  const page = Number(req.query.pageNumber) || 1;

  const filters = {};

  // Search
  if (req.query.keyword) {
    const searchRegex = {
      $regex: req.query.keyword,
      $options: 'i',
    };

    const matchingUsers = await User.find({
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ],
    }).select('_id');

    const userIds = matchingUsers.map((user) => user._id);

    const searchConditions = [{ user: { $in: userIds } }];

    // Allow searching by full MongoDB order ID
    if (req.query.keyword.match(/^[0-9a-fA-F]{24}$/)) {
      searchConditions.push({
        _id: req.query.keyword,
      });
    }

    // Allow searching by the last 6 characters shown in the admin table
    searchConditions.push({
      $expr: {
        $regexMatch: {
          input: { $toString: '$_id' },
          regex: req.query.keyword,
          options: 'i',
        },
      },
    });

    filters.$or = searchConditions;
  }

  // Payment status
  if (req.query.paymentStatus === 'paid') {
    filters.isPaid = true;
  } else if (req.query.paymentStatus === 'pending') {
    filters.isPaid = false;
  }

  // Payment method
  if (req.query.paymentMethod) {
    filters.paymentMethod = req.query.paymentMethod;
  }

  // Delivery status
  if (req.query.deliveryStatus === 'delivered') {
    filters.isDelivered = true;
  } else if (req.query.deliveryStatus === 'processing') {
    filters.isDelivered = false;
  }

  // Date range
  const createdAtFilter = {};

  if (req.query.dateFrom) {
    createdAtFilter.$gte = new Date(`${req.query.dateFrom}T00:00:00.000+05:30`);
  }

  if (req.query.dateTo) {
    createdAtFilter.$lte = new Date(`${req.query.dateTo}T23:59:59.999+05:30`);
  }

  if (Object.keys(createdAtFilter).length > 0) {
    filters.createdAt = createdAtFilter;
  }

  // Count filtered orders
  const count = await Order.countDocuments(filters);

  // Sorting
  let sortOption = { createdAt: -1 };

  switch (req.query.sort) {
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;

    case 'total-asc':
      sortOption = { totalPrice: 1, createdAt: -1 };
      break;

    case 'total-desc':
      sortOption = { totalPrice: -1, createdAt: -1 };
      break;

    case 'latest':
    default:
      sortOption = { createdAt: -1 };
      break;
  }

  const orders = await Order.find(filters)
    .populate('user', 'id name email phone')
    .sort(sortOption)
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.status(200).json({
    orders,
    page,
    pages: Math.ceil(count / pageSize),
  });
});

// @desc    Check stock before payment
// @route   POST /api/orders/checkStock
// @access  Private
const checkStock = asyncHandler(async (req, res) => {
  const { orderItems } = req.body;

  const outOfStockItems = [];

  for (const item of orderItems) {
    const product = await Product.findOne({
      _id: item.product,
      variants: {
        $elemMatch: {
          _id: item.variantId,
          countInStock: { $gte: item.qty },
        },
      },
    });

    if (!product) {
      outOfStockItems.push({
        productId: item.product,
        variantId: item.variantId,
        name: item.name,
        color: item.color,
        qty: item.qty,
      });
    }
  }

  if (outOfStockItems.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Some items are out of stock',
      outOfStockItems,
    });
  }

  res.json({
    success: true,
  });
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
  checkStock,
};
