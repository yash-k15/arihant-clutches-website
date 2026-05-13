import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import {
  useCreateRazorpayOrderMutation,
  useVerifyPaymentMutation,
} from '../slices/paymentApiSlice';
import { clearCartItems } from '../slices/cartSlice.js';

const PaymentButton = ({ disabled }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);
  const userInfo = useSelector((state) => state.auth);

  const [createRazorpayOrder, { isLoading }] = useCreateRazorpayOrderMutation();

  const [verifyPayment, { isLoading: loadingVerify }] =
    useVerifyPaymentMutation();

  const handlePayment = async () => {
    // CHECK IF RAZORPAY EXISTS
    if (!window.Razorpay) {
      alert('Razorpay SDK failed to load');
      return;
    }

    try {
      // CREATE RAZORPAY ORDER
      const order = await createRazorpayOrder(cart.totalPrice).unwrap();

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
            const res = await verifyPayment({
              paymentData: response,
              orderData: {
                orderItems: cart.cartItems.map((item) => ({
                  product: item.product,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  color: item.color,
                  variantId: item.variantId,
                  qty: item.qty,
                })),
                shippingAddress: cart.shippingAddress,
                itemsPrice: cart.itemsPrice,
                shippingPrice: cart.shippingPrice,
                taxPrice: cart.taxPrice,
                totalPrice: cart.totalPrice,
              },
            }).unwrap();

            // SUCCESS
            if (res.success) {
              dispatch(clearCartItems());

              navigate(`/order/${res.order._id}`);
            } else {
              alert('Payment verification failed');
            }
          } catch (error) {
            console.log(error);

            toast.error(
              error?.data?.message || error?.message || 'Something went wrong',
            );
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

      toast.error(error?.data?.message || error?.message || 'Payment Failed');
    }
  };

  return (
    <Button
      className='payment-btn'
      disabled={disabled || loadingVerify || isLoading}
      onClick={handlePayment}
    >
      {isLoading ? 'Processing...' : 'Pay & Place Order'}
    </Button>
  );
};

export default PaymentButton;
