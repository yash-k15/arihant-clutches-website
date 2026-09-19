import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Product from '../Components/Product';
import { useGetProductsQuery } from '../slices/productsApiSlice.js';
import Loader from '../Components/Loader.jsx';
import Message from '../Components/Message.jsx';
import ProductCarousel from '../Components/ProductCarousel.jsx';

import '../assets/styles/components/HomeScreen.css';

const HomeScreen = () => {
  const { pageNumber, keyword } = useParams();
  const { data, isLoading, error } = useGetProductsQuery({
    home: true,
    keyword,
    pageNumber,
  });

  return (
    <>
      <ProductCarousel />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <div className='home-header'>
            <p className='home-subtitle'>
              Discover premium handbags, clutches & timeless fashion
              accessories.
            </p>
            <h1 className='home-title'>Explore Our Collection</h1>
          </div>
          <Row className='g-4'>
            {data.products.map((product) => (
              <Col key={product._id} xs={6} md={4} lg={3}>
                <Product product={product} />
              </Col>
            ))}
          </Row>
          <div className='view-all-container'>
            <Link to='/products' className='view-all-btn'>
              View All Products
            </Link>
          </div>
        </>
      )}
    </>
  );
};

export default HomeScreen;
