import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

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
// @route   GET /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res, next) => {
  res.send('Update Order To Paid');
});

// @desc    Update order to delivered
// @route   GET /api/orders/:id/deliver
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
  const orders = await Order.find({}).populate('user', 'id name');
  res.status(200).json(orders);
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
