import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Offcanvas, Image, Button } from 'react-bootstrap';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';

import { addToCart, removeFromCart } from '../slices/cartSlice.js';
import { getCloudinaryImage } from '../utils/cloudinary.js';

import { useCheckout } from '../Components/Checkout/CheckoutContext.jsx';

import '../assets/styles/components/CartDrawer.css';

const CartDrawer = ({ show, onHide }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { openCheckout } = useCheckout();

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

  const removeItem = (variantId) => {
    dispatch(removeFromCart(variantId));
  };

  const handleViewCart = () => {
    onHide();
    navigate('/cart');
  };

  const handleCheckout = () => {
    if (!userInfo) {
      onHide();
      navigate('/login');
      return;
    }

    onHide();
    openCheckout();
  };

  return (
    <Offcanvas
      show={show}
      onHide={onHide}
      placement='end'
      className='cart-drawer'
      backdrop={true}
    >
      <Offcanvas.Header closeButton className='cart-drawer-header'>
        <Offcanvas.Title className='cart-drawer-title'>
          Your Cart
          {cartQuantity > 0 && (
            <span className='cart-drawer-count'>
              {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
            </span>
          )}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className='cart-drawer-body'>
        {cartItems.length === 0 ? (
          <div className='cart-drawer-empty'>
            <div className='cart-drawer-empty-icon'>🛒</div>

            <h3>Your cart is empty</h3>

            <p>Looks like you haven't added anything to your cart yet.</p>

            <Button
              type='button'
              className='cart-drawer-shop-btn'
              onClick={() => {
                onHide();
                navigate('/products');
              }}
            >
              Shop Now
            </Button>
          </div>
        ) : (
          <>
            <div className='cart-drawer-items'>
              {cartItems.map((item) => (
                <div
                  className='cart-drawer-item'
                  key={`${item._id}-${item.variantId}`}
                >
                  <Link
                    to={`/products/${item.slug}`}
                    className='cart-drawer-image-link'
                    onClick={onHide}
                  >
                    <Image
                      src={getCloudinaryImage(
                        item.image,
                        'w_300,h_375,c_fill,f_auto,q_auto',
                      )}
                      alt={item.name}
                      className='cart-drawer-image'
                    />
                  </Link>

                  <div className='cart-drawer-item-info'>
                    <Link
                      to={`/products/${item.slug}`}
                      className='cart-drawer-item-name'
                      onClick={onHide}
                    >
                      {item.name}
                    </Link>

                    <p className='cart-drawer-item-color'>{item.color}</p>

                    <p className='cart-drawer-item-price'>
                      ₹{formatPrice(item.price)}
                    </p>

                    <div className='cart-drawer-item-bottom'>
                      <div className='cart-drawer-quantity'>
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
                        className='cart-drawer-remove'
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className='cart-drawer-summary'>
              <div className='cart-drawer-subtotal'>
                <span>Subtotal</span>
                <strong>₹{formatPrice(subtotal)}</strong>
              </div>

              <p className='cart-drawer-note'>
                Taxes and shipping calculated at checkout.
              </p>

              <Button
                type='button'
                className='cart-drawer-checkout-btn'
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </Button>

              <Button
                type='button'
                className='cart-drawer-view-btn'
                onClick={handleViewCart}
              >
                View Cart
              </Button>
            </div>
          </>
        )}
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default CartDrawer;
