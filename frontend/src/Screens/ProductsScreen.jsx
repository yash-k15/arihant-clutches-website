import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

import Product from '../Components/Product';
import Loader from '../Components/Loader';
import Message from '../Components/Message';
import Paginate from '../Components/Paginate';
import BackButton from '../Components/BackButton';

import { useGetProductsQuery } from '../slices/productsApiSlice';

const ProductsScreen = () => {
  const { pageNumber, keyword } = useParams();

  const { data, isLoading, error } = useGetProductsQuery({
    keyword,
    pageNumber,
  });

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

          <Row className='g-4'>
            {data.products.map((product) => (
              <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
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
