import { LinkContainer } from 'react-router-bootstrap';
import { Button, Table } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';
import '../../assets/styles/components/OrderListScreen.css';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const getPaymentMethod = (order) =>
    order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';

  const renderPayment = (order) => (
    <div className='admin-orders-payment'>
      <span className='admin-orders-payment-method'>
        {getPaymentMethod(order)}
      </span>

      <span
        className={
          order.isPaid
            ? 'admin-orders-status admin-orders-status-paid'
            : 'admin-orders-status admin-orders-status-pending'
        }
      >
        {order.isPaid ? 'Paid' : 'Pending'}
      </span>
    </div>
  );

  const renderDelivery = (order) => (
    <span
      className={
        order.isDelivered
          ? 'admin-orders-status admin-orders-status-delivered'
          : 'admin-orders-status admin-orders-status-processing'
      }
    >
      {order.isDelivered ? 'Delivered' : 'Processing'}
    </span>
  );

  return (
    <div className='admin-orders-page'>
      <div className='admin-orders-header'>
        <div>
          <p className='admin-orders-subtitle'>ADMIN PANEL</p>
          <h1 className='admin-orders-title'>Orders</h1>
          <p className='admin-orders-description'>
            Manage customer orders and track their status
          </p>
        </div>
      </div>

      <div className='admin-orders-toolbar'>
        <div className='admin-orders-search'>
          <input
            type='search'
            placeholder='Search orders...'
            aria-label='Search orders'
          />
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          {/* Desktop / Tablet */}
          <div className='admin-orders-table-wrapper'>
            <Table hover borderless className='admin-orders-table align-middle'>
              <thead>
                <tr>
                  <th>ORDER</th>
                  <th>CUSTOMER</th>
                  <th>DATE</th>
                  <th>ITEMS</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>DELIVERY</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <span className='admin-orders-id'>
                        #{order._id.slice(-6).toUpperCase()}
                      </span>
                    </td>

                    <td>
                      <div className='admin-orders-customer'>
                        <span className='admin-orders-customer-name'>
                          {order.user?.name}
                        </span>

                        {order.user?.phone && (
                          <span className='admin-orders-customer-phone'>
                            +91 {order.user.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className='admin-orders-date'>
                        {formatDate(order.createdAt)}
                      </span>
                    </td>

                    <td>
                      <span className='admin-orders-items'>
                        {order.orderItems.length}{' '}
                        {order.orderItems.length === 1 ? 'item' : 'items'}
                      </span>
                    </td>

                    <td>
                      <span className='admin-orders-price'>
                        ₹{formatPrice(order.totalPrice)}
                      </span>
                    </td>

                    <td>{renderPayment(order)}</td>

                    <td>{renderDelivery(order)}</td>

                    <td>
                      <div className='admin-orders-actions'>
                        <LinkContainer to={`/order/${order._id}`}>
                          <Button
                            variant='light'
                            className='admin-orders-view-btn'
                            title='View order'
                          >
                            <FaEye />
                            <span>View</span>
                          </Button>
                        </LinkContainer>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* Mobile */}
          <div className='admin-orders-mobile-list'>
            {orders.map((order) => (
              <div className='admin-order-card' key={order._id}>
                <div className='admin-order-card-header'>
                  <span className='admin-orders-id'>
                    #{order._id.slice(-6).toUpperCase()}
                  </span>

                  {renderDelivery(order)}
                </div>

                <div className='admin-order-card-customer'>
                  <span className='admin-orders-customer-name'>
                    {order.user?.name}
                  </span>

                  {order.user?.phone && (
                    <span className='admin-orders-customer-phone'>
                      +91 {order.user.phone}
                    </span>
                  )}
                </div>

                <div className='admin-order-card-date'>
                  {formatDate(order.createdAt)}
                </div>

                <div className='admin-order-card-summary'>
                  <div>
                    <span className='admin-order-card-label'>ITEMS</span>

                    <span className='admin-orders-items'>
                      {order.orderItems.length}{' '}
                      {order.orderItems.length === 1 ? 'item' : 'items'}
                    </span>
                  </div>

                  <div>
                    <span className='admin-order-card-label'>TOTAL</span>

                    <span className='admin-orders-price'>
                      ₹{formatPrice(order.totalPrice)}
                    </span>
                  </div>
                </div>

                <div className='admin-order-card-payment'>
                  <span className='admin-order-card-label'>PAYMENT</span>

                  {renderPayment(order)}
                </div>

                <div className='admin-orders-mobile-actions'>
                  <LinkContainer to={`/order/${order._id}`}>
                    <Button className='admin-orders-mobile-view-btn'>
                      <FaEye />
                      <span>View Order</span>
                    </Button>
                  </LinkContainer>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default OrderListScreen;
