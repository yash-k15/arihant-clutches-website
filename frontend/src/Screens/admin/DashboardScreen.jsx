import { useState } from 'react';
import { Card, Col, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {
  BsBagCheck,
  BsCurrencyRupee,
  BsBoxSeam,
  BsClockHistory,
  BsBoxes,
  BsPeople,
  BsExclamationTriangle,
  BsPencilSquare,
  BsCheckCircle,
  BsTruck,
  BsCreditCard,
  BsCashCoin,
  BsPlusCircle,
  BsImages,
  BsShop,
} from 'react-icons/bs';

import Loader from '../../Components/Loader';
import Message from '../../Components/Message';
import SalesOverview from '../../Components/SalesOverview.jsx';
import { useGetDashboardQuery } from '../../slices/dashboardApiSlice.js';

import '../../assets/styles/components/DashboardScreen.css';

const LOW_STOCK_PER_PAGE = 5;

const DashboardScreen = () => {
  const [lowStockPage, setLowStockPage] = useState(1);

  const { data, isLoading, error } = useGetDashboardQuery();

  const overviewCards = [
    {
      title: 'Total Orders',
      value: data?.totalOrders,
      icon: BsBagCheck,
    },
    {
      title: 'Total Sales',
      value: `₹${data?.totalSales?.toLocaleString('en-IN')}`,
      icon: BsCurrencyRupee,
    },
    {
      title: 'Online Processing',
      value: data?.onlineProcessingOrders,
      icon: BsBoxSeam,
    },
    {
      title: 'COD Processing',
      value: data?.codProcessingOrders,
      icon: BsClockHistory,
    },
    {
      title: 'Total Products',
      value: data?.totalProducts,
      icon: BsBoxes,
    },
    {
      title: 'Total Customers',
      value: data?.totalCustomers,
      icon: BsPeople,
    },
    {
      title: 'Low Stock',
      value: data?.lowStockCount,
      icon: BsExclamationTriangle,
    },
    {
      title: 'Orders Delivered',
      value: data?.deliveredOrders,
      icon: BsCheckCircle,
    },
  ];

  const orderStatusCards = [
    {
      title: 'To Be Delivered',
      value: data?.toBeDelivered,
      icon: BsTruck,
      to: '/admin/orderlist?deliveryStatus=processing',
    },
    {
      title: 'Online Payment',
      value: data?.onlineProcessingOrders,
      icon: BsCreditCard,
      to: '/admin/orderlist?paymentMethod=ONLINE&deliveryStatus=processing',
    },
    {
      title: 'Cash on Delivery',
      value: data?.codProcessingOrders,
      icon: BsCashCoin,
      to: '/admin/orderlist?paymentMethod=COD&deliveryStatus=processing',
    },
    {
      title: 'Delivered',
      value: data?.deliveredOrders,
      icon: BsCheckCircle,
      to: '/admin/orderlist?deliveryStatus=delivered',
    },
  ];

  const lowStockVariants =
    data?.lowStockProducts?.flatMap((product) =>
      product.variants.map((variant) => ({
        productName: product.name,
        slug: product.slug,
        variant,
      })),
    ) || [];

  const lowStockTotalPages = Math.ceil(
    lowStockVariants.length / LOW_STOCK_PER_PAGE,
  );

  const lowStockStartIndex = (lowStockPage - 1) * LOW_STOCK_PER_PAGE;

  const paginatedLowStockVariants = lowStockVariants.slice(
    lowStockStartIndex,
    lowStockStartIndex + LOW_STOCK_PER_PAGE,
  );

  const quickActions = [
    {
      title: 'Add Product',
      icon: BsPlusCircle,
      to: '/admin/product/create',
    },
    {
      title: 'Products',
      icon: BsBoxes,
      to: '/admin/productlist',
    },
    {
      title: 'Orders',
      icon: BsBagCheck,
      to: '/admin/orderlist',
    },
    {
      title: 'Customers',
      icon: BsPeople,
      to: '/admin/userlist',
    },
    {
      title: 'Carousel',
      icon: BsImages,
      to: '/admin/carousel',
    },
    {
      title: 'View Store',
      icon: BsShop,
      to: '/',
    },
  ];

  return (
    <>
      <h1 className='admin-page-title'>Dashboard</h1>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.error || error?.data?.message || error?.error}
        </Message>
      ) : (
        <>
          {/* Overview Cards */}
          <Row className='g-4'>
            {overviewCards.map((card) => {
              const Icon = card.icon;

              return (
                <Col md={6} lg={3} key={card.title}>
                  <Card className='admin-dashboard-card'>
                    <Card.Body>
                      <div className='admin-dashboard-card-header'>
                        <Card.Title className='admin-dashboard-card-title'>
                          {card.title}
                        </Card.Title>

                        <div className='admin-dashboard-card-icon'>
                          <Icon />
                        </div>
                      </div>

                      <h2 className='admin-dashboard-card-value'>
                        {card.value}
                      </h2>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {/* Order Status */}
          <Card className='admin-dashboard-section-card'>
            <Card.Body>
              <div className='admin-dashboard-section-header'>
                <div>
                  <h2 className='admin-dashboard-section-title'>
                    Order Status
                  </h2>
                  <p className='admin-dashboard-section-subtitle'>
                    Track orders that require attention and completed deliveries
                  </p>
                </div>

                <div className='admin-dashboard-section-icon'>
                  <BsTruck />
                </div>
              </div>

              <Row className='g-4'>
                {orderStatusCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <Col md={6} lg={3} key={card.title}>
                      <Card className='admin-dashboard-card admin-dashboard-order-status-card'>
                        <Card.Body>
                          <div className='admin-dashboard-card-header'>
                            <Card.Title className='admin-dashboard-card-title'>
                              {card.title}
                            </Card.Title>

                            <div className='admin-dashboard-card-icon'>
                              <Icon />
                            </div>
                          </div>

                          <h2 className='admin-dashboard-card-value'>
                            {card.value}
                          </h2>

                          <Link
                            to={card.to}
                            className='admin-dashboard-view-orders'
                          >
                            View Orders <span aria-hidden='true'>→</span>
                          </Link>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>

          {/* Low Stock Products */}
          <Card className='admin-dashboard-section-card'>
            <Card.Body>
              <div className='admin-dashboard-section-header'>
                <div>
                  <h2 className='admin-dashboard-section-title'>
                    Low Stock Products
                  </h2>

                  <p className='admin-dashboard-section-subtitle'>
                    Products with 5 or fewer items in stock
                  </p>
                </div>

                <div className='admin-dashboard-section-icon'>
                  <BsExclamationTriangle />
                </div>
              </div>

              {lowStockVariants.length === 0 ? (
                <div className='admin-dashboard-empty-state'>
                  No low stock products found.
                </div>
              ) : (
                <>
                  <div className='admin-dashboard-table-wrapper'>
                    <Table
                      responsive
                      className='admin-dashboard-low-stock-table align-middle'
                    >
                      <thead>
                        <tr>
                          <th>PRODUCT</th>
                          <th>VARIANT</th>
                          <th>STOCK</th>
                          <th className='admin-dashboard-action-column'>
                            ACTIONS
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {paginatedLowStockVariants.map((item) => (
                          <tr key={`${item.slug}-${item.variant._id}`}>
                            <td className='admin-dashboard-product-name'>
                              {item.productName}
                            </td>

                            <td>
                              <span className='admin-dashboard-variant-badge'>
                                {item.variant.color}
                              </span>
                            </td>

                            <td>
                              <span className='admin-dashboard-stock-value'>
                                {item.variant.countInStock}
                              </span>
                            </td>

                            <td className='admin-dashboard-action-column'>
                              <Link
                                to={`/admin/product/${item.slug}/edit`}
                                className='admin-dashboard-edit-btn'
                                aria-label={`Edit ${item.productName}`}
                              >
                                <BsPencilSquare />
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  {lowStockTotalPages > 1 && (
                    <div className='admin-dashboard-pagination'>
                      {Array.from(
                        { length: lowStockTotalPages },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <button
                          key={page}
                          type='button'
                          className={`admin-dashboard-page-btn ${
                            lowStockPage === page ? 'active' : ''
                          }`}
                          onClick={() => setLowStockPage(page)}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>

          <SalesOverview />

          <Card className='admin-dashboard-section-card'>
            <Card.Body>
              <div className='admin-dashboard-section-header'>
                <div>
                  <h2 className='admin-dashboard-section-title'>
                    Quick Actions
                  </h2>

                  <p className='admin-dashboard-section-subtitle'>
                    Quick access to commonly used admin tasks
                  </p>
                </div>
              </div>

              <Row className='g-3'>
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <Col key={action.title} xs={12} sm={6} lg={4}>
                      <Link
                        to={action.to}
                        className='admin-dashboard-quick-action'
                      >
                        <span className='admin-dashboard-quick-action-icon'>
                          <Icon />
                        </span>

                        <span className='admin-dashboard-quick-action-title'>
                          {action.title}
                        </span>

                        <span className='admin-dashboard-quick-action-arrow'>
                          →
                        </span>
                      </Link>
                    </Col>
                  );
                })}
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
    </>
  );
};

export default DashboardScreen;
