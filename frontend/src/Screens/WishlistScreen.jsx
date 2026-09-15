import { Row, Col } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import Loader from '../Components/Loader';
import Message from '../Components/Message';
import { BsX } from 'react-icons/bs';
import { IoShareOutline, IoCloseSharp } from 'react-icons/io5';
import { toast } from 'react-toastify';

import {
  getGuestWishlist,
  removeGuestWishlistItem,
  clearGuestWishlist,
} from '../utils/wishlistUtils.js';

import {
  useGetWishlistQuery,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
  useGetGuestWishlistProductsMutation,
} from '../slices/wishlistApiSlice.js';

import Paginate from '../Components/Paginate.jsx';

import '../assets/styles/components/WishlistScreen.css';

const WishlistScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [page, setPage] = useState(1);

  const [guestWishlist, setGuestWishlist] = useState([]);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState(null);

  const guestWishlistLoaded = useRef(false);

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

  const [getGuestWishlistProducts] = useGetGuestWishlistProductsMutation();

  const wishlistItems = userInfo ? wishlist?.items || [] : guestWishlist;

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

  useEffect(() => {
    if (userInfo || guestWishlistLoaded.current) {
      return;
    }

    guestWishlistLoaded.current = true;

    const loadGuestWishlist = async () => {
      const guestItems = getGuestWishlist();

      if (guestItems.length === 0) {
        setGuestWishlist([]);
        return;
      }

      setIsGuestLoading(true);
      setGuestError(null);

      try {
        const productIds = [
          ...new Set(guestItems.map((item) => item.productId)),
        ];

        const products = await getGuestWishlistProducts(productIds).unwrap();

        const productMap = new Map(
          products.map((product) => [String(product._id), product]),
        );

        const wishlistItems = guestItems
          .map((item) => {
            const product = productMap.get(String(item.productId));

            if (!product) {
              return null;
            }

            return {
              product,
              variant: item.variantId,
            };
          })
          .filter(Boolean);

        setGuestWishlist(wishlistItems);
      } catch (error) {
        console.error('Failed to load guest wishlist:', error);

        setGuestError(error?.data?.message || 'Unable to load wishlist');
      } finally {
        setIsGuestLoading(false);
      }
    };

    loadGuestWishlist();
  }, [userInfo, getGuestWishlistProducts]);

  if (isLoading || isGuestLoading) {
    return <Loader />;
  }

  if (error || guestError) {
    return (
      <Message variant='danger'>
        {error?.data?.message || error?.error || guestError}
      </Message>
    );
  }

  const removeWishlistHandler = async (productId, variantId) => {
    if (!userInfo) {
      removeGuestWishlistItem(productId, variantId);

      setGuestWishlist((currentWishlist) =>
        currentWishlist.filter(
          (item) =>
            !(
              String(item.product._id) === String(productId) &&
              String(item.variant) === String(variantId)
            ),
        ),
      );

      toast.success('Removed from wishlist');

      return;
    }

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
    if (!userInfo) {
      clearGuestWishlist();
      setGuestWishlist([]);
      setPage(1);

      toast.success('Wishlist cleared');

      return;
    }

    try {
      await clearWishlist().unwrap();

      setPage(1);

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
