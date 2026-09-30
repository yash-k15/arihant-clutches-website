import { Link } from 'react-router-dom';
import { Carousel, Image } from 'react-bootstrap';
import Loader from './Loader';
import Message from './Message';
import { useGetCarouselQuery } from '../slices/carouselApiSlice';
import { getCloudinaryImage } from '../utils/cloudinary';

import '../assets/styles/components/ProductCarousel.css';

const ProductCarousel = () => {
  const { data: carousel, isLoading, error } = useGetCarouselQuery();

  return isLoading ? (
    <Loader />
  ) : error ? (
    <Message variant='danger'>
      {error?.data?.error || error?.data?.message || error?.message}
    </Message>
  ) : !carousel?.items?.length ? null : (
    <Carousel pause='hover' className='hero-carousel mb-5'>
      {carousel.items.map((item) => {
        const product = item.product;

        const variant = product.variants.find(
          (variant) => variant._id.toString() === item.variantId.toString(),
        );
        return (
          <Carousel.Item key={`${product._id}-${item.variantId}`}>
            <Link to={`/products/${product.slug}`}>
              <div className='hero-slide'>
                <Image
                  src={getCloudinaryImage(
                    variant?.images[0],
                    'w_1600,f_auto,q_auto',
                  )}
                  alt={product.name}
                  fluid
                  className='hero-image'
                />
                <div className='hero-overlay'></div>
                <Carousel.Caption className='hero-caption'>
                  <h2 className='hero-title'>{product.name}</h2>
                  <p className='hero-price'>Starting at ₹{variant?.price}</p>
                </Carousel.Caption>
              </div>
            </Link>
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};

export default ProductCarousel;
