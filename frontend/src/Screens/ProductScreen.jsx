import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';

import { Form, Image, Button, Modal } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import Rating from '../Components/Rating';
import Loader from '../Components/Loader.jsx';
import Message from '../Components/Message.jsx';
import Meta from '../Components/Meta.jsx';
import { useCartDrawer } from '../Components/CartDrawerContext.jsx';

import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice.js';

import { addToCart } from '../slices/cartSlice.js';

import { FaEdit } from 'react-icons/fa';

import { getCloudinaryImage } from '../utils/cloudinary.js';

import '../assets/styles/components/ProductScreen.css';

const ProductScreen = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { openCart } = useCartDrawer();

  const [selectedImage, setSelectedImage] = useState('');

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const [selectedVariant, setSelectedVariant] = useState(null);

  const [showImageModal, setShowImageModal] = useState(false);

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductDetailsQuery(slug);

  const [createReview, { isLoading: loadingReview }] =
    useCreateReviewMutation();

  const { userInfo } = useSelector((state) => state.auth);

  /*
   * --------------------------------------------------
   * Select variant
   * --------------------------------------------------
   */

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const requestedVariantId = location.state?.variantId;

      const variantFromNavigation = requestedVariantId
        ? product.variants.find((variant) => variant._id === requestedVariantId)
        : null;

      const variantToSelect = variantFromNavigation || product.variants[0];

      setSelectedVariant(variantToSelect);

      if (variantToSelect.images?.length > 0) {
        setSelectedImage(variantToSelect.images[0]);
      }
    }
  }, [product, location.state]);

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

  /*
   * --------------------------------------------------
   * Change variant
   * --------------------------------------------------
   */

  const handleVariantChange = (variant) => {
    setSelectedVariant(variant);

    if (variant.images?.length > 0) {
      setSelectedImage(variant.images[0]);
    }
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

  /*
   * --------------------------------------------------
   * Image navigation
   * --------------------------------------------------
   */

  const currentImageIndex = images.indexOf(selectedImage);

  const showNextImage = useCallback(() => {
    if (!images.length) return;

    const nextIndex =
      currentImageIndex >= images.length - 1 ? 0 : currentImageIndex + 1;

    setSelectedImage(images[nextIndex]);
  }, [images, currentImageIndex]);

  const showPreviousImage = useCallback(() => {
    if (!images.length) return;

    const previousIndex =
      currentImageIndex <= 0 ? images.length - 1 : currentImageIndex - 1;

    setSelectedImage(images[previousIndex]);
  }, [images, currentImageIndex]);

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
        showNextImage();
      }

      if (event.key === 'ArrowLeft') {
        showPreviousImage();
      }

      if (event.key === 'Escape') {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [showImageModal, showNextImage, showPreviousImage]);

  /*
   * --------------------------------------------------
   * Review submission
   * --------------------------------------------------
   */

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      await createReview({
        productId: product._id,
        rating,
        comment,
      }).unwrap();

      toast.success('Review submitted successfully');

      setRating(0);
      setComment('');

      refetch();
    } catch (err) {
      toast.error(err?.data?.message || err.error);
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
            onClick={() => navigate(`/admin/product/${product._id}/edit`)}
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
          {error?.data?.message || error.error}
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
                    onClick={() => setSelectedImage(image)}
                    aria-label={`View product image ${index + 1}`}
                  >
                    <Image
                      src={getCloudinaryImage(image, 'w_300,f_auto,q_auto')}
                      alt={`${product.name} ${index + 1}`}
                    />
                  </button>
                ))}
              </div>

              <div className='product-main-image-wrapper'>
                {selectedImage && (
                  <Image
                    src={getCloudinaryImage(
                      selectedImage,
                      'w_1200,f_auto,q_auto',
                    )}
                    alt={product.name}
                    className='product-main-image'
                    onClick={openImageModal}
                  />
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
                  <div className='variant-section-title'>Select Colour</div>

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
              </div>

              {/* -------------------------------------- */}
              {/* Description                             */}
              {/* -------------------------------------- */}

              <div className='product-detail-section'>
                <h2 className='section-title'>Description</h2>

                <p className='product-description'>{product.description}</p>
              </div>

              {/* -------------------------------------- */}
              {/* Product details                         */}
              {/* -------------------------------------- */}

              <div className='product-detail-section'>
                <h2 className='section-title'>Product Details</h2>

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
                        onChange={(event) => setComment(event.target.value)}
                      />
                    </Form.Group>

                    <Button
                      disabled={loadingReview}
                      type='submit'
                      className='review-submit-btn'
                    >
                      Submit Review
                    </Button>
                  </Form>
                ) : (
                  <Message>
                    Please <Link to='/login'>log in</Link> to write a review.
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

              {images.length > 1 && (
                <>
                  <button
                    type='button'
                    className='modal-nav left'
                    onClick={(event) => {
                      event.stopPropagation();
                      showPreviousImage();
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
                      showNextImage();
                    }}
                    aria-label='Next image'
                  >
                    ›
                  </button>
                </>
              )}

              {selectedImage && (
                <Image
                  src={getCloudinaryImage(
                    selectedImage,
                    'w_2000,f_auto,q_auto',
                  )}
                  alt={product.name}
                  className='zoomed-product-image'
                  onClick={(event) => event.stopPropagation()}
                />
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </div>
  );
};

export default ProductScreen;
