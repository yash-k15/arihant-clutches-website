import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { getCloudinaryImage } from '../utils/cloudinary';

const Product = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

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
              selectedVariant?.images[0],
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

        <Card.Text as='div' className='product-color-options'>
          {product.variants.map((variant, index) => (
            <button
              key={index}
              type='button'
              className={`product-color-option ${
                selectedVariant.color === variant.color ? 'active' : ''
              }`}
              onClick={() => setSelectedVariant(variant)}
            >
              {variant.color}
            </button>
          ))}
        </Card.Text>

        <Card.Text as='div'>
          <Rating
            value={product.rating}
            text={`${product.numReviews} reviews`}
          />
        </Card.Text>

        <Card.Text as='h5' className='product-price pt-2 mt-auto'>
          ₹{selectedVariant?.price}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
