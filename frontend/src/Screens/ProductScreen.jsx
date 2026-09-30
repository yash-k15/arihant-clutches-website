import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
  Link,
} from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { Form, Image, Button, Modal } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import Rating from '../Components/Rating';
import Loader from '../Components/Loader.jsx';
import Message from '../Components/Message.jsx';
import Meta from '../Components/Meta.jsx';
import { useCartDrawer } from '../Components/CartDrawerContext.jsx';
import { useAuthModal } from '../Components/AuthModalContext.jsx';

import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice.js';

import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../slices/wishlistApiSlice.js';

import {
  getGuestWishlist,
  addGuestWishlistItem,
  removeGuestWishlistItem,
} from '../utils/wishlistUtils.js';

import { addToCart } from '../slices/cartSlice.js';

import { FaEdit, FaRegHeart, FaHeart, FaRegPlayCircle } from 'react-icons/fa';
import { IoShareOutline, IoAddOutline } from 'react-icons/io5';

import { getCloudinaryImage } from '../utils/cloudinary.js';

import '../assets/styles/components/ProductScreen.css';

const createColorSlug = (color) => {
  return color
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const ProductScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();

  const { openCart } = useCartDrawer();
  const { openAuth } = useAuthModal();

  const [selectedImage, setSelectedImage] = useState('');
  const [isVideoSelected, setIsVideoSelected] = useState(false);
  const [isMainVideoPlaying, setIsMainVideoPlaying] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);
  const [isModalVideoPlaying, setIsModalVideoPlaying] = useState(false);

  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductDetailsQuery(slug);

  const [createReview, { isLoading: loadingReview }] =
    useCreateReviewMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const { data: wishlist } = useGetWishlistQuery(undefined, {
    skip: !userInfo || userInfo.isAdmin,
  });

  const [addToWishlist, { isLoading: isAddingToWishlist }] =
    useAddToWishlistMutation();

  const [removeFromWishlist, { isLoading: isRemovingFromWishlist }] =
    useRemoveFromWishlistMutation();

  const [isGuestWishlisted, setIsGuestWishlisted] = useState(false);

  const wishlistLoading = isAddingToWishlist || isRemovingFromWishlist;

  /*
   * --------------------------------------------------
   * Select variant
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!product?.variants?.length) {
      return;
    }

    const requestedColor = searchParams.get('color');
    const requestedVariantId = location.state?.variantId;

    const variantFromColor = requestedColor
      ? product.variants.find(
          (variant) => createColorSlug(variant.color) === requestedColor,
        )
      : null;

    const variantFromNavigation = requestedVariantId
      ? product.variants.find((variant) => variant._id === requestedVariantId)
      : null;

    const variantToSelect =
      variantFromColor || variantFromNavigation || product.variants[0];

    setSelectedVariant(variantToSelect);

    if (variantToSelect.images?.length > 0) {
      setSelectedImage(variantToSelect.images[0]);
    }
  }, [product, location.state, searchParams]);

  useEffect(() => {
    if (!product || !selectedVariant || userInfo) return;

    setIsGuestWishlisted(
      getGuestWishlist().some(
        (item) =>
          item.productId === product._id &&
          item.variantId === selectedVariant._id,
      ),
    );
  }, [product, selectedVariant, userInfo]);

  /*
   * --------------------------------------------------
   * Images for selected variant
   * --------------------------------------------------
   */

  const images = useMemo(
    () => selectedVariant?.images || [],
    [selectedVariant],
  );

  /*
   * --------------------------------------------------
   * Format price
   * --------------------------------------------------
   */

  const formatPrice = (price) => {
    if (price === undefined || price === null) {
      return '';
    }

    return Number(price).toLocaleString('en-IN');
  };

  const isCustomerWishlisted =
    userInfo && !userInfo.isAdmin
      ? wishlist?.items?.some(
          (item) =>
            String(item.product?._id) === String(product?._id) &&
            String(item.variant) === String(selectedVariant?._id),
        )
      : false;

  const isWishlisted = userInfo ? isCustomerWishlisted : isGuestWishlisted;

  /*
   * --------------------------------------------------
   * Change variant
   * --------------------------------------------------
   */

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);
    setIsVideoSelected(false);
    setIsMainVideoPlaying(false);

    if (variant.images?.length > 0) {
      setSelectedImage(variant.images[0]);
    }

    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);

        nextParams.set('color', createColorSlug(variant.color));

        return nextParams;
      },
      { replace: true },
    );
  };

  /*
   * --------------------------------------------------
   * Add to cart
   * --------------------------------------------------
   */

  const addToCartHandler = () => {
    if (!product || !selectedVariant) return;

    dispatch(
      addToCart({
        ...product,
        slug: product.slug,
        variantId: selectedVariant._id,
        color: selectedVariant.color,
        name: product.name,
        image: selectedVariant.images?.[0],
        price: selectedVariant.price,
        countInStock: selectedVariant.countInStock,
        qty: 1,
      }),
    );

    openCart();
  };

  const wishlistHandler = async () => {
    if (!product || !selectedVariant || userInfo?.isAdmin) return;

    const productId = product._id;
    const variantId = selectedVariant._id;

    try {
      if (!userInfo) {
        if (isGuestWishlisted) {
          removeGuestWishlistItem(productId, variantId);
          setIsGuestWishlisted(false);
          toast.success('Removed from wishlist');
        } else {
          addGuestWishlistItem(productId, variantId);
          setIsGuestWishlisted(true);
          toast.success('Added to wishlist');
        }

        return;
      }

      if (isCustomerWishlisted) {
        await removeFromWishlist({
          productId,
          variantId,
        }).unwrap();

        toast.success('Removed from wishlist');
      } else {
        await addToWishlist({
          productId,
          variantId,
        }).unwrap();

        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
          'Unable to update your wishlist',
      );
    }
  };

  const shareProductHandler = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);

      setIsLinkCopied(true);

      setTimeout(() => {
        setIsLinkCopied(false);
      }, 3000);
    } catch (error) {
      console.error('Failed to copy product link:', error);
      toast.error('Unable to copy product link');
    }
  };

  /*
   * --------------------------------------------------
   * Image navigation
   * --------------------------------------------------
   */

  const mediaCount = images.length + (product?.video?.url ? 1 : 0);

  const currentMediaIndex = isVideoSelected
    ? images.length
    : images.indexOf(selectedImage);

  const showNextMedia = useCallback(() => {
    if (!mediaCount) return;

    const nextIndex =
      currentMediaIndex >= mediaCount - 1 ? 0 : currentMediaIndex + 1;

    if (product?.video?.url && nextIndex === images.length) {
      setIsVideoSelected(true);
    } else {
      setIsVideoSelected(false);
      setIsMainVideoPlaying(false);
      setSelectedImage(images[nextIndex]);
    }
  }, [images, mediaCount, currentMediaIndex, product?.video?.url]);

  const showPreviousMedia = useCallback(() => {
    if (!mediaCount) return;

    const previousIndex =
      currentMediaIndex <= 0 ? mediaCount - 1 : currentMediaIndex - 1;

    if (product?.video?.url && previousIndex === images.length) {
      setIsVideoSelected(true);
    } else {
      setIsVideoSelected(false);
      setIsMainVideoPlaying(false);
      setSelectedImage(images[previousIndex]);
    }
  }, [images, mediaCount, currentMediaIndex, product?.video?.url]);

  /*
   * --------------------------------------------------
   * Image modal
   * --------------------------------------------------
   */

  const openImageModal = () => {
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setIsModalVideoPlaying(false);
  };

  /*
   * --------------------------------------------------
   * Keyboard navigation
   * --------------------------------------------------
   */

  useEffect(() => {
    if (!showImageModal) return;

    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        showNextMedia();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousMedia();
      }

      if (event.key === 'Escape') {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal, showNextMedia, showPreviousMedia]);

  /*
   * --------------------------------------------------
   * Review submission
   * --------------------------------------------------
   */

  const submitHandler = async (event) => {
    event.preventDefault();

    if (!rating) {
      toast.warning('Please select a rating');
      return;
    }

    if (!comment.trim()) {
      toast.warning('Please enter a review');
      return;
    }

    try {
      await createReview({
        productSlug: product.slug,
        rating,
        comment: comment.trim(),
      }).unwrap();

      toast.success('Review submitted successfully');

      setRating(0);
      setComment('');

      refetch();
    } catch (err) {
      toast.error(err?.data?.error || 'Unable to submit your review');
    }
  };

  return (
    <div className='product-detail-page'>
      {/* ============================================== */}
      {/* BREADCRUMB / ADMIN                            */}
      {/* ============================================== */}

      <div className='product-detail-topbar'>
        {product && (
          <div className='product-breadcrumb'>
            <Link to='/'>Home</Link>

            <span>/</span>

            <Link to='/products'>Products</Link>

            <span>/</span>

            <span className='current'>{product.name}</span>
          </div>
        )}

        {userInfo?.isAdmin && product && (
          <Button
            variant='light'
            className='product-edit-btn'
            onClick={() => navigate(`/admin/product/${product.slug}/edit`)}
          >
            <FaEdit />
            <span>Edit Product</span>
          </Button>
        )}
      </div>

      {/* ============================================== */}
      {/* LOADING / ERROR                                */}
      {/* ============================================== */}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.error || error?.data?.message || error?.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} />

          {/* ========================================== */}
          {/* PRODUCT AREA                               */}
          {/* ========================================== */}

          <section className='product-detail-layout'>
            {/* ======================================== */}
            {/* GALLERY                                  */}
            {/* ======================================== */}

            <div className='product-gallery'>
              <div className='product-gallery-thumbnails'>
                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type='button'
                    className={`product-gallery-thumbnail ${
                      selectedImage === image ? 'active' : ''
                    }`}
                    onClick={() => {
                      setIsVideoSelected(false);
                      setIsMainVideoPlaying(false);
                      setSelectedImage(image);
                    }}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <Image
                      src={getCloudinaryImage(image, 'w_300,f_auto,q_auto')}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}

                {product.video?.url && (
                  <button
                    type='button'
                    className={`product-gallery-thumbnail product-gallery-video-thumbnail ${
                      isVideoSelected ? 'active' : ''
                    }`}
                    onClick={() => {
                      setIsVideoSelected(true);
                    }}
                    aria-label='View product video'
                  >
                    <div className='product-gallery-video-preview'>
                      <video
                        src={product.video.url}
                        muted
                        preload='metadata'
                        playsInline
                      />

                      <span className='product-gallery-video-play'>
                        <FaRegPlayCircle />
                      </span>
                    </div>
                  </button>
                )}
              </div>

              <div className='product-main-image-wrapper'>
                {isVideoSelected && product.video?.url ? (
                  <div className='product-main-video-wrapper'>
                    <video
                      src={product.video.url}
                      controls
                      playsInline
                      preload='metadata'
                      className='product-main-video'
                      onPlay={() => setIsMainVideoPlaying(true)}
                      onPause={() => setIsMainVideoPlaying(false)}
                    />

                    {!isMainVideoPlaying && (
                      <button
                        type='button'
                        className='product-main-video-play'
                        onClick={(event) => {
                          event.stopPropagation();

                          const video =
                            event.currentTarget.previousElementSibling;

                          video.play();
                        }}
                        aria-label='Play product video'
                      >
                        <FaRegPlayCircle />
                      </button>
                    )}
                  </div>
                ) : (
                  selectedImage && (
                    <Image
                      src={getCloudinaryImage(
                        selectedImage,
                        'w_1200,f_auto,q_auto',
                      )}
                      alt={product.name}
                      className='product-main-image'
                      onClick={openImageModal}
                    />
                  )
                )}
              </div>
            </div>

            {/* ======================================== */}
            {/* PRODUCT INFORMATION                       */}
            {/* ======================================== */}

            <div className='product-information'>
              {/* -------------------------------------- */}
              {/* Product header                          */}
              {/* -------------------------------------- */}

              <div className='product-info-header'>
                <h1 className='product-name'>{product.name}</h1>

                <div className='product-rating'>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </div>

                <div className='product-detail-price'>
                  ₹
                  {formatPrice(
                    selectedVariant?.price ?? product.variants?.[0]?.price,
                  )}
                </div>
              </div>

              {/* -------------------------------------- */}
              {/* Variants                                */}
              {/* -------------------------------------- */}

              {product.variants?.length > 0 && (
                <div className='product-detail-section variant-selector'>
                  <div className='variant-section-title'>Color Options</div>

                  <div className='variant-options'>
                    {product.variants.map((variant) => (
                      <button
                        key={variant._id}
                        type='button'
                        className={`variant-option ${
                          selectedVariant?._id === variant._id ? 'active' : ''
                        }`}
                        onClick={() => handleVariantChange(variant)}
                        aria-label={`Select ${variant.color}`}
                      >
                        <span className='variant-option-image'>
                          {variant.images?.[0] && (
                            <Image
                              src={getCloudinaryImage(
                                variant.images[0],
                                'w_250,f_auto,q_auto',
                              )}
                              alt={variant.color}
                            />
                          )}
                        </span>

                        <span className='variant-option-color'>
                          {variant.color}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* -------------------------------------- */}
              {/* Purchase                               */}
              {/* -------------------------------------- */}

              <div className='purchase-section'>
                <div className='purchase-status-row'>
                  {selectedVariant?.countInStock > 0 ? (
                    <span className='purchase-stock in-stock'>In Stock</span>
                  ) : (
                    <span className='purchase-stock out-stock'>
                      Out of Stock
                    </span>
                  )}
                </div>

                <Button
                  className='add-cart-btn'
                  type='button'
                  disabled={
                    !selectedVariant || selectedVariant.countInStock <= 0
                  }
                  onClick={addToCartHandler}
                >
                  Add to Cart
                </Button>

                <Button
                  variant='light'
                  className='add-wishlist-btn'
                  type='button'
                  disabled={!selectedVariant || wishlistLoading}
                  onClick={wishlistHandler}
                >
                  {isWishlisted ? <FaHeart /> : <FaRegHeart />}
                  {isWishlisted ? 'Added to Wishlist' : 'Add to Wishlist'}
                </Button>

                <button
                  type='button'
                  className='product-share-btn'
                  onClick={shareProductHandler}
                  disabled={isLinkCopied}
                >
                  <IoShareOutline />
                  {isLinkCopied ? 'Link Copied' : 'Share'}
                </button>
              </div>

              {/* -------------------------------------- */}
              {/* Description                             */}
              {/* -------------------------------------- */}

              <div className='product-detail-section collapsible-section'>
                <button
                  type='button'
                  className='collapsible-section-title'
                  onClick={() => setIsDescriptionOpen((isOpen) => !isOpen)}
                  aria-expanded={isDescriptionOpen}
                >
                  <span>Description</span>

                  <IoAddOutline className={isDescriptionOpen ? 'open' : ''} />
                </button>

                <div
                  className={`collapsible-section-content ${
                    isDescriptionOpen ? 'open' : ''
                  }`}
                >
                  <div className='collapsible-section-content-inner'>
                    <p className='product-description'>{product.description}</p>
                  </div>
                </div>
              </div>

              {/* -------------------------------------- */}
              {/* Product details                         */}
              {/* -------------------------------------- */}

              <div className='product-detail-section collapsible-section'>
                <button
                  type='button'
                  className='collapsible-section-title'
                  onClick={() => setIsProductDetailsOpen((isOpen) => !isOpen)}
                  aria-expanded={isProductDetailsOpen}
                >
                  <span>Product Details</span>

                  <IoAddOutline
                    className={isProductDetailsOpen ? 'open' : ''}
                  />
                </button>

                <div
                  className={`collapsible-section-content ${
                    isProductDetailsOpen ? 'open' : ''
                  }`}
                >
                  <div className='collapsible-section-content-inner'>
                    <div className='product-meta'>
                      {product.material && (
                        <div className='product-meta-row'>
                          <span>Material</span>
                          <span>{product.material}</span>
                        </div>
                      )}

                      {product.dimensions && (
                        <div className='product-meta-row'>
                          <span>Dimensions</span>
                          <span>{product.dimensions}</span>
                        </div>
                      )}

                      {product.weight && (
                        <div className='product-meta-row'>
                          <span>Weight</span>
                          <span>{product.weight}</span>
                        </div>
                      )}

                      {product.category && (
                        <div className='product-meta-row'>
                          <span>Category</span>
                          <span>{product.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* REVIEWS                                    */}
          {/* ========================================== */}

          <section className='review-section'>
            <div className='review-header'>
              <h2>Customer Reviews</h2>

              <p>See what our customers have to say.</p>
            </div>

            <div className='review-layout'>
              {/* -------------------------------------- */}
              {/* Existing reviews                        */}
              {/* -------------------------------------- */}

              <div className='review-content'>
                {product.reviews?.length === 0 ? (
                  <Message>No reviews yet.</Message>
                ) : (
                  <div className='review-list'>
                    {product.reviews.map((review) => (
                      <div className='review-card' key={review._id}>
                        <div className='review-top'>
                          <div>
                            <p className='review-user'>{review.name}</p>

                            <p className='review-date'>
                              {review.createdAt.substring(0, 10)}
                            </p>
                          </div>

                          <Rating value={review.rating} />
                        </div>

                        <p className='review-comment'>{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* -------------------------------------- */}
              {/* Review form                             */}
              {/* -------------------------------------- */}

              <div className='review-form-card'>
                <h3 className='review-form-title'>Write a Review</h3>

                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                    <Form.Group className='mb-3' controlId='rating'>
                      <Form.Label>Rating</Form.Label>

                      <Form.Select
                        value={rating}
                        onChange={(event) =>
                          setRating(Number(event.target.value))
                        }
                      >
                        <option value=''>Select...</option>

                        <option value='1'>1 - Poor</option>

                        <option value='2'>2 - Fair</option>

                        <option value='3'>3 - Good</option>

                        <option value='4'>4 - Very Good</option>

                        <option value='5'>5 - Excellent</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className='mb-3' controlId='comment'>
                      <Form.Label>Comment</Form.Label>

                      <Form.Control
                        as='textarea'
                        rows='5'
                        value={comment}
                        maxLength={2000}
                        onChange={(event) => setComment(event.target.value)}
                      />
                    </Form.Group>

                    <Button
                      disabled={loadingReview}
                      type='submit'
                      className='review-submit-btn'
                    >
                      {loadingReview ? 'Submitting...' : 'Submit Review'}
                    </Button>
                  </Form>
                ) : (
                  <Message>
                    Please{' '}
                    <button
                      type='button'
                      className='product-login-link'
                      onClick={() => openAuth()}
                    >
                      log in
                    </button>{' '}
                    to write a review.
                  </Message>
                )}
              </div>
            </div>
          </section>

          {/* ========================================== */}
          {/* IMAGE ZOOM MODAL                           */}
          {/* ========================================== */}

          <Modal
            show={showImageModal}
            onHide={closeImageModal}
            fullscreen
            centered
            className='image-zoom-modal'
            contentClassName='image-zoom-modal-content'
            backdropClassName='image-zoom-backdrop'
          >
            <Modal.Body
              className='image-zoom-modal-body'
              onClick={closeImageModal}
            >
              <button
                type='button'
                className='image-modal-close'
                onClick={closeImageModal}
                aria-label='Close image'
              >
                ×
              </button>

              {mediaCount > 1 && (
                <>
                  <button
                    type='button'
                    className='modal-nav left'
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousMedia();
                    }}
                    aria-label='Previous image'
                  >
                    ‹
                  </button>

                  <button
                    type='button'
                    className='modal-nav right'
                    onClick={(event) => {
                      event.stopPropagation();
                      showNextMedia();
                    }}
                    aria-label='Next image'
                  >
                    ›
                  </button>
                </>
              )}

              {isVideoSelected && product.video?.url ? (
                <div
                  className='zoomed-product-video-wrapper'
                  onClick={(event) => event.stopPropagation()}
                >
                  <video
                    src={product.video.url}
                    controls
                    playsInline
                    preload='metadata'
                    className='zoomed-product-video'
                    onPlay={() => setIsModalVideoPlaying(true)}
                    onPause={() => setIsModalVideoPlaying(false)}
                  />

                  {!isModalVideoPlaying && (
                    <button
                      type='button'
                      className='zoomed-product-video-play'
                      onClick={(event) => {
                        event.stopPropagation();
                        const video =
                          event.currentTarget.previousElementSibling;

                        video.play();
                        setIsModalVideoPlaying(true);
                      }}
                      aria-label='Play product video'
                    >
                      <FaRegPlayCircle />
                    </button>
                  )}
                </div>
              ) : (
                selectedImage && (
                  <Image
                    src={getCloudinaryImage(
                      selectedImage,
                      'w_2000,f_auto,q_auto',
                    )}
                    alt={product.name}
                    className='zoomed-product-image'
                    onClick={(event) => event.stopPropagation()}
                  />
                )
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProductScreen;
