import { Row, Col } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

import Loader from '../Components/Loader';
import Message from '../Components/Message';
import { BsX, BsHeart } from 'react-icons/bs';
import { IoShareOutline, IoCloseSharp } from 'react-icons/io5';
import { toast } from 'sonner';

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
  useCreateWishlistShareMutation,
  useCreateGuestWishlistShareMutation,
} from '../slices/wishlistApiSlice.js';

import Paginate from '../Components/Paginate.jsx';
import { useAuthModal } from '../Components/AuthModalContext.jsx';

import '../assets/styles/components/WishlistScreen.css';

const WishlistScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { openAuth } = useAuthModal();
  const [page, setPage] = useState(1);

  const [guestWishlist, setGuestWishlist] = useState([]);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [guestError, setGuestError] = useState(null);

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

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

  const [createWishlistShare] = useCreateWishlistShareMutation();

  const [createGuestWishlistShare] = useCreateGuestWishlistShareMutation();

  const wishlistItems = userInfo ? wishlist?.items || [] : guestWishlist;

  const pages = Math.ceil(wishlistItems.length / ITEMS_PER_PAGE);

  const startIndex = (page - 1) * ITEMS_PER_PAGE;

  const paginatedWishlistItems = wishlistItems.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  const shareWishlistHandler = async () => {
    try {
      let shareToken;

      if (userInfo) {
        const response = await createWishlistShare().unwrap();
        shareToken = response.shareToken;
      } else {
        const guestItems = getGuestWishlist();

        const response = await createGuestWishlistShare(guestItems).unwrap();

        shareToken = response.shareToken;
      }

      const shareUrl = `${window.location.origin}/wishlist/${shareToken}`;

      await navigator.clipboard.writeText(shareUrl);

      setIsLinkCopied(true);
      toast.success('Wishlist link copied');

      setTimeout(() => {
        setIsLinkCopied(false);
      }, 3000);
    } catch (error) {
      toast.error(error?.data?.message || 'Unable to share wishlist');
    }
  };

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
          {userInfo ? (
            'Your saved favourites, all in one place.'
          ) : (
            <>
              To save your wishlist please{' '}
              <button
                type='button'
                className='wishlist-auth-link'
                onClick={() => openAuth()}
              >
                login
              </button>{' '}
              or{' '}
              <button
                type='button'
                className='wishlist-auth-link'
                onClick={() => openAuth()}
              >
                sign up
              </button>
              .
            </>
          )}
        </p>

        {wishlistItems.length > 0 && (
          <div className='wishlist-actions'>
            <button
              type='button'
              className='wishlist-action-btn'
              onClick={shareWishlistHandler}
              disabled={isLinkCopied}
            >
              <IoShareOutline />
              {isLinkCopied ? 'Link Copied' : 'Share Wishlist'}
            </button>

            <span className='wishlist-action-divider' />

            <button
              type='button'
              className='wishlist-action-btn'
              onClick={() => setShowClearConfirmation(true)}
              disabled={isClearing}
            >
              <IoCloseSharp />
              <span>Clear Wishlist</span>
            </button>
          </div>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className='wishlist-empty-state'>
          <BsHeart className='wishlist-empty-icon' />

          <h2>Your Wishlist is Empty</h2>

          <p>
            Save your favourite products here and come back to them anytime.
          </p>

          <Link to='/products' className='wishlist-empty-btn'>
            Explore Products
          </Link>
        </div>
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

                      <Link
                        to={`/products/${product.slug}`}
                        state={{ variantId: variant._id }}
                        className='wishlist-card-link'
                      >
                        <img
                          src={variant.images?.[0] || product.image}
                          alt={product.name}
                        />
                      </Link>
                    </div>

                    <Link
                      to={`/products/${product.slug}`}
                      state={{ variantId: variant._id }}
                      className='wishlist-card-link wishlist-card-body'
                    >
                      <h3>{product.name}</h3>

                      <p className='wishlist-card-variant'>{variant.color}</p>

                      <p className='wishlist-card-price'>
                        ₹{variant.price.toLocaleString('en-IN')}
                      </p>
                    </Link>
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

      {showClearConfirmation && (
        <div
          className='wishlist-confirmation-backdrop'
          onClick={() => {
            if (!isClearing) {
              setShowClearConfirmation(false);
            }
          }}
        >
          <div
            className='wishlist-confirmation-modal'
            role='dialog'
            aria-modal='true'
            aria-labelledby='clear-wishlist-title'
            onClick={(event) => event.stopPropagation()}
          >
            <div className='wishlist-confirmation-icon'>
              <IoCloseSharp />
            </div>

            <h2 id='clear-wishlist-title'>Clear Wishlist?</h2>

            <p>
              Are you sure you want to remove all items from your wishlist? This
              action cannot be undone.
            </p>

            <div className='wishlist-confirmation-actions'>
              <button
                type='button'
                className='wishlist-confirmation-cancel'
                onClick={() => setShowClearConfirmation(false)}
                disabled={isClearing}
              >
                Cancel
              </button>

              <button
                type='button'
                className='wishlist-confirmation-clear'
                onClick={async () => {
                  await clearWishlistHandler();
                  setShowClearConfirmation(false);
                }}
                disabled={isClearing}
              >
                {isClearing ? 'Clearing...' : 'Clear Wishlist'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WishlistScreen;
