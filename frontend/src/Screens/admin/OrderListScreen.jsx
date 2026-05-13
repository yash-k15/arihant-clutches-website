import { LinkContainer } from 'react-router-bootstrap';
import { Table, Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

const OrderListScreen = () => {
  const { data: orders, isLoading, error } = useGetOrdersQuery();

  return (
    <>
      <div className='admin-table-wrapper'>
        <div className='admin-page-header'>
          <div>
            <p className='admin-page-subtitle'>ADMIN PANEL</p>
            <h1 className='admin-page-title'>Orders</h1>
          </div>
        </div>
        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>
            {error?.data?.message || error.error}
          </Message>
        ) : (
          <Table hover responsive className='admin-table align-middle'>
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>DATE</th>
                <th>ITEMS</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>DELIVERY</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <span className='admin-order-id'>
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </td>

                  <td>
                    <span className='admin-user-name'>{order.user?.name}</span>
                  </td>

                  <td>
                    <span className='admin-date-text'>
                      {new Date(order.createdAt).toLocaleDateString('en-GB')}
                    </span>
                  </td>

                  <td>
                    <span className='admin-items-badge'>
                      {order.orderItems.length} items
                    </span>
                  </td>

                  <td className='admin-price-cell'>₹{order.totalPrice}</td>

                  <td>
                    {order.isPaid ? (
                      <span className='admin-status success'>Paid</span>
                    ) : (
                      <span className='admin-status pending'>Pending</span>
                    )}
                  </td>

                  <td>
                    {order.isDelivered ? (
                      <span className='admin-status success'>Delivered</span>
                    ) : (
                      <span className='admin-status processing'>
                        Processing
                      </span>
                    )}
                  </td>

                  <td>
                    <LinkContainer to={`/order/${order._id}`}>
                      <Button variant='light' className='admin-action-btn'>
                        View
                      </Button>
                    </LinkContainer>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </>
  );
};

export default OrderListScreen;
