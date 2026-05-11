import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Rating from './Rating';

const Product = ({ product }) => {
  return (
    <Card className='product-card h-100'>
      <Link to={`/products/${product.slug}`}>
        <div className='product-image-wrapper'>
          <Card.Img
            src={product.image}
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
          ₹{product.price}
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default Product;
