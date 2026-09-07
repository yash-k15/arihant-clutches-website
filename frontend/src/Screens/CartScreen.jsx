import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, Button } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

import Message from '../Components/Message.jsx';
import { addToCart, removeFromCart } from '../slices/cartSlice.js';
import { getCloudinaryImage } from '../utils/cloudinary.js';
import { useCheckout } from '../Components/Checkout/CheckoutContext.jsx';
import { useAuthModal } from '../Components/AuthModalContext.jsx';

import '../assets/styles/components/CartScreen.css';

const CartScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);

  const { openCheckout } = useCheckout();
  const { openAuth } = useAuthModal();

  const cartQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const updateQuantity = (item, quantity) => {
    if (quantity < 1 || quantity > item.countInStock) return;

    dispatch(
      addToCart({
        ...item,
        qty: quantity,
      }),
    );
  };

  const removeFromCartHandler = (variantId) => {
    dispatch(removeFromCart(variantId));
  };

  const checkoutHandler = () => {
    if (!userInfo) {
      openAuth(openCheckout);
      return;
    }

    openCheckout();
  };

  const continueShoppingHandler = () => {
    navigate('/products');
  };

  return (
    <>
      <div className='cart-screen'>
        {/* Cart Header */}
        <div className='cart-header'>
          <p className='cart-subtitle'>REVIEW YOUR ITEMS</p>
          <h1 className='cart-title'>Shopping Cart</h1>
        </div>

        {cartItems.length === 0 ? (
          <div className='cart-empty'>
            <Message>
              Your cart is empty <Link to='/products'>Shop Now</Link>
            </Message>
          </div>
        ) : (
          <Row className='cart-layout'>
            {/* Cart Items */}
            <Col lg={8} className='cart-items-column'>
              <div className='cart-items'>
                {cartItems.map((item) => (
                  <div
                    className='cart-item'
                    key={`${item._id}-${item.variantId}`}
                  >
                    {/* Product Image */}
                    <Link
                      to={`/products/${item.slug}`}
                      className='cart-image-link'
                    >
                      <Image
                        src={getCloudinaryImage(
                          item.image,
                          'w_400,h_500,c_fill,f_auto,q_auto',
                        )}
                        alt={item.name}
                        className='cart-image'
                      />
                    </Link>

                    {/* Product Information */}
                    <div className='cart-product-info'>
                      <Link
                        to={`/products/${item.slug}`}
                        className='cart-product-name'
                      >
                        {item.name}
                      </Link>

                      <span className='cart-variant'>{item.color}</span>

                      <p className='cart-price-mobile'>
                        ₹{formatPrice(item.price)}
                      </p>

                      <div className='cart-item-controls'>
                        <div className='cart-quantity'>
                          <button
                            type='button'
                            onClick={() => updateQuantity(item, item.qty - 1)}
                            disabled={item.qty <= 1}
                            aria-label='Decrease quantity'
                          >
                            <FaMinus />
                          </button>

                          <span>{item.qty}</span>

                          <button
                            type='button'
                            onClick={() => updateQuantity(item, item.qty + 1)}
                            disabled={item.qty >= item.countInStock}
                            aria-label='Increase quantity'
                          >
                            <FaPlus />
                          </button>
                        </div>

                        <button
                          type='button'
                          className='cart-remove'
                          onClick={() => removeFromCartHandler(item.variantId)}
                          aria-label={`Remove ${item.name}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Desktop Price */}
                    <div className='cart-item-price'>
                      ₹{formatPrice(item.price)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping */}
              <Button
                type='button'
                className='continue-shopping-btn'
                onClick={continueShoppingHandler}
              >
                ← Continue Shopping
              </Button>
            </Col>

            {/* Order Summary */}
            <Col lg={4} className='cart-summary-column'>
              <div className='cart-summary-card'>
                <p className='cart-summary-label'>ORDER SUMMARY</p>

                <div className='cart-summary-item-count'>
                  {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
                </div>

                <div className='cart-summary-divider' />

                <div className='cart-summary-row cart-summary-total'>
                  <span>Subtotal</span>

                  <strong>₹{formatPrice(subtotal)}</strong>
                </div>

                <p className='cart-summary-note'>
                  Shipping and taxes will be calculated at checkout.
                </p>

                <Button
                  type='button'
                  className='checkout-btn'
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </Col>
          </Row>
        )}
      </div>
    </>
  );
};

export default CartScreen;
