import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { getCloudinaryImage } from '../utils/cloudinary';

const Product = ({ product }) => {
  console.log('original:', product.variants[0]?.images[0]);

  console.log(
    'transformed:',
    getCloudinaryImage(
      product.variants[0]?.images[0],
      'w_400,h_400,c_fill,f_auto,q_auto',
    ),
  );
  return (
    <Card className='product-card h-100'>
      <Link to={`/products/${product.slug}`}>
        <div className='product-image-wrapper'>
          <div className='product-badges'>
            {product.isNewArrival && <span className='badge-new'>New</span>}
            {product.isBestSeller && (
              <span className='badge-best'>Bestseller</span>
            )}
          </div>
          <Card.Img
            src={getCloudinaryImage(
              product.variants[0]?.images[0],
              'w_400,h_400,c_fill,f_auto,q_auto',
            )}
            variant='top'
            className='product-image'
          />
        </div>
      </Link>

      <Card.Body className='d-flex flex-column'>
        <Link to={`/products/${product.slug}`}>
          <Card.Title as='div' className='product-title'>
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h5' className='product-price pt-2 mt-auto'>
          ₹{product.variants[0]?.price}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
