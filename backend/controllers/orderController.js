import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import Order from '../models/orderModel.js';

// @desc    Create new Order
// @route   POST /api/orders
// @access  Private
const addOrderItems = asyncHandler(async (req, res, next) => {
  res.send('Add order items');
});

// @desc    Get logged in user order
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res, next) => {
  res.send('Get my orders');
});

// @desc    Get order by id
// @route   GET /api/orders/;id
// @access  Private
const getOrderById = asyncHandler(async (req, res, next) => {
  res.send('Get order by Id');
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
  res.send('Update Order To Delivered');
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = asyncHandler(async (req, res, next) => {
  res.send('Get all orders');
});

export {
  addOrderItems,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  getOrders,
};
