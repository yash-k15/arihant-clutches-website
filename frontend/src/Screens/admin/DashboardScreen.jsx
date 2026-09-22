import { Card, Col, Row } from 'react-bootstrap';
import {
  BsBagCheck,
  BsCurrencyRupee,
  BsBoxSeam,
  BsClockHistory,
  BsBoxes,
  BsPeople,
  BsExclamationTriangle,
} from 'react-icons/bs';
import Loader from '../../Components/Loader';
import Message from '../../Components/Message';
import { useGetDashboardQuery } from '../../slices/dashboardApiSlice.js';

import '../../assets/styles/components/DashboardScreen.css';

const DashboardScreen = () => {
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
      title: 'Processing Orders',
      value: data?.processingOrders,
      icon: BsBoxSeam,
    },
    {
      title: 'Pending Payment',
      value: data?.pendingPayment,
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
  ];

  return (
    <>
      <h1 className='admin-page-title'>Dashboard</h1>

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
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

                    <h2 className='admin-dashboard-card-value'>{card.value}</h2>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default DashboardScreen;
