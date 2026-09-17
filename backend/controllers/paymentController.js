import crypto from 'crypto';
import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import ErrorResponse from '../utils/errorResponse.js';
import razorpay from '../utils/razorpay.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import calculateOrderPricing from '../utils/orderPricing.js';
//import sendEmail from '../utils/sendEmail.js';
import orderConfirmationEmail from '../utils/emailTemplates/orderConfirmationEmail.js';

const createOrder = asyncHandler(async (req, res, next) => {
  try {
    const { orderItems, paymentMethod } = req.body;

    if (paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const pricing = await calculateOrderPricing(orderItems, paymentMethod);

    const options = {
      amount: Math.round(pricing.totalPrice * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      ...order,
      pricing,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message || 'Something went wrong',
    });
  }
});

// @desc    Verify Payment
// @route   POST /api/verify-payment
// @access  Private
const verifyPayment = asyncHandler(async (req, res, next) => {
  try {
    const { paymentData = {}, orderData } = req.body;

    const isCOD = orderData.paymentMethod === 'COD';

    const pricing = await calculateOrderPricing(
      orderData.orderItems,
      orderData.paymentMethod,
    );

    const {
      razorpay_order_id = null,
      razorpay_payment_id = null,
      razorpay_signature = null,
    } = paymentData;

    // =========================
    // 1. VERIFY PAYMENT (ONLINE ONLY)
    // =========================

    if (!isCOD) {
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
    }

    // VERIFY RAZORPAY ORDER AMOUNT
    if (!isCOD && razorpay_order_id) {
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);

      if (
        Number(razorpayOrder.amount) !== Math.round(pricing.totalPrice * 100)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount does not match order total',
        });
      }
    }

    // =========================
    // 2. DATABASE TRANSACTION
    //    STOCK + ORDER CREATION
    // =========================

    const session = await mongoose.startSession();

    let createdOrder;

    try {
      await session.withTransaction(async () => {
        // CHECK + DEDUCT STOCK
        for (const item of pricing.validatedItems) {
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
            {
              new: true,
              session,
            },
          );

          if (!updatedProduct) {
            throw new Error(`${item.name} (${item.color}) is out of stock`);
          }
        }

        // CREATE ORDER
        const order = new Order({
          orderItems: pricing.validatedItems.map((item) => ({
            ...item,
            _id: undefined,
          })),
          user: req.user._id,
          shippingAddress: orderData.shippingAddress,
          paymentMethod: orderData.paymentMethod,
          itemsPrice: pricing.itemsPrice,
          shippingPrice: pricing.shippingPrice,
          taxPrice: pricing.taxPrice,
          totalPrice: pricing.totalPrice,

          // PAYMENT INFO
          paymentResult: isCOD
            ? {}
            : {
                id: razorpay_payment_id,
                status: 'PENDING',
                update_time: new Date().toISOString(),
              },

          // MARK ORDER PAID
          isPaid: false,
          paidAt: null,
        });

        createdOrder = await order.save({ session });
      });
    } finally {
      await session.endSession();
    }

    // =========================
    // 3. CAPTURE PAYMENT
    //    (ONLINE ONLY)
    // =========================

    if (!isCOD) {
      await razorpay.payments.capture(
        razorpay_payment_id,
        Math.round(pricing.totalPrice * 100),
        'INR',
      );

      createdOrder.isPaid = true;
      createdOrder.paidAt = Date.now();

      createdOrder.paymentResult = {
        id: razorpay_payment_id,
        status: 'CAPTURED',
        update_time: new Date().toISOString(),
      };

      await createdOrder.save();
    }

    // =========================
    // 4. EMAIL
    // =========================
    // Send order confirmation email only when the user has an email address.
    // Email sending is currently disabled.
    // try {
    //   await sendEmail({
    //     email: req.user.email,

    //     subject: 'Order Confirmation from Arihant Clutches',

    //     html: orderConfirmationEmail(
    //       order,
    //       isCOD ? 'Cash on Delivery' : razorpay_payment_id,
    //     ),
    //   });
    // } catch (err) {
    //   console.log('Order email failed:', err.message);
    // }

    // =========================
    // 5. RESPONSE
    // =========================
    res.json({
      success: true,
      order: createdOrder,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
});

export { createOrder, verifyPayment };
