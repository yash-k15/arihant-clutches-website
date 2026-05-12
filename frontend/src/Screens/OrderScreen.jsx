import { Link, useParams } from 'react-router-dom';
// import { useEffect } from 'react';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
// import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import Message from '../Components/Message.jsx';
import Loader from '../Components/Loader.jsx';
import {
  useGetOrderDetailsQuery,
  useDeliverOrderMutation,
} from '../slices/ordersApiSlice';

const OrderScreen = () => {
  const { id: orderId } = useParams();

  const { userInfo } = useSelector((state) => state.auth);

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId);
      refetch();
      toast.success('Order Delivered');
    } catch (err) {
      toast.error(err?.data?.message || err.message);
    }
  };

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger' />
  ) : (
    <>
      {order.isPaid && !userInfo.isAdmin && (
        <div className='order-success'>
          <h1 className='success-title'>🎉 Thank You for Your Order!</h1>
          <p className='success-text'>
            Your payment was successful. We've received your order and are
            getting it ready.
          </p>
          <div className='order-trust'>
            <p>✔ Secure Payment Completed</p>
            <p>✔ Order Confirmed</p>
            <p>✔ Email Receipt Sent</p>
          </div>
        </div>
      )}
      <div className='order-page-header'>
        <h1 className='order-title'>Order Confirmation</h1>
        <p className='order-meta'>
          Order ID: <span>{order._id}</span>
        </p>
      </div>
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item className='order-section'>
              <h2>Shipping</h2>
              <p>
                <strong>Name: </strong> {order.user.name}
              </p>
              <p>
                <strong>Email: </strong> {order.user.email}
              </p>
              <p>
                <strong>Address: </strong>
                {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                {order.shippingAddress.state},{' '}
                {order.shippingAddress.postalCode},{' '}
                {order.shippingAddress.country}
              </p>
              {order.isDelivered ? (
                <Message variant='success'>
                  Delivered on{' '}
                  {new Date(order.deliveredAt).toLocaleDateString('en-GB')}
                </Message>
              ) : (
                <Message variant='danger'>Not Delivered</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className='order-section'>
              <h2>Payment</h2>
              {/* <p>
                <strong>Method: </strong> {order.paymentMethod}
              </p> */}
              {order.isPaid ? (
                <Message variant='success'>
                  Paid on {new Date(order.paidAt).toLocaleDateString('en-GB')}
                </Message>
              ) : (
                <Message variant='danger'>Not Paid</Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className='order-section'>
              <h2>Order Items</h2>
              {order.orderItems.map((item, index) => (
                <ListGroup.Item key={index} className='order-item-row'>
                  <Row>
                    <Col md={3}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col>
                      <Link
                        to={`/product/${item.product}`}
                        className='order-product-link'
                      >
                        {item.name}
                      </Link>
                    </Col>
                    <Col md={4}>
                      {item.qty} x ₹{item.price} = ₹{item.qty * item.price}
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup.Item>
          </ListGroup>
        </Col>
        <Col md={4}>
          <Card className='order-summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item>
                <h2>Order Summary</h2>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Items</Col>
                  <Col>₹{order.itemsPrice}</Col>
                </Row>

                <Row>
                  <Col>Shipping</Col>
                  <Col>₹{order.shippingPrice}</Col>
                </Row>

                <Row>
                  <Col>Tax</Col>
                  <Col>₹{order.taxPrice}</Col>
                </Row>

                <Row>
                  <Col>Total</Col>
                  <Col>₹{order.totalPrice}</Col>
                </Row>
              </ListGroup.Item>
              {/* Pay Order Placeholder */}
              {loadingDeliver && <Loader />}
              {userInfo &&
                userInfo.isAdmin &&
                order.isPaid &&
                !order.isDelivered && (
                  <ListGroup.Item>
                    <Button
                      type='button'
                      className='btn btn-block'
                      onClick={deliverOrderHandler}
                    >
                      Mark As Delivered
                    </Button>
                  </ListGroup.Item>
                )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderScreen;
