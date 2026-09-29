import crypto from 'crypto';
import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import razorpay from '../utils/razorpay.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import calculateOrderPricing from '../utils/orderPricing.js';
import sendEmail from '../utils/sendEmail.js';
import orderConfirmationEmail from '../utils/emailTemplates/orderConfirmationEmail.js';
import { validateAddress } from '../utils/inputValidation.js';

const createOrder = asyncHandler(async (req, res) => {
  try {
    const { orderItems, paymentMethod, shippingAddress, idempotencyKey } =
      req.body;

    const addressValidation = validateAddress(shippingAddress);

    if (!addressValidation.valid) {
      return res.status(400).json({
        success: false,
        message: addressValidation.message,
      });
    }

    if (paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Missing idempotency key',
      });
    }

    /*
     * If the same checkout request is retried, return the
     * existing application order instead of creating another
     * Razorpay order.
     */
    const existingOrder = await Order.findOne({
      idempotencyKey: idempotencyKey.trim(),
      user: req.user._id,
      paymentMethod: 'ONLINE',
    });

    if (existingOrder) {
      if (!existingOrder.razorpayOrderId) {
        return res.status(409).json({
          success: false,
          message: 'Payment order is incomplete. Please try again.',
        });
      }

      const razorpayOrder = await razorpay.orders.fetch(
        existingOrder.razorpayOrderId,
      );

      return res.json({
        ...razorpayOrder,
        pricing: {
          validatedItems: existingOrder.orderItems,
          itemsPrice: existingOrder.itemsPrice,
          shippingPrice: existingOrder.shippingPrice,
          taxPrice: existingOrder.taxPrice,
          totalPrice: existingOrder.totalPrice,
        },
        applicationOrderId: existingOrder._id,
      });
    }

    /*
     * Always calculate pricing from the database.
     * Never trust frontend prices.
     */
    const pricing = await calculateOrderPricing(orderItems, paymentMethod);

    const amount = Math.round(pricing.totalPrice * 100);

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`,
    };

    /*
     * Create the Razorpay Order server-side.
     */
    const razorpayOrder = await razorpay.orders.create(options);

    /*
     * Create our durable application Order BEFORE payment starts.
     *
     * No stock is deducted here.
     */
    const applicationOrder = await Order.create({
      orderItems: pricing.validatedItems.map((item) => ({
        ...item,
        _id: undefined,
      })),

      user: req.user._id,

      idempotencyKey: idempotencyKey.trim(),

      razorpayOrderId: razorpayOrder.id,

      shippingAddress,

      paymentMethod: 'ONLINE',

      itemsPrice: pricing.itemsPrice,
      shippingPrice: pricing.shippingPrice,
      taxPrice: pricing.taxPrice,
      totalPrice: pricing.totalPrice,

      paymentResult: {
        status: 'PENDING',
        update_time: new Date().toISOString(),
      },

      stockDeducted: false,

      isPaid: false,
      paidAt: null,
    });

    return res.json({
      ...razorpayOrder,
      pricing,
      applicationOrderId: applicationOrder._id,
    });
  } catch (error) {
    console.log(error);

    /*
     * If two identical requests race, the unique idempotency
     * index prevents duplicate application orders.
     */
    if (error?.code === 11000) {
      const existingOrder = await Order.findOne({
        idempotencyKey: req.body?.idempotencyKey,
        user: req.user._id,
      });

      if (existingOrder?.razorpayOrderId) {
        const razorpayOrder = await razorpay.orders.fetch(
          existingOrder.razorpayOrderId,
        );

        return res.json({
          ...razorpayOrder,
          pricing: {
            validatedItems: existingOrder.orderItems,
            itemsPrice: existingOrder.itemsPrice,
            shippingPrice: existingOrder.shippingPrice,
            taxPrice: existingOrder.taxPrice,
            totalPrice: existingOrder.totalPrice,
          },
          applicationOrderId: existingOrder._id,
        });
      }
    }

    return res.status(500).json({
      success: false,
      message: error.message || 'Unable to create payment order',
    });
  }
});

/*
 * Verify the Razorpay signature returned by Checkout.
 */
const verifyRazorpaySignature = (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return false;
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(generatedSignature, 'utf8'),
    Buffer.from(razorpaySignature, 'utf8'),
  );
};

/*
 * Deduct stock exactly once.
 *
 * This function is intentionally transaction-based.
 * If frontend verification and webhook processing happen
 * at the same time, MongoDB prevents the stock operation
 * from being applied twice.
 */
const deductStockOnce = async (order) => {
  if (order.stockDeducted) {
    return true;
  }

  const session = await mongoose.startSession();

  try {
    let deducted;

    await session.withTransaction(async () => {
      const freshOrder = await Order.findById(order._id).session(session);

      if (!freshOrder) {
        throw new Error('Order not found');
      }

      if (freshOrder.stockDeducted) {
        return;
      }

      for (const item of freshOrder.orderItems) {
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

      freshOrder.stockDeducted = true;
      await freshOrder.save({ session });
    });

    return true;
  } finally {
    await session.endSession();
  }
};

/*
 * Finalize an already-created application order after
 * Razorpay confirms the payment.
 *
 * paymentSource:
 * - 'frontend'
 * - 'webhook'
 */
const reconcilePayment = async ({
  order,
  payment,
  paymentSource = 'frontend',
  customerEmail,
}) => {
  if (!order) {
    throw new Error('Application order not found');
  }

  if (!payment?.id) {
    throw new Error('Payment information missing');
  }

  /*
   * Payment must belong to this exact Razorpay Order.
   */
  if (!order.razorpayOrderId || payment.order_id !== order.razorpayOrderId) {
    throw new Error('Payment does not belong to this order');
  }

  const expectedAmount = Math.round(order.totalPrice * 100);

  /*
   * If our order is already fully paid, this is an idempotent
   * retry. Return it without touching stock again.
   */
  if (order.isPaid && order.stockDeducted) {
    return order;
  }

  let currentPayment = payment;

  /*
   * Always fetch the payment from Razorpay before changing
   * our application state.
   */
  try {
    currentPayment = await razorpay.payments.fetch(payment.id);
  } catch (error) {
    console.log('Unable to fetch Razorpay payment:', error.message);

    throw new Error('Unable to verify payment status');
  }

  if (currentPayment.order_id !== order.razorpayOrderId) {
    throw new Error('Payment does not belong to this order');
  }

  if (
    Number(currentPayment.amount) !== expectedAmount ||
    currentPayment.currency !== 'INR'
  ) {
    throw new Error('Payment amount or currency does not match order');
  }

  /*
   * Failed payments must never become paid orders.
   */
  if (currentPayment.status === 'failed') {
    order.paymentResult = {
      id: currentPayment.id,
      status: 'FAILED',
      update_time: new Date().toISOString(),
    };

    await order.save();

    throw new Error('Payment was not successful');
  }

  /*
   * A refunded payment is already safely resolved.
   *
   * This can happen when a previous reconciliation attempt
   * captured the payment, discovered unavailable inventory,
   * and successfully refunded it. A duplicate webhook or
   * frontend retry must not attempt another refund.
   */
  if (currentPayment.status === 'refunded') {
    order.paymentResult = {
      id: currentPayment.id,
      status: 'REFUNDED',
      update_time: new Date().toISOString(),
    };

    order.isPaid = false;
    order.paidAt = null;

    await order.save();

    if (paymentSource === 'webhook') {
      return order;
    }

    throw new Error(
      'Payment was refunded because the item was no longer available',
    );
  }

  /*
   * If payment is only authorized, capture it.
   *
   * Razorpay requires captured payment before fulfillment.
   */
  if (currentPayment.status === 'authorized') {
    try {
      currentPayment = await razorpay.payments.capture(
        currentPayment.id,
        expectedAmount,
        'INR',
      );
    } catch (error) {
      /*
       * A concurrent request/webhook may have captured it
       * between our fetch and capture call. Fetch once more.
       */
      try {
        currentPayment = await razorpay.payments.fetch(currentPayment.id);
      } catch {
        throw new Error('Payment capture could not be confirmed');
      }

      if (currentPayment.status !== 'captured') {
        throw new Error('Payment capture failed');
      }
    }
  }

  /*
   * Do not fulfill an order until payment is captured.
   */
  if (currentPayment.status !== 'captured') {
    throw new Error(
      `Payment is not captured yet. Current status: ${currentPayment.status}`,
    );
  }

  /*
   * Save the payment ID before final reconciliation.
   * This also gives the webhook a durable payment reference.
   */
  order.paymentResult = {
    id: currentPayment.id,
    status: 'CAPTURED',
    update_time: new Date().toISOString(),
  };

  await order.save();

  /*
   * Deduct stock exactly once.
   */
  try {
    await deductStockOnce(order);
  } catch (stockError) {
    /*
     * Payment has already been captured, but the product is no
     * longer available. Refund the captured payment instead
     * of creating an unfulfillable order.
     */
    let refundConfirmed = false;

    try {
      await razorpay.payments.refund(currentPayment.id, {
        notes: {
          reason: 'Inventory unavailable during order reconciliation',
          application_order_id: order._id.toString(),
        },
      });

      /*
       * Confirm the refund using Razorpay's authoritative payment
       * status before marking our application order as REFUNDED.
       */
      const refundedPayment = await razorpay.payments.fetch(currentPayment.id);

      if (refundedPayment.status === 'refunded') {
        refundConfirmed = true;
      }
    } catch (refundError) {
      /*
       * Razorpay may reject a duplicate refund attempt because
       * the payment has already been refunded.
       *
       * Fetch the payment again and treat an already-refunded
       * payment as successfully resolved.
       */
      try {
        const paymentAfterRefundError = await razorpay.payments.fetch(
          currentPayment.id,
        );

        if (paymentAfterRefundError.status === 'refunded') {
          refundConfirmed = true;
        } else {
          console.log(
            'CRITICAL: Payment refund could not be confirmed:',
            JSON.stringify(
              refundError,
              Object.getOwnPropertyNames(refundError),
            ),
          );
        }
      } catch (statusError) {
        console.log(
          'CRITICAL: Unable to confirm payment refund:',
          JSON.stringify(statusError, Object.getOwnPropertyNames(statusError)),
        );
      }
    }

    if (!refundConfirmed) {
      /*
       * Do not mark the order as refunded unless Razorpay
       * confirms that the payment is actually refunded.
       *
       * Returning an error causes Razorpay to retry the webhook.
       */
      throw new Error(
        'Payment was captured but the refund could not be confirmed',
      );
    }

    order.paymentResult = {
      id: currentPayment.id,
      status: 'REFUNDED',
      update_time: new Date().toISOString(),
    };

    order.isPaid = false;
    order.paidAt = null;

    await order.save();

    /*
     * The webhook has successfully handled the payment even
     * though the order cannot be fulfilled. Return the order
     * so Razorpay receives HTTP 200 and does not keep retrying.
     */
    if (paymentSource === 'webhook') {
      return order;
    }

    throw new Error(
      'Payment was received but the item was no longer available. Your payment has been refunded.',
    );
  }

  /*
   * Reload the order because deductStockOnce may have
   * modified it through a separate transaction.
   */
  const finalizedOrder = await Order.findById(order._id);

  if (!finalizedOrder) {
    throw new Error('Order could not be finalized');
  }

  if (!finalizedOrder.isPaid) {
    finalizedOrder.isPaid = true;
    finalizedOrder.paidAt = new Date();

    finalizedOrder.paymentResult = {
      id: currentPayment.id,
      status: 'CAPTURED',
      update_time: new Date().toISOString(),
    };

    await finalizedOrder.save();
  }

  /*
   * Only send the confirmation email after the order is
   * actually finalized.
   */
  if (paymentSource === 'frontend' && finalizedOrder.isPaid) {
    try {
      await sendEmail({
        email: customerEmail,
        subject: 'Order Confirmation from Arihant Clutches',
        html: orderConfirmationEmail(
          finalizedOrder,
          currentPayment.id,
          customerEmail || '',
        ),
      });
    } catch (emailError) {
      console.log('Order email failed:', emailError.message);
    }
  }

  return finalizedOrder;
};

/*
 * Create a Cash on Delivery order.
 *
 * COD orders do not involve Razorpay.
 * Pricing is calculated server-side and stock + order creation
 * happen inside the same MongoDB transaction.
 */
const createCodOrder = async ({ req, orderData, idempotencyKey }) => {
  const addressValidation = validateAddress(orderData?.shippingAddress);

  if (!addressValidation.valid) {
    throw new Error(addressValidation.message);
  }

  if (typeof idempotencyKey !== 'string' || !idempotencyKey.trim()) {
    throw new Error('Missing idempotency key');
  }

  const normalizedIdempotencyKey = idempotencyKey.trim();

  /*
   * Return the existing COD order if this checkout request
   * is being retried.
   */
  const existingOrder = await Order.findOne({
    idempotencyKey: normalizedIdempotencyKey,
    user: req.user._id,
    paymentMethod: 'COD',
  });

  if (existingOrder) {
    return {
      order: existingOrder,
      created: false,
    };
  }

  /*
   * Always calculate pricing from the database.
   * Never trust frontend prices.
   */
  const pricing = await calculateOrderPricing(orderData.orderItems, 'COD');

  const session = await mongoose.startSession();

  let createdOrder;

  try {
    await session.withTransaction(async () => {
      /*
       * Deduct stock atomically.
       *
       * If any item does not have enough stock, the entire
       * transaction rolls back, including previous items.
       */
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

      /*
       * Create the COD application order.
       *
       * Stock has already been deducted inside this same
       * transaction, so mark stockDeducted as true.
       */
      createdOrder = new Order({
        orderItems: pricing.validatedItems.map((item) => ({
          ...item,
          _id: undefined,
        })),

        user: req.user._id,

        idempotencyKey: normalizedIdempotencyKey,

        shippingAddress: orderData.shippingAddress,

        paymentMethod: 'COD',

        itemsPrice: pricing.itemsPrice,
        shippingPrice: pricing.shippingPrice,
        taxPrice: pricing.taxPrice,
        totalPrice: pricing.totalPrice,

        paymentResult: {
          status: 'COD',
          update_time: new Date().toISOString(),
        },

        stockDeducted: true,

        isPaid: false,
        paidAt: null,
      });

      await createdOrder.save({ session });
    });
  } finally {
    await session.endSession();
  }

  return {
    order: createdOrder,
    created: true,
  };
};

/*
 * Verify Payment / Create COD Order
 */
const verifyPayment = asyncHandler(async (req, res) => {
  try {
    const { paymentData = {}, orderData, idempotencyKey } = req.body;

    if (!orderData?.paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required',
      });
    }

    /*
     * =========================
     * COD
     * =========================
     *
     * COD does not use Razorpay.
     */
    if (orderData.paymentMethod === 'COD') {
      try {
        const { order, created } = await createCodOrder({
          req,
          orderData,
          idempotencyKey,
        });

        /*
         * Only send the confirmation email when this request
         * actually created the order.
         *
         * A retry with the same idempotency key must not send
         * another confirmation email.
         */
        if (created) {
          try {
            await sendEmail({
              email: req.user.email,
              subject: 'Order Confirmation from Arihant Clutches',
              html: orderConfirmationEmail(
                order,
                'Cash on Delivery',
                req.user.email,
              ),
            });
          } catch (emailError) {
            console.log('Order email failed:', emailError.message);
          }
        }

        return res.json({
          success: true,
          order,
        });
      } catch (error) {
        /*
         * Two identical COD requests can race.
         *
         * The unique idempotencyKey index allows only one
         * application order to be created. If the other request
         * loses the race, return the already-created order.
         */
        if (error?.code === 11000) {
          const existingOrder = await Order.findOne({
            idempotencyKey: idempotencyKey?.trim(),
            user: req.user._id,
            paymentMethod: 'COD',
          });

          if (existingOrder) {
            return res.json({
              success: true,
              order: existingOrder,
            });
          }
        }

        throw error;
      }
    }

    /*
     * =========================
     * ONLINE
     * =========================
     */

    if (orderData.paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      paymentData;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Incomplete payment information',
      });
    }

    /*
     * Signature validation.
     */
    if (
      !verifyRazorpaySignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    /*
     * Find our durable application order using the
     * Razorpay Order ID, not the payment ID.
     */
    const order = await Order.findOne({
      razorpayOrderId: razorpay_order_id,
      user: req.user._id,
      paymentMethod: 'ONLINE',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found',
      });
    }

    /*
     * Verify that the submitted checkout data is not trying
     * to use a different payment/order combination.
     */
    if (orderData?.paymentMethod && orderData.paymentMethod !== 'ONLINE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const payment = {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
    };

    const finalizedOrder = await reconcilePayment({
      order,
      payment,
      paymentSource: 'frontend',
      customerEmail: req.user.email,
    });

    return res.json({
      success: true,
      order: finalizedOrder,
    });
  } catch (error) {
    console.log(error);

    if (
      error.message?.includes('out of stock') ||
      error.message?.includes('Inventory unavailable')
    ) {
      return res.status(409).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || 'Payment verification failed',
    });
  }
});

/*
 * Razorpay Webhook
 */
const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const webhookSignature = req.headers['x-razorpay-signature'];

  if (!webhookSignature || !req.rawBody) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook request',
    });
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(req.rawBody)
    .digest('hex');

  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');

  const webhookSignatureBuffer = Buffer.from(webhookSignature, 'utf8');

  if (
    expectedSignatureBuffer.length !== webhookSignatureBuffer.length ||
    !crypto.timingSafeEqual(expectedSignatureBuffer, webhookSignatureBuffer)
  ) {
    return res.status(400).json({
      success: false,
      message: 'Invalid webhook signature',
    });
  }

  const event = req.body.event;

  /*
   * We care about successful/capturable payment events.
   *
   * payment.authorized:
   * Payment is authorized and needs capture if manual capture
   * is being used.
   *
   * payment.captured:
   * Payment is already captured.
   */
  if (event === 'payment.authorized' || event === 'payment.captured') {
    const payment = req.body.payload?.payment?.entity;

    if (!payment?.id || !payment?.order_id) {
      return res.status(400).json({
        success: false,
        message: 'Payment information missing',
      });
    }

    /*
     * The Razorpay payment itself tells us which Razorpay
     * Order it belongs to.
     */
    const order = await Order.findOne({
      razorpayOrderId: payment.order_id,
      paymentMethod: 'ONLINE',
    });

    /*
     * This is important:
     *
     * Razorpay can send a webhook before the frontend
     * receives/finishes its verification request.
     *
     * If we don't know the application order, acknowledge
     * the webhook but don't invent an order.
     */
    if (!order) {
      return res.status(200).json({
        success: true,
        message: 'Application order not found yet',
      });
    }

    try {
      const finalizedOrder = await reconcilePayment({
        order,
        payment,
        paymentSource: 'webhook',
      });

      return res.status(200).json({
        success: true,
        orderId: finalizedOrder._id,
      });
    } catch (error) {
      console.log('Webhook reconciliation failed:', error.message);

      /*
       * Return 500 so Razorpay can retry the webhook for
       * transient reconciliation failures.
       */
      return res.status(500).json({
        success: false,
        message: 'Payment reconciliation failed',
      });
    }
  }

  /*
   * Payment failure is recorded against the application
   * order when the Razorpay Order ID is available.
   */
  if (event === 'payment.failed') {
    const payment = req.body.payload?.payment?.entity;

    if (payment?.order_id) {
      const order = await Order.findOne({
        razorpayOrderId: payment.order_id,
        paymentMethod: 'ONLINE',
      });

      if (order && !order.isPaid) {
        order.paymentResult = {
          id: payment.id,
          status: 'FAILED',
          update_time: new Date().toISOString(),
        };

        await order.save();
      }
    }
  }

  return res.status(200).json({
    success: true,
  });
});

export { createOrder, verifyPayment, handleRazorpayWebhook };
