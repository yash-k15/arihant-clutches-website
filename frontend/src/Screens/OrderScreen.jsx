import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Button, Card } from 'react-bootstrap';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { FiCopy } from 'react-icons/fi';

import Message from '../Components/Message.jsx';
import Loader from '../Components/Loader.jsx';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useDeliverOrderMutation,
} from '../slices/ordersApiSlice';
import { getCloudinaryImage } from '../utils/cloudinary.js';

import '../assets/styles/components/OrderScreen.css';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

  const justPlacedOrder = location.state?.justPlacedOrder === true;

  const {
    data: order,
    refetch,
    isLoading,
    error,
  } = useGetOrderDetailsQuery(orderId);

  const [payOrder, { isLoading: loadingPay }] = usePayOrderMutation();

  const [deliverOrder, { isLoading: loadingDeliver }] =
    useDeliverOrderMutation();

  const payOrderHandler = async () => {
    try {
      await payOrder(orderId).unwrap();
      await refetch();
      toast.success('Payment marked as received');
    } catch (error) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          'Unable to mark payment as received',
      );
    }
  };

  const deliverOrderHandler = async () => {
    try {
      await deliverOrder(orderId).unwrap();
      await refetch();
      toast.success('Order marked as delivered');
    } catch (error) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          'Unable to mark order as delivered',
      );
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant='danger'>
        {error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          'Unable to load this order. Please try again.'}
      </Message>
    );
  }

  const isCashOnDelivery =
    order.paymentMethod?.toLowerCase().includes('cod') ||
    order.paymentMethod?.toLowerCase().includes('cash');

  const showThankYou = justPlacedOrder && !userInfo?.isAdmin;

  const copyOrderId = async () => {
    try {
      await navigator.clipboard.writeText(order._id);
      toast.success('Order ID copied');
    } catch (error) {
      toast.error('Unable to copy Order ID');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(price);

  const formatDateWithOrdinal = (date) => {
    const parsedDate = new Date(date);
    const day = parsedDate.getDate();

    const suffix =
      day >= 11 && day <= 13
        ? 'th'
        : day % 10 === 1
          ? 'st'
          : day % 10 === 2
            ? 'nd'
            : day % 10 === 3
              ? 'rd'
              : 'th';

    const monthYear = parsedDate.toLocaleDateString('en-GB', {
      month: 'long',
      year: 'numeric',
    });

    return `${day}${suffix} ${monthYear}`;
  };

  return (
    <div className='order-page'>
      {showThankYou && (
        <section className='order-success'>
          <p className='order-success-label'>ORDER CONFIRMED</p>

          <h1 className='success-title'>🎉 Thank You for Your Order!</h1>

          <p className='success-text'>
            {isCashOnDelivery
              ? 'Your order has been confirmed and is being prepared.'
              : "Your payment was successful and we've received your order."}
          </p>

          <div className='order-trust'>
            {isCashOnDelivery ? (
              <>
                <span>✓ Cash on Delivery</span>
                <span>✓ Payment Due on Delivery</span>
              </>
            ) : (
              <span>✓ Payment Received</span>
            )}

            <span>✓ Order Confirmed</span>
          </div>
        </section>
      )}

      <Row className='align-items-center order-page-header-row'>
        <Col>
          <div className='order-page-header'>
            <p className='order-page-label'>ORDER DETAILS</p>

            <h1 className='order-title'>Order Confirmation</h1>

            <p className='order-meta'>
              Order ID:
              <span className='order-id'>
                {order._id}
                <button
                  type='button'
                  className='order-copy-btn'
                  onClick={copyOrderId}
                  aria-label='Copy order ID'
                  title='Copy order ID'
                >
                  <FiCopy />
                </button>
              </span>
            </p>

            <button
              type='button'
              className='back-to-orders-btn'
              onClick={() =>
                navigate(userInfo?.isAdmin ? '/admin/orderlist' : '/profile')
              }
            >
              ← {userInfo?.isAdmin ? 'Back to Order List' : 'Back to My Orders'}
            </button>
          </div>
        </Col>
      </Row>

      <Row className='order-content'>
        <Col lg={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item className='order-section'>
              <div className='order-section-header'>
                <p className='order-section-label'>DELIVERY</p>
                <h2>Shipping Information</h2>
              </div>

              <div className='order-contact-info'>
                <p>
                  <strong>Name</strong>
                  <span>{order.shippingAddress.fullName}</span>
                </p>

                {order.user.email && (
                  <p>
                    <strong>Email</strong>
                    <span>{order.user.email}</span>
                  </p>
                )}

                <p>
                  <strong>Phone</strong>
                  <span>{order.shippingAddress.phone}</span>
                </p>

                <p>
                  <strong>Address</strong>
                  <span>
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 && (
                      <>, {order.shippingAddress.addressLine2}</>
                    )}
                    , {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} -{' '}
                    {order.shippingAddress.postalCode},{' '}
                    {order.shippingAddress.country}
                  </span>
                </p>
              </div>

              <div className='order-status'>
                {order.isDelivered ? (
                  <Message variant='success'>
                    Delivered on {formatDateWithOrdinal(order.deliveredAt)}
                  </Message>
                ) : (
                  <Message variant='danger'>Not Delivered</Message>
                )}
              </div>
            </ListGroup.Item>

            <ListGroup.Item className='order-section'>
              <div className='order-section-header'>
                <p className='order-section-label'>PAYMENT</p>
                <h2>Payment Information</h2>
              </div>

              <div className='payment-method'>
                <span>Payment Method</span>
                <strong>
                  {isCashOnDelivery ? 'Cash on Delivery' : 'Online Payment'}
                </strong>
              </div>

              {order.isPaid ? (
                <Message variant='success'>
                  Payment received on {formatDateWithOrdinal(order.paidAt)}
                </Message>
              ) : (
                <Message variant='danger'>
                  {isCashOnDelivery
                    ? 'Payment Pending — Due on Delivery'
                    : 'Payment Pending'}
                </Message>
              )}
            </ListGroup.Item>

            <ListGroup.Item className='order-section'>
              <div className='order-section-header'>
                <p className='order-section-label'>YOUR PURCHASE</p>
                <h2>Order Items</h2>
              </div>

              <div className='order-items'>
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index} className='order-item-row'>
                    <Row className='align-items-center'>
                      <Col xs={4} sm={3} md={3}>
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

                      <Col xs={8} sm={5} md={5}>
                        <Link
                          to={`/products/${item.slug}`}
                          state={{ variantId: item.variantId }}
                          className='order-product-link'
                        >
                          {item.name}
                        </Link>

                        {item.color && (
                          <p className='order-item-variant'>
                            Color: {item.color}
                          </p>
                        )}

                        <p className='order-item-quantity'>
                          Quantity: {item.qty}
                        </p>
                      </Col>

                      <Col xs={12} sm={4} md={4} className='order-item-price'>
                        <span>
                          {item.qty} × ₹{formatPrice(item.price)}
                        </span>

                        <strong>₹{formatPrice(item.qty * item.price)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </div>
            </ListGroup.Item>
          </ListGroup>
        </Col>

        <Col lg={4}>
          <Card className='order-summary-card'>
            <ListGroup variant='flush'>
              <ListGroup.Item className='order-summary-header'>
                <p className='order-section-label'>TOTAL</p>
                <h2>Order Summary</h2>
                <p className='order-summary-items'>
                  {order.orderItems.length}{' '}
                  {order.orderItems.length === 1 ? 'Item' : 'Items'}
                </p>
              </ListGroup.Item>

              <ListGroup.Item className='order-summary-details'>
                <div className='summary-row'>
                  <span>Subtotal</span>
                  <span>₹{formatPrice(order.itemsPrice)}</span>
                </div>

                <div className='summary-row'>
                  <span>Shipping</span>
                  <span>₹{formatPrice(order.shippingPrice)}</span>
                </div>

                <div className='summary-row summary-total'>
                  <span>Total</span>
                  <strong>₹{formatPrice(order.totalPrice)}</strong>
                </div>
              </ListGroup.Item>

              {(loadingPay || loadingDeliver) && (
                <ListGroup.Item className='order-loading'>
                  <Loader />
                </ListGroup.Item>
              )}

              {userInfo?.isAdmin && (!order.isPaid || !order.isDelivered) && (
                <ListGroup.Item className='order-admin-action'>
                  {!order.isPaid && (
                    <Button
                      type='button'
                      className='admin-create-btn w-100'
                      onClick={payOrderHandler}
                      disabled={loadingPay || loadingDeliver}
                    >
                      Mark As Paid
                    </Button>
                  )}

                  {!order.isDelivered && (
                    <Button
                      type='button'
                      className='admin-create-btn w-100'
                      onClick={deliverOrderHandler}
                      disabled={loadingPay || loadingDeliver}
                    >
                      Mark As Delivered
                    </Button>
                  )}
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderScreen;
