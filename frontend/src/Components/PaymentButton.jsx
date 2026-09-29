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

const PaymentButton = ({ disabled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [paymentInProgress, setPaymentInProgress] = useState(false);

  const codIdempotencyKeyRef = useRef(crypto.randomUUID());
  const onlineIdempotencyKeyRef = useRef(crypto.randomUUID());
  const paymentInProgressRef = useRef(false);
  const paymentVerificationInProgressRef = useRef(false);
  const paymentOutcomeRef = useRef(null);

  const cart = useSelector((state) => state.cart);
  const userInfo = useSelector((state) => state.auth);

  const { closeCheckout } = useCheckout();

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
          idempotencyKey: codIdempotencyKeyRef.current,
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
            error?.data?.message || error?.message || 'Unable to place order',
        });

        try {
          const res = await orderPromise;

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
        idempotencyKey: onlineIdempotencyKeyRef.current,
      }).unwrap();

      // RAZORPAY OPTIONS
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        order_id: order.id,
        name: 'Arihant Clutches',
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
            console.log(error);
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
          color: '#3399cc',
        },
      };

      // OPEN RAZORPAY
      const paymentObject = new window.Razorpay(options);

      paymentObject.open();
    } catch (error) {
      console.log(error);

      const outOfStock = error?.data?.outOfStockItems;

      if (outOfStock?.length) {
        const items = outOfStock
          .map((item) => `${item.name} (${item.color})`)
          .join(', ');

        toast.error(`Out of stock: ${items}`);
        resetPaymentState();
        return;
      }

      toast.error(error?.data?.message || error?.message || 'Payment Failed');
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
