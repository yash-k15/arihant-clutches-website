import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'sonner';
import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from '../slices/paymentApiSlice';
import { useCheckStockMutation } from '../slices/ordersApiSlice.js';
import { clearCartItems } from '../slices/cartSlice.js';
import { useCheckout } from './Checkout/CheckoutContext.jsx';

import '../assets/styles/components/PaymentButton.css';

const PaymentButton = ({ disabled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const userInfo = useSelector((state) => state.auth);

  const { closeCheckout } = useCheckout();

  const [checkStock] = useCheckStockMutation();
  const [createRazorpayOrder, { isLoading }] = useCreateRazorpayOrderMutation();

  const [verifyPayment, { isLoading: loadingVerify }] =
    useVerifyPaymentMutation();

  const handlePayment = async () => {
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

        const res = await orderPromise;

        dispatch(clearCartItems());
        closeCheckout();
        navigate(`/order/${res.order._id}`, {
          state: { justPlacedOrder: true },
        });

        return;
      }

      // ---------- ONLINE ----------
      // CHECK IF RAZORPAY EXISTS
      if (!window.Razorpay) {
        toast.error('Razorpay SDK failed to load');
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
          try {
            // VERIFY PAYMENT + CREATE DB ORDER
            const paymentPromise = verifyPayment({
              paymentData: response,
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
                paymentMethod: 'ONLINE',
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
              },
            }).unwrap();

            toast.promise(paymentPromise, {
              loading: 'Verifying payment...',
              success: (res) =>
                res.success
                  ? 'Payment successful'
                  : 'Payment verification failed',
              error: (error) => {
                const outOfStock = error?.data?.outOfStockItems;

                if (outOfStock?.length) {
                  const items = outOfStock
                    .map((item) => `${item.name} (${item.color})`)
                    .join(', ');

                  return `Out of stock: ${items}`;
                }

                return (
                  error?.data?.message ||
                  error?.message ||
                  'Payment verification failed'
                );
              },
            });

            const res = await paymentPromise;

            // SUCCESS
            if (res.success) {
              dispatch(clearCartItems());
              closeCheckout();
              navigate(`/order/${res.order._id}`, {
                state: { justPlacedOrder: true },
              });
            } else {
              toast.error('Payment verification failed');
            }
          } catch (error) {
            console.log(error);
          }
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
        return;
      }

      toast.error(error?.data?.message || error?.message || 'Payment Failed');
    }
  };

  return (
    <Button
      className='payment-btn'
      disabled={disabled || loadingVerify || isLoading}
      onClick={handlePayment}
    >
      {cart.paymentMethod === 'COD'
        ? 'Place Order'
        : isLoading
          ? 'Processing...'
          : 'Pay & Place Order'}
    </Button>
  );
};

export default PaymentButton;
