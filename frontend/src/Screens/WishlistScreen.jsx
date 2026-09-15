import { Row, Col } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Loader from '../Components/Loader';
import Message from '../Components/Message';
import { BsX } from 'react-icons/bs';
import { IoShareOutline, IoCloseSharp } from 'react-icons/io5';
import { toast } from 'react-toastify';

import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} from '../slices/wishlistApiSlice.js';

import Paginate from '../Components/Paginate.jsx';

import '../assets/styles/components/WishlistScreen.css';

const WishlistScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const {
    data: wishlist,
    isLoading,
    error,
  } = useGetWishlistQuery(undefined, {
    skip: !userInfo || userInfo.isAdmin,
  });

  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const [clearWishlist, { isLoading: isClearing }] = useClearWishlistMutation();

  const wishlistItems = wishlist?.items || [];

  const pages = Math.ceil(wishlistItems.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const paginatedWishlistItems = wishlistItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  useEffect(() => {
    if (pages > 0 && page > pages) {
      setPage(pages);
    }
  }, [pages, page]);

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <Message variant='danger'>{error?.data?.message || error.error}</Message>
    );
  }

  const removeWishlistHandler = async (productId, variantId) => {
    try {
      await removeFromWishlist({
        productId,
        variantId,
      }).unwrap();

      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to remove from wishlist');
    }
  };

  const clearWishlistHandler = async () => {
    try {
      await clearWishlist().unwrap();

      toast.success('Wishlist cleared');
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to clear wishlist');
    }
  };

  return (
    <>
      <div className='wishlist-page-header'>
        <h1 className='wishlist-title'>Wishlist</h1>

        <p className='wishlist-subtitle'>
          Your saved favourites, all in one place.
        </p>

        {wishlistItems.length > 0 && (
          <div className='wishlist-actions'>
            <button
              type='button'
              className='wishlist-action-btn'
              onClick={() => {}}
            >
              <IoShareOutline />
              <span>Share Wishlist</span>
            </button>

            <span className='wishlist-action-divider' />

            <button
              type='button'
              className='wishlist-action-btn'
              onClick={clearWishlistHandler}
              disabled={isClearing}
            >
              <IoCloseSharp />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <Message>Your wishlist is empty.</Message>
      ) : (
        <>
          <Row className='g-4 wishlist-grid'>
            {paginatedWishlistItems.map((item) => {
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
                  <div className='wishlist-card'>
                    <div className='wishlist-card-image'>
                      <button
                        type='button'
                        className='wishlist-card-remove'
                        onClick={() =>
                          removeWishlistHandler(product._id, variant._id)
                        }
                        disabled={isRemoving}
                        aria-label='Remove from wishlist'
                      >
                        <BsX />
                      </button>

                      <img
                        src={variant.images?.[0] || product.image}
                        alt={product.name}
                      />
                    </div>

                    <div className='wishlist-card-body'>
                      <h3>{product.name}</h3>

                      <p className='wishlist-card-variant'>{variant.color}</p>

                      <p className='wishlist-card-price'>
                        ₹{variant.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </Col>
              );
            })}
          </Row>

          <Paginate
            pages={pages}
            page={page}
            isClientSide
            onPageChange={setPage}
          />
        </>
      )}
    </>
  );
};

export default WishlistScreen;
