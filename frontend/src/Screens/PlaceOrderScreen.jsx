import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Row, Col, ListGroup, Image, Card } from 'react-bootstrap';
import CheckoutSteps from '../Components/CheckoutSteps.jsx';
import Loader from '../Components/Loader.jsx';
import Message from '../Components/Message.jsx';
import { useCreateOrderMutation } from '../slices/ordersApiSlice.js';
import PaymentButton from '../Components/PaymentButton.jsx';
import { getCloudinaryImage } from '../utils/cloudinary.js';
import { toast } from 'react-toastify';
import { clearCartItems } from '../slices/cartSlice.js';

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const user = useSelector((state) => state.auth);

  const [createOrder, { isLoading, error }] = useCreateOrderMutation();

  useEffect(() => {
    if (!cart.shippingAddress.address) {
      navigate('/shipping');
    } else if (!cart.paymentMethod) {
      navigate('/paymentmethod');
    }
  }, [cart.paymentMethod, cart.shippingAddress.address, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
      }).unwrap();
      dispatch(clearCartItems());
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error?.data?.message || error.message);
    }
  };

  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 step5 />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item className='placeorder-section'>
              <h2 className='placeorder-heading'>Shipping</h2>
              <p>
                <strong>To:{'      '}</strong>
                {user.userInfo.name}
              </p>
              <p>
                <strong>Address:{'      '}</strong>
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                {cart.shippingAddress.state}, {cart.shippingAddress.postalCode},{' '}
                {cart.shippingAddress.country}
              </p>
            </ListGroup.Item>

            <ListGroup.Item className='placeorder-section'>
              <h2 className='placeorder-heading'>Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <Message>Your cart is empty</Message>
              ) : (
                <ListGroup variant='flush'>
                  {cart.cartItems.map((item, index) => (
                    <ListGroup.Item key={index} className='order-item'>
                      <Row>
                        <Col md={3}>
                          <Image
                            src={getCloudinaryImage(
                              item.image,
                              'w_400,h_400,c_fill,f_auto,q_auto',
                            )}
                            alt={item.name}
                            fluid
                            rounded
                          />
                        </Col>
                        <Col>
                          <p>
                            <Link
                              to={`/products/${item.product}`}
                              className='order-item-name'
                            >
                              {item.name}
                            </Link>
                          </p>
                          <p className='cart-variant'>Color: {item.color}</p>
                        </Col>
                        <Col md={4}>
                          {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className='summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2 className='placeorder-heading'>Order Summary</h2>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Items:</Col>
                  <Col>₹ {cart.itemsPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Shipping:</Col>
                  <Col>₹ {cart.shippingPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>tax:</Col>
                  <Col>₹ {cart.taxPrice}</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Total:</Col>
                  <Col>₹ {cart.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {error && (
                <ListGroup.Item>
                  {error && (
                    <Message variant='danger'>{error.data.message}</Message>
                  )}
                </ListGroup.Item>
              )}
              <ListGroup.Item>
                <PaymentButton disabled={cart.cartItems.length === 0} />
                <p className='payment-trust'>
                  {cart.paymentMethod === 'ONLINE'
                    ? 'Secure payment powered by Razorpay • 100% safe checkout'
                    : 'Pay with cash when your order arrives'}
                </p>
                {isLoading && <Loader />}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderScreen;
