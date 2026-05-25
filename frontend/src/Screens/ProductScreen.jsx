import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetProductDetailsQuery,
  useCreateReviewMutation,
} from '../slices/productsApiSlice.js';
import {
  Form,
  Row,
  Col,
  Image,
  ListGroup,
  Card,
  Button,
  Modal,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Rating from '../Components/Rating';
import Loader from '../Components/Loader.jsx';
import Message from '../Components/Message.jsx';
import Meta from '../Components/Meta.jsx';
import { addToCart } from '../slices/cartSlice.js';
import BackButton from '../Components/BackButton.jsx';

const ProductScreen = () => {
  const { slug } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [selectedImage, setSelectedImage] = useState('');
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [zoomImage, setZoomImage] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);

  const {
    data: product,
    isLoading,
    refetch,
    error,
  } = useGetProductDetailsQuery(slug);

  const [createReview, { isLoading: loadingProductReview }] =
    useCreateReviewMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const addToCartHandler = () => {
    dispatch(
      addToCart({
        product: product._id,
        slug: product.slug,
        variantId: selectedVariant._id,
        color: selectedVariant.color,
        name: product.name,
        image: selectedVariant.images[0],
        price: selectedVariant.price,
        countInStock: selectedVariant.countInStock,
        qty,
      }),
    );
    navigate('/cart');
  };

  useEffect(() => {
    if (product?.variants?.length > 0) {
      const firstVariant = product.variants[0];

      setSelectedVariant(firstVariant);

      if (firstVariant.images?.length > 0) {
        setSelectedImage(firstVariant.images[0]);
      }
    }
  }, [product]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await createReview({
        productSlug: product.slug,
        rating,
        comment,
      }).unwrap();
      refetch();
      toast.success('Review Submitted');
      setRating(0);
      setComment('');
    } catch (err) {
      toast.error(err?.data?.error || err.error);
    }
  };

  return (
    <>
      <BackButton />
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={product.name} />
          <Row>
            <Col md={5}>
              <Image
                src={selectedImage}
                alt={product.name}
                fluid
                className='product-main-image'
                onClick={() => {
                  setZoomImage(selectedImage);
                  setShowImageModal(true);
                }}
              />
              {selectedVariant?.images?.length > 0 && (
                <div className='product-thumbnails'>
                  {selectedVariant.images.map((img, index) => (
                    <img
                      key={index}
                      src={img}
                      alt={product.name}
                      className={
                        selectedImage === img ? 'thumbnail active' : 'thumbnail'
                      }
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              )}
            </Col>
            <Col md={4}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h1 className='product-name'>{product.name}</h1>
                </ListGroup.Item>
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} reviews`}
                  />
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className='product-price'>₹{selectedVariant?.price}</div>

                  <div className='variant-selector'>
                    <h6 className='section-title'>Select Color</h6>

                    <div className='variant-options'>
                      {product.variants.map((variant) => (
                        <button
                          key={variant._id}
                          type='button'
                          className={`variant-btn ${
                            selectedVariant?._id === variant._id ? 'active' : ''
                          }`}
                          onClick={() => {
                            setSelectedVariant(variant);

                            if (variant.images?.length > 0) {
                              setSelectedImage(variant.images[0]);
                            }

                            setQty(1);
                          }}
                        >
                          {variant.color}
                        </button>
                      ))}
                    </div>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <h6 className='section-title'>Description</h6>
                  <p className='product-description'>{product.description}</p>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className='product-meta'>
                    <span>
                      Material:
                      <strong> {product.material}</strong>
                    </span>
                    <span>
                      Category:
                      <strong> {product.category}</strong>
                    </span>
                  </div>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className='product-meta'>
                    <span>
                      Dimensions:
                      <strong> {product.dimensions}</strong>
                    </span>
                    <span>
                      Weight:
                      <strong> {product.weight}</strong>
                    </span>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={3}>
              <Card className='purchase-card'>
                <ListGroup>
                  <ListGroup.Item>
                    <Row>
                      <Col>Price:</Col>
                      <Col>
                        <strong>₹{selectedVariant?.price}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Status:</Col>
                      <Col>
                        <span
                          className={
                            selectedVariant?.countInStock > 0
                              ? 'in-stock'
                              : 'out-stock'
                          }
                        >
                          {selectedVariant?.countInStock > 0
                            ? 'In Stock'
                            : 'Out of Stock'}
                        </span>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  {selectedVariant?.countInStock > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Qty</Col>
                        <Col>
                          <Form.Control
                            as='select'
                            value={qty}
                            onChange={(e) => setQty(Number(e.target.value))}
                          >
                            {[
                              ...Array(selectedVariant?.countInStock).keys(),
                            ].map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </Form.Control>
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <Button
                      className='w-100 add-cart-btn'
                      type='button'
                      disabled={
                        !selectedVariant || selectedVariant.countInStock === 0
                      }
                      onClick={addToCartHandler}
                    >
                      Add To Cart
                    </Button>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          <Row className='review-section'>
            <Col lg={9}>
              <div className='review-header'>
                <h2>Customer Reviews</h2>
                <p>
                  {product.numReviews} review
                  {product.numReviews !== 1 ? 's' : ''}
                </p>
              </div>

              {product.reviews.length === 0 ? (
                <Message>No Reviews Yet</Message>
              ) : (
                <div className='review-list'>
                  {product.reviews.map((review) => (
                    <div key={review._id} className='review-card'>
                      <div className='review-top'>
                        <div>
                          <h5 className='review-user'>{review.name}</h5>

                          <p className='review-date'>
                            {new Date(review.createdAt).toLocaleDateString(
                              'en-GB',
                            )}
                          </p>
                        </div>

                        <Rating value={review.rating} />
                      </div>

                      <p className='review-comment'>{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              <div className='review-form-card'>
                <h3 className='review-form-title'>Write a Review</h3>

                {loadingProductReview && <Loader />}

                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                    <Form.Group controlId='rating' className='mb-3'>
                      <Form.Label>Rating</Form.Label>

                      <Form.Select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                      >
                        <option value=''>Select Rating</option>
                        <option value='1'>1 - Poor</option>
                        <option value='2'>2 - Fair</option>
                        <option value='3'>3 - Good</option>
                        <option value='4'>4 - Very Good</option>
                        <option value='5'>5 - Excellent</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId='comment' className='mb-3'>
                      <Form.Label>Comment</Form.Label>

                      <Form.Control
                        as='textarea'
                        rows={4}
                        placeholder='Share your experience with this product...'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </Form.Group>

                    <Button
                      disabled={loadingProductReview}
                      type='submit'
                      className='review-submit-btn'
                    >
                      Submit Review
                    </Button>
                  </Form>
                ) : (
                  <Message>
                    Please <Link to='/login'>sign in</Link> to write a review
                  </Message>
                )}
              </div>
            </Col>
          </Row>

          <Modal
            show={showImageModal}
            onHide={() => setShowImageModal(false)}
            centered
            fullscreen
            contentClassName='image-zoom-modal-content'
            backdropClassName='image-zoom-backdrop'
            dialogClassName='m-0'
          >
            <Modal.Body className='image-zoom-modal-body'>
              <button
                className='image-modal-close'
                onClick={() => setShowImageModal(false)}
              >
                ×
              </button>

              {zoomImage && (
                <Image
                  src={zoomImage}
                  alt={product.name}
                  className='zoomed-product-image'
                />
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default ProductScreen;
