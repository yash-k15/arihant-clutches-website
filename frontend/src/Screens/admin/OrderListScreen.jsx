import { useEffect, useState } from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import { Button, Table } from 'react-bootstrap';
import { FaEye } from 'react-icons/fa';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Message from '../../Components/Message';
import Loader from '../../Components/Loader';
import { useGetOrdersQuery } from '../../slices/ordersApiSlice';

import AdminTableToolbar from '../../Components/AdminTableToolbar';
import AdminFilterPanel from '../../Components/AdminFilterPanel';
import Paginate from '../../Components/Paginate';
import {
  addDaysToDateString,
  formatDateInBusinessTimeZone,
  getDateStringInBusinessTimeZone,
} from '../../utils/dateTime.js';

import '../../assets/styles/components/OrderListScreen.css';

const OrderListScreen = () => {
  const { pageNumber } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const keyword = searchParams.get('keyword') || '';
  const paymentStatus = searchParams.get('paymentStatus') || '';
  const paymentMethod = searchParams.get('paymentMethod') || '';
  const deliveryStatus = searchParams.get('deliveryStatus') || '';
  const dateFrom = searchParams.get('dateFrom') || '';
  const dateTo = searchParams.get('dateTo') || '';
  const sort = searchParams.get('sort') || 'latest';

  const [searchValue, setSearchValue] = useState(keyword);

  const [sortOpen, setSortOpen] = useState(false);

  const [filterOpen, setFilterOpen] = useState(false);

  const [draftPaymentStatus, setDraftPaymentStatus] = useState(paymentStatus);

  const [draftPaymentMethod, setDraftPaymentMethod] = useState(paymentMethod);

  const [draftDeliveryStatus, setDraftDeliveryStatus] =
    useState(deliveryStatus);

  const [draftDateFrom, setDraftDateFrom] = useState(dateFrom);
  const [draftDateTo, setDraftDateTo] = useState(dateTo);
  const [draftDatePreset, setDraftDatePreset] = useState(
    dateFrom || dateTo ? 'custom' : 'all',
  );

  const orderSortOptions = [
    { value: 'latest', label: 'Latest' },
    { value: 'oldest', label: 'Oldest' },
    { value: 'total-asc', label: 'Total Low → High' },
    { value: 'total-desc', label: 'Total High → Low' },
  ];

  const filterCount =
    (paymentStatus ? 1 : 0) +
    (paymentMethod ? 1 : 0) +
    (deliveryStatus ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const { data, isLoading, error } = useGetOrdersQuery({
    keyword,
    pageNumber,
    paymentStatus,
    paymentMethod,
    deliveryStatus,
    dateFrom,
    dateTo,
    sort,
  });

  const orders = data?.orders || [];

  const openFilterPanel = () => {
    setDraftPaymentStatus(searchParams.get('paymentStatus') || '');
    setDraftPaymentMethod(searchParams.get('paymentMethod') || '');
    setDraftDeliveryStatus(searchParams.get('deliveryStatus') || '');

    const currentDateFrom = searchParams.get('dateFrom') || '';
    const currentDateTo = searchParams.get('dateTo') || '';

    setDraftDateFrom(currentDateFrom);
    setDraftDateTo(currentDateTo);

    if (!currentDateFrom && !currentDateTo) {
      setDraftDatePreset('all');
    } else if (currentDateFrom && currentDateTo) {
      const todayString = getDateStringInBusinessTimeZone();

      if (currentDateFrom === todayString && currentDateTo === todayString) {
        setDraftDatePreset('today');
      } else if (
        currentDateFrom === addDaysToDateString(todayString, -6) &&
        currentDateTo === todayString
      ) {
        setDraftDatePreset('7days');
      } else if (
        currentDateFrom === addDaysToDateString(todayString, -29) &&
        currentDateTo === todayString
      ) {
        setDraftDatePreset('30days');
      } else {
        setDraftDatePreset('custom');
      }
    } else {
      setDraftDatePreset('custom');
    }

    setFilterOpen(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = searchValue.trim();
      const currentKeyword = searchParams.get('keyword') || '';

      if (trimmedSearch === currentKeyword) return;

      const params = new URLSearchParams(searchParams);

      if (trimmedSearch) {
        params.set('keyword', trimmedSearch);
      } else {
        params.delete('keyword');
      }

      params.delete('pageNumber');

      navigate(
        {
          pathname: '/admin/orderlist',
          search: params.toString(),
        },
        { replace: true },
      );
    }, 400);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, navigate]);

  const formatDate = (date) =>
    formatDateInBusinessTimeZone(date, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const formatPrice = (price) => new Intl.NumberFormat('en-IN').format(price);

  const getPaymentMethod = (order) =>
    order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment';

  const renderPayment = (order) => {
    const isRefunded = order.paymentResult?.status === 'REFUNDED';

    return (
      <div className='admin-orders-payment'>
        <span className='admin-orders-payment-method'>
          {getPaymentMethod(order)}
        </span>

        <span
          className={
            isRefunded || order.isPaid
              ? 'admin-orders-status admin-orders-status-paid'
              : 'admin-orders-status admin-orders-status-pending'
          }
        >
          {isRefunded ? 'Refunded' : order.isPaid ? 'Paid' : 'Pending'}
        </span>
      </div>
    );
  };

  const renderDelivery = (order) => {
    if (order.paymentResult?.status === 'REFUNDED') {
      return (
        <span className='admin-orders-status admin-orders-status-not-eligible'>
          Not Eligible
        </span>
      );
    }

    return (
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
  };

  const handleSortChange = (value) => {
    const params = new URLSearchParams(searchParams);

    params.set('sort', value);
    params.delete('pageNumber');

    setSortOpen(false);

    navigate(
      {
        pathname: '/admin/orderlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

  const handleApplyFilters = () => {
    const params = new URLSearchParams(searchParams);

    if (draftPaymentStatus) {
      params.set('paymentStatus', draftPaymentStatus);
    } else {
      params.delete('paymentStatus');
    }

    if (draftPaymentMethod) {
      params.set('paymentMethod', draftPaymentMethod);
    } else {
      params.delete('paymentMethod');
    }

    if (draftDeliveryStatus) {
      params.set('deliveryStatus', draftDeliveryStatus);
    } else {
      params.delete('deliveryStatus');
    }

    const todayString = getDateStringInBusinessTimeZone();

    if (draftDatePreset === 'all') {
      params.delete('dateFrom');
      params.delete('dateTo');
    }

    if (draftDatePreset === 'today') {
      params.set('dateFrom', todayString);
      params.set('dateTo', todayString);
    }

    if (draftDatePreset === '7days') {
      params.set('dateFrom', addDaysToDateString(todayString, -6));
      params.set('dateTo', todayString);
    }

    if (draftDatePreset === '30days') {
      params.set('dateFrom', addDaysToDateString(todayString, -29));
      params.set('dateTo', todayString);
    }

    if (draftDatePreset === 'custom') {
      if (draftDateFrom) {
        params.set('dateFrom', draftDateFrom);
      } else {
        params.delete('dateFrom');
      }

      if (draftDateTo) {
        params.set('dateTo', draftDateTo);
      } else {
        params.delete('dateTo');
      }
    }

    params.delete('pageNumber');

    setFilterOpen(false);

    navigate(
      {
        pathname: '/admin/orderlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

  const handleResetFilters = () => {
    setDraftPaymentStatus('');
    setDraftPaymentMethod('');
    setDraftDeliveryStatus('');
    setDraftDateFrom('');
    setDraftDateTo('');
    setDraftDatePreset('all');

    const params = new URLSearchParams(searchParams);

    params.delete('paymentStatus');
    params.delete('paymentMethod');
    params.delete('deliveryStatus');
    params.delete('dateFrom');
    params.delete('dateTo');
    params.delete('pageNumber');

    setFilterOpen(false);

    navigate(
      {
        pathname: '/admin/orderlist',
        search: params.toString(),
      },
      { replace: true },
    );
  };

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

      <AdminTableToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        searchPlaceholder='Search orders...'
        onFilterClick={openFilterPanel}
        filterCount={filterCount}
        sortValue={sort}
        sortOptions={orderSortOptions}
        sortOpen={sortOpen}
        onSortToggle={() => setSortOpen((prev) => !prev)}
        onSortChange={handleSortChange}
      />

      <AdminFilterPanel
        show={filterOpen}
        onClose={() => setFilterOpen(false)}
        onReset={handleResetFilters}
        onApply={handleApplyFilters}
        filterCount={filterCount}
      >
        <div className='admin-filter-section'>
          <h4>Payment Status</h4>

          <div className='admin-filter-radio-group'>
            <label>
              <input
                type='radio'
                name='paymentStatus'
                value=''
                checked={draftPaymentStatus === ''}
                onChange={() => setDraftPaymentStatus('')}
              />
              <span>All</span>
            </label>

            <label>
              <input
                type='radio'
                name='paymentStatus'
                value='paid'
                checked={draftPaymentStatus === 'paid'}
                onChange={() => setDraftPaymentStatus('paid')}
              />
              <span>Paid</span>
            </label>

            <label>
              <input
                type='radio'
                name='paymentStatus'
                value='refunded'
                checked={draftPaymentStatus === 'refunded'}
                onChange={() => setDraftPaymentStatus('refunded')}
              />
              <span>Refunded</span>
            </label>

            <label>
              <input
                type='radio'
                name='paymentStatus'
                value='pending'
                checked={draftPaymentStatus === 'pending'}
                onChange={() => setDraftPaymentStatus('pending')}
              />
              <span>Pending</span>
            </label>
          </div>
        </div>

        <div className='admin-filter-section'>
          <h4>Payment Method</h4>

          <div className='admin-filter-radio-group'>
            <label>
              <input
                type='radio'
                name='paymentMethod'
                value=''
                checked={draftPaymentMethod === ''}
                onChange={() => setDraftPaymentMethod('')}
              />
              <span>All</span>
            </label>

            <label>
              <input
                type='radio'
                name='paymentMethod'
                value='ONLINE'
                checked={draftPaymentMethod === 'ONLINE'}
                onChange={() => setDraftPaymentMethod('ONLINE')}
              />
              <span>Online Payment</span>
            </label>

            <label>
              <input
                type='radio'
                name='paymentMethod'
                value='COD'
                checked={draftPaymentMethod === 'COD'}
                onChange={() => setDraftPaymentMethod('COD')}
              />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <div className='admin-filter-section'>
          <h4>Delivery Status</h4>

          <div className='admin-filter-radio-group'>
            <label>
              <input
                type='radio'
                name='deliveryStatus'
                value=''
                checked={draftDeliveryStatus === ''}
                onChange={() => setDraftDeliveryStatus('')}
              />
              <span>All</span>
            </label>

            <label>
              <input
                type='radio'
                name='deliveryStatus'
                value='processing'
                checked={draftDeliveryStatus === 'processing'}
                onChange={() => setDraftDeliveryStatus('processing')}
              />
              <span>Processing</span>
            </label>

            <label>
              <input
                type='radio'
                name='deliveryStatus'
                value='delivered'
                checked={draftDeliveryStatus === 'delivered'}
                onChange={() => setDraftDeliveryStatus('delivered')}
              />
              <span>Delivered</span>
            </label>
          </div>
        </div>

        <div className='admin-filter-section'>
          <h4>Date</h4>

          <div className='admin-filter-radio-group'>
            <label>
              <input
                type='radio'
                name='dateFilter'
                value='all'
                checked={draftDatePreset === 'all'}
                onChange={() => {
                  setDraftDatePreset('all');
                  setDraftDateFrom('');
                  setDraftDateTo('');
                }}
              />
              <span>All Time</span>
            </label>

            <label>
              <input
                type='radio'
                name='dateFilter'
                value='today'
                checked={draftDatePreset === 'today'}
                onChange={() => {
                  setDraftDatePreset('today');
                  setDraftDateFrom('');
                  setDraftDateTo('');
                }}
              />
              <span>Today</span>
            </label>

            <label>
              <input
                type='radio'
                name='dateFilter'
                value='7days'
                checked={draftDatePreset === '7days'}
                onChange={() => {
                  setDraftDatePreset('7days');
                  setDraftDateFrom('');
                  setDraftDateTo('');
                }}
              />
              <span>Last 7 Days</span>
            </label>

            <label>
              <input
                type='radio'
                name='dateFilter'
                value='30days'
                checked={draftDatePreset === '30days'}
                onChange={() => {
                  setDraftDatePreset('30days');
                  setDraftDateFrom('');
                  setDraftDateTo('');
                }}
              />
              <span>Last 30 Days</span>
            </label>
          </div>

          <div className='admin-filter-date-range'>
            <div>
              <label htmlFor='order-date-from'>From</label>
              <input
                id='order-date-from'
                type='date'
                value={draftDateFrom}
                onChange={(e) => {
                  setDraftDatePreset('custom');
                  setDraftDateFrom(e.target.value);
                }}
              />
            </div>

            <div>
              <label htmlFor='order-date-to'>To</label>
              <input
                id='order-date-to'
                type='date'
                value={draftDateTo}
                onChange={(e) => {
                  setDraftDatePreset('custom');
                  setDraftDateTo(e.target.value);
                }}
              />
            </div>
          </div>
        </div>
      </AdminFilterPanel>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.error || error?.data?.message || error?.error}
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
      <Paginate
        pages={data?.pages || 1}
        page={data?.page || Number(pageNumber) || 1}
        isAdmin
        adminPath='orderlist'
      />
    </div>
  );
};

export default OrderListScreen;
