import { Row, Col, Button, ButtonGroup } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useState } from 'react';
import Product from '../Components/Product';
import Loader from '../Components/Loader';
import Message from '../Components/Message';
import Paginate from '../Components/Paginate';
import BackButton from '../Components/BackButton';
import { BsGridFill, BsGrid3X3GapFill, BsList } from 'react-icons/bs';

import { useGetProductsQuery } from '../slices/productsApiSlice';

const ProductsScreen = () => {
  const [view, setView] = useState('grid4');
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

  const getColumnSizes = () => {
    switch (view) {
      case 'small':
        return {
          xs: 12, // Mobile -> 1
          md: 6, // Tablet -> 2
          lg: 4, // Desktop -> 3
        };

      case 'medium':
        return {
          xs: 6, // 2 columns
          md: 4, // 3 columns
          lg: 3, // 4 columns
        };

      case 'large':
        return {
          xs: 6, // Mobile -> 2
          md: 3, // Tablet -> 4
          lg: 2, // Desktop -> 6
        };

      default:
        return {
          xs: 6,
          md: 4,
          lg: 3,
        };
    }
  };

  const col = getColumnSizes();

  return (
    <>
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
              Browse our complete collection of handbags, clutches, wallets and
              fashion accessories.
            </p>
            <h1 className='home-title'>All Products</h1>
          </div>

          <ButtonGroup className='view-toggle'>
            <Button
              variant='light'
              active={view === 'small'}
              onClick={() => setView('small')}
            >
              <BsGridFill />
            </Button>

            <Button
              variant='light'
              active={view === 'medium'}
              onClick={() => setView('medium')}
            >
              <BsGrid3X3GapFill />
            </Button>

            <Button
              variant='light'
              className='desktop-only'
              active={view === 'large'}
              onClick={() => setView('large')}
            >
              <BsList />
            </Button>
          </ButtonGroup>
          <Row className='g-4'>
            {data.products.map((product) => (
              <Col key={product._id} sm={col.xs} md={col.md} lg={col.lg}>
                <Product product={product} />
              </Col>
            ))}
          </Row>

          <Paginate pages={data.pages} page={data.page} isProductsPage={true} />
        </>
      )}
    </>
  );
};

export default ProductsScreen;
