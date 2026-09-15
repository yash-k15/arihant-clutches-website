import { Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { useGetSharedWishlistQuery } from '../slices/wishlistApiSlice.js';

import Loader from '../Components/Loader';
import Message from '../Components/Message';

import '../assets/styles/components/SharedWishlistScreen.css';

const SharedWishlistScreen = () => {
  const { shareToken } = useParams();

  const {
    data: wishlist,
    isLoading,
    error,
  } = useGetSharedWishlistQuery(shareToken);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant='danger'>{error?.data?.message || error.error}</Message>
    );
  }

  const wishlistItems = wishlist?.items || [];

  return (
    <>
      <div className='shared-wishlist-header'>
        <h1 className='shared-wishlist-title'>Shared Wishlist</h1>

        <p className='shared-wishlist-subtitle'>
          Someone shared their favourites with you.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <Message>This wishlist is empty.</Message>
      ) : (
        <Row className='g-4 shared-wishlist-grid'>
          {wishlistItems.map((item) => {
            const product = item.product;

            if (!product) {
              return null;
            }

            const variant = product.variants?.find(
              (productVariant) =>
                String(productVariant._id) === String(item.variant),
            );

            if (!variant) {
              return null;
            }

            return (
              <Col key={`${product._id}-${variant._id}`} xs={6} md={3}>
                <div className='shared-wishlist-card'>
                  <div className='shared-wishlist-card-image'>
                    <img
                      src={variant.images?.[0] || product.image}
                      alt={product.name}
                    />
                  </div>

                  <div className='shared-wishlist-card-body'>
                    <h3>{product.name}</h3>

                    <p className='shared-wishlist-card-variant'>
                      {variant.color}
                    </p>

                    <p className='shared-wishlist-card-price'>
                      ₹{variant.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </Col>
            );
          })}
        </Row>
      )}
    </>
  );
};

export default SharedWishlistScreen;
