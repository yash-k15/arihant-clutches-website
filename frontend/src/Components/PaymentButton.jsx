import siteConfig from '../config/siteConfig.js';
import { useRef, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from '../slices/paymentApiSlice';
import { useCheckStockMutation } from '../slices/ordersApiSlice.js';
import { clearCart } from '../slices/cartSlice.js';
import { useCheckout } from './Checkout/CheckoutContext.jsx';

import '../assets/styles/components/PaymentButton.css';

const getPersistentIdempotencyKey = (paymentMethod, checkoutFingerprint) => {
  const storageKey = `arihant_checkout_idempotency_${paymentMethod}`;

  try {
    const storedValue = sessionStorage.getItem(storageKey);

    if (storedValue) {
      const parsedValue = JSON.parse(storedValue);

      if (
        parsedValue.fingerprint === checkoutFingerprint &&
        typeof parsedValue.key === 'string' &&
        parsedValue.key
      ) {
        return parsedValue.key;
      }
    }

    const key = crypto.randomUUID();

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({ fingerprint: checkoutFingerprint, key }),
    );

    return key;
  } catch {
    // Continue checkout if browser storage is unavailable.
    return crypto.randomUUID();
  }
};

const clearPersistentIdempotencyKey = (paymentMethod) => {
  try {
    sessionStorage.removeItem(`arihant_checkout_idempotency_${paymentMethod}`);
  } catch {
    // Checkout completion should not depend on browser storage.
  }
};

const PaymentButton = ({ disabled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const paymentInProgressRef = useRef(false);
  const paymentVerificationInProgressRef = useRef(false);
  const paymentOutcomeRef = useRef(null);

  const cart = useSelector((state) => state.cart);
  const userInfo = useSelector((state) => state.auth);

  const { closeCheckout } = useCheckout();

  const checkoutFingerprint = JSON.stringify({
    userId: userInfo?._id || userInfo?.id || null,
    cartItems: cart.cartItems.map((item) => ({
      product: item._id,
      variantId: item.variantId,
      qty: item.qty,
    })),
    shippingAddress: cart.shippingAddress,
  });

  const [checkStock] = useCheckStockMutation();
  const [createRazorpayOrder, { isLoading }] = useCreateRazorpayOrderMutation();

  const [verifyPayment, { isLoading: loadingVerify }] =
    useVerifyPaymentMutation();

  const resetPaymentState = () => {
    paymentInProgressRef.current = false;
    setPaymentInProgress(false);
  };

  const handlePayment = async () => {
    if (paymentInProgressRef.current) {
      return;
    }

    paymentInProgressRef.current = true;
    paymentOutcomeRef.current = null;
    setPaymentInProgress(true);

    try {
      // CHECK STOCK BEFORE OPENING RAZORPAY
      await checkStock({
        orderItems: cart.cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          color: item.color,
          variantId: item.variantId,
          qty: item.qty,
        })),
      }).unwrap();

      // ---------- COD ----------
      if (cart.paymentMethod === 'COD') {
        const orderPromise = verifyPayment({
          idempotencyKey: getPersistentIdempotencyKey(
            'COD',
            checkoutFingerprint,
          ),
          orderData: {
            orderItems: cart.cartItems.map((item) => ({
              product: item._id,
              slug: item.slug,
              name: item.name,
              image: item.image,
              price: item.price,
              color: item.color,
              variantId: item.variantId,
              qty: item.qty,
            })),

            shippingAddress: cart.shippingAddress,

            paymentMethod: 'COD',

            itemsPrice: cart.itemsPrice,
            shippingPrice: cart.shippingPrice,
            taxPrice: cart.taxPrice,
            totalPrice: cart.totalPrice,
          },
        }).unwrap();

        toast.promise(orderPromise, {
          loading: 'Placing order...',
          success: 'Order placed successfully',
          error: (error) =>
            error?.data?.error ||
            error?.data?.message ||
            error?.message ||
            'Unable to place order',
        });

        try {
          const res = await orderPromise;

          clearPersistentIdempotencyKey('COD');
          dispatch(clearCart());
          closeCheckout();
          navigate(`/order/${res.order._id}`, {
            state: { justPlacedOrder: true },
          });
        } catch {
          // toast.promise already displays the error.
        } finally {
          resetPaymentState();
        }

        return;
      }

      // ---------- ONLINE ----------
      // CHECK IF RAZORPAY EXISTS
      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load');
        resetPaymentState();
        return;
      }

      // CREATE RAZORPAY ORDER
      const order = await createRazorpayOrder({
        orderItems: cart.cartItems.map((item) => ({
          product: item._id,
          variantId: item.variantId,
          qty: item.qty,
        })),
        paymentMethod: 'ONLINE',
        shippingAddress: cart.shippingAddress,
        idempotencyKey: getPersistentIdempotencyKey(
          'ONLINE',
          checkoutFingerprint,
        ),
      }).unwrap();

      // RAZORPAY OPTIONS
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: siteConfig.brand.name,
        description: `${cart.cartItems.length} items purchase`,

        // PAYMENT SUCCESS HANDLER
        handler: async function (response) {
          if (paymentVerificationInProgressRef.current) {
            return;
          }

          paymentVerificationInProgressRef.current = true;

          try {
            const paymentPromise = verifyPayment({
              paymentData: response,
              orderData: { paymentMethod: 'ONLINE' },
            }).unwrap();

            toast.promise(paymentPromise, {
              loading: 'Verifying payment...',
              success: 'Payment verified successfully!',
              error: 'Payment verification failed',
            });

            const res = await paymentPromise;

            if (res.success) {
              paymentOutcomeRef.current = 'success';

              clearPersistentIdempotencyKey('ONLINE');
              dispatch(clearCart());
              closeCheckout();
              navigate(`/order/${res.order._id}`, {
                state: { justPlacedOrder: true },
              });
            } else {
              paymentOutcomeRef.current = 'failed';
              toast.error('Payment verification failed');
            }
          } catch (error) {
            paymentOutcomeRef.current = 'failed';
            console.error(error);
          } finally {
            paymentVerificationInProgressRef.current = false;
            resetPaymentState();
          }
        },

        // PAYMENT FAILED HANDLER
        'payment.failed': function (response) {
          if (paymentOutcomeRef.current) {
            return;
          }

          paymentOutcomeRef.current = 'failed';

          toast.error(
            response?.error?.description || 'Payment failed. Please try again.',
          );

          resetPaymentState();
        },

        // PAYMENT MODAL DISMISSED
        modal: {
          ondismiss: function () {
            // Razorpay may dismiss the modal while our success callback
            // is still verifying the payment. Let the verification finish.
            if (
              paymentVerificationInProgressRef.current ||
              paymentOutcomeRef.current
            ) {
              return;
            }

            paymentOutcomeRef.current = 'dismissed';

            toast.info('Payment cancelled. You can try again.');

            resetPaymentState();
          },
        },

        // OPTIONAL PREFILL
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
        },

        // OPTIONAL THEME
        theme: {
          color: siteConfig.theme.razorpayColor,
        },
      };

      // OPEN RAZORPAY
      const paymentObject = new window.Razorpay(options);

      paymentObject.open();
    } catch (error) {
      console.error(error);

      const outOfStock = error?.data?.outOfStockItems;

      if (outOfStock?.length) {
        const items = outOfStock
          .map((item) => `${item.name} (${item.color})`)
          .join(', ');

        toast.error(`Out of stock: ${items}`);
        resetPaymentState();
        return;
      }

      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.message ||
          'Payment Failed',
      );
      resetPaymentState();
    }
  };

  return (
    <Button
      className='payment-btn'
      disabled={disabled || loadingVerify || isLoading || paymentInProgress}
      onClick={handlePayment}
    >
      {cart.paymentMethod === 'COD'
        ? paymentInProgress
          ? 'Processing...'
          : 'Place Order'
        : isLoading || paymentInProgress
          ? 'Processing...'
          : 'Pay & Place Order'}
    </Button>
  );
};

export default PaymentButton;
