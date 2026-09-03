import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from './Loader';
import Message from './Message';
import { useGetTopProductsQuery } from '../slices/productsApiSlice';
import { getCloudinaryImage } from '../utils/cloudinary';

import '../assets/styles/components/ProductCarousel.css';

const ProductCarousel = () => {
  const { data: products, isLoading, error } = useGetTopProductsQuery();

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>{error?.data?.message || error.error}</Message>
  ) : (
    <Carousel pause='hover' className='hero-carousel mb-5'>
      {products.map((product) => (
        <Carousel.Item key={product._id}>
          <Link to={`/products/${product.slug}`}>
            <div className='hero-slide'>
              <Image
                src={getCloudinaryImage(
                  product.variants[0]?.images[0],
                  'w_1600,f_auto,q_auto',
                )}
                alt={product.name}
                fluid
                className='hero-image'
              />
              <div className='hero-overlay'></div>
              <Carousel.Caption className='hero-caption'>
                <h2 className='hero-title'>{product.name}</h2>
                <p className='hero-price'>
                  Starting at ₹{product.variants[0]?.price}
                </p>
              </Carousel.Caption>
            </div>
          </Link>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default ProductCarousel;
