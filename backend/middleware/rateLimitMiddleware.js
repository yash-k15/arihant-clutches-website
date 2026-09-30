import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many authentication attempts. Please try again later.',
  },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many OTP requests. Please try again later.',
  },
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many password reset attempts. Please try again later.',
  },
});

const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many contact form submissions. Please try again later.',
  },
});

const guestWishlistLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    message: 'Too many wishlist requests. Please try again later.',
  },
});

/*
 * Payment verification abuse controls.
 *
 * Two limits are intentionally used:
 * 1. User/IP limit prevents a client from rotating order IDs to
 *    repeatedly exercise the verification endpoint.
 * 2. Order/operation limit allows legitimate retries for one
 *    payment while stopping excessive verification attempts.
 *
 * verifyPayment is authenticated, so req.user is available when
 * these limiters run in the payment route.
 */
const paymentVerificationUserLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?._id?.toString() || 'anonymous';
    const ip = ipKeyGenerator(req.ip);

    return `payment-user:${userId}:${ip}`;
  },
  message: {
    message: 'Too many payment verification attempts. Please try again later.',
  },
});

const paymentVerificationOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => {
    const userId = req.user?._id?.toString() || 'anonymous';
    const ip = ipKeyGenerator(req.ip);

    const paymentOrderId =
      req.body?.paymentData?.order_id ||
      req.body?.orderData?.razorpayOrderId ||
      req.body?.idempotencyKey ||
      'unknown';

    return `payment-operation:${userId}:${paymentOrderId}:${ip}`;
  },
  message: {
    message:
      'Too many verification attempts for this payment. Please try again later.',
  },
});

export {
  authLimiter,
  otpLimiter,
  passwordResetLimiter,
  contactLimiter,
  guestWishlistLimiter,
  paymentVerificationUserLimiter,
  paymentVerificationOrderLimiter,
};
