import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import razorpay from '../utils/razorpay.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import sendEmail from '../utils/sendEmail.js';
import orderConfirmationEmail from '../utils/emailTemplates/orderConfirmationEmail.js';

// @desc    Create new Order
// @route   POST /api/create-order
// @access  Private
const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { amount } = req.body;

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json(order);
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: 'Something went wrong',
    });
  }
});

// @desc    Verify Payment
// @route   POST /api/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res, next) => {
  try {
    const { paymentData, orderData } = req.body;

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentData;

    // GENERATE SIGNATURE
    const generated_signature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    // VERIFY SIGNATURE
    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }

    // CHECK + DEDUCT STOCK ATOMICALLY
    for (const item of orderData.orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          variants: {
            $elemMatch: {
              _id: item.variantId,
              countInStock: { $gte: item.qty },
            },
          },
        },
        {
          $inc: {
            'variants.$.countInStock': -item.qty,
          },
        },
        { new: true },
      );

      if (!updatedProduct) {
        return res.status(400).json({
          success: false,
          message: `${item.name} (${item.color}) is out of stock`,
        });
      }
    }

    // CAPTURE PAYMENT
    await razorpay.payments.capture(
      razorpay_payment_id,
      Math.round(orderData.totalPrice * 100),
      'INR',
    );

    // CREATE ORDER IN DB
    const order = new Order({
      orderItems: orderData.orderItems.map((item) => ({
        ...item,
        product: item.product,
        _id: undefined,
      })),
      user: req.user._id,
      shippingAddress: orderData.shippingAddress,
      itemsPrice: orderData.itemsPrice,
      shippingPrice: orderData.shippingPrice,
      taxPrice: orderData.taxPrice,
      totalPrice: orderData.totalPrice,

      // PAYMENT INFO
      paymentResult: {
        id: razorpay_payment_id,
        status: 'CAPTURED',
        update_time: new Date().toISOString(),
      },

      // MARK ORDER PAID
      isPaid: true,
      paidAt: Date.now(),
    });

    // SAVE ORDER
    const createdOrder = await order.save();

    // Send Order confirmation Email
    try {
      await sendEmail({
        email: req.user.email,

        subject: 'Order Confirmation from Arihant Clutches',

        html: orderConfirmationEmail(order, razorpay_payment_id),
      });
    } catch (err) {
      console.log('Order email failed:', err.message);
    }

    // RETURN RESPONSE
    res.json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
});

export { createOrder, verifyPayment };
