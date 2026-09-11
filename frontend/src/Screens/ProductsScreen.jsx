import { Row, Col } from 'react-bootstrap';
import { useParams, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Product from '../Components/Product';
import Loader from '../Components/Loader';
import Message from '../Components/Message';
import Paginate from '../Components/Paginate';
import {
  BsGridFill,
  BsGrid3X3GapFill,
  BsGrid3X3,
  BsFilter,
  BsChevronDown,
} from 'react-icons/bs';

import { useGetProductsQuery } from '../slices/productsApiSlice';

import '../assets/styles/components/ProductsScreen.css';

const ProductsScreen = () => {
  const [view, setView] = useState('medium');

  const { pageNumber, keyword, category } = useParams();

  const location = useLocation();

  const isNewArrivals = location.pathname.startsWith('/products/new-arrivals');
  const isBestSellers = location.pathname.startsWith('/products/best-sellers');
  const isFeatured = location.pathname.startsWith('/products/featured');

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
    category,
    isNewArrival: isNewArrivals,
    isBestSeller: isBestSellers,
    isFeatured,
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
          <div className='products-toolbar'>
            <div className='products-view-toggle'>
              <button
                type='button'
                className={`products-view-btn ${
                  view === 'small' ? 'active' : ''
                }`}
                onClick={() => setView('small')}
                aria-label='3 products per row'
              >
                <BsGridFill />
              </button>

              <button
                type='button'
                className={`products-view-btn ${
                  view === 'medium' ? 'active' : ''
                }`}
                onClick={() => setView('medium')}
                aria-label='4 products per row'
              >
                <BsGrid3X3GapFill />
              </button>

              <button
                type='button'
                className={`products-view-btn products-view-large ${
                  view === 'large' ? 'active' : ''
                }`}
                onClick={() => setView('large')}
                aria-label='6 products per row'
              >
                <BsGrid3X3 />
              </button>
            </div>

            <div className='products-toolbar-actions'>
              <button type='button' className='products-filter-btn'>
                <BsFilter />
                <span>Filter</span>
              </button>

              <div className='products-sort'>
                <button type='button' className='products-sort-btn'>
                  <span>Sort By</span>
                  <BsChevronDown />
                </button>
              </div>
            </div>
          </div>
          <Row className='g-4'>
            {data.products.map((product) => (
              <Col key={product._id} xs={col.xs} md={col.md} lg={col.lg}>
                <Product product={product} />
              </Col>
            ))}
          </Row>

          <Paginate
            pages={data.pages}
            page={data.page}
            collection={
              isNewArrivals
                ? 'new-arrivals'
                : isBestSellers
                  ? 'best-sellers'
                  : isFeatured
                    ? 'featured'
                    : ''
            }
            category={category}
          />
        </>
      )}
    </>
  );
};

export default ProductsScreen;
