import { Button, Image } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import PaymentButton from '../PaymentButton.jsx';
import { getCloudinaryImage } from '../../utils/cloudinary.js';

const CheckoutReview = ({ onBack, onEditDelivery }) => {
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    shippingPrice,
    taxPrice,
    totalPrice,
  } = useSelector((state) => state.cart);

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const cartQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0,
  );

  return (
    <div className='checkout-step-content checkout-review'>
      <div className='checkout-section-heading'>
        <p className='checkout-section-label'>STEP 3</p>

        <h3>Review Your Order</h3>

        <p>Review your details and items before placing your order.</p>
      </div>

      {/* Delivery */}
      <div className='checkout-review-section'>
        <div className='checkout-review-section-header'>
          <div>
            <p className='checkout-review-label'>DELIVERY</p>
            <h4>Shipping Address</h4>
          </div>

          <Button
            type='button'
            className='checkout-edit-btn'
            onClick={onEditDelivery}
          >
            Edit
          </Button>
        </div>

        <div className='checkout-review-card'>
          <p>{shippingAddress.fullName}</p>
          <p>{shippingAddress.phone}</p>

          <p>{shippingAddress.addressLine1}</p>

          {shippingAddress.addressLine2 && (
            <p>{shippingAddress.addressLine2}</p>
          )}

          <p>
            {shippingAddress.city}, {shippingAddress.state}
          </p>

          <p>{shippingAddress.postalCode}</p>
          <p>{shippingAddress.country}</p>
        </div>
      </div>

      {/* Payment */}
      <div className='checkout-review-section'>
        <div className='checkout-review-section-header'>
          <div>
            <p className='checkout-review-label'>PAYMENT</p>
            <h4>Payment Method</h4>
          </div>

          <Button type='button' className='checkout-edit-btn' onClick={onBack}>
            Edit
          </Button>
        </div>

        <div className='checkout-review-card'>
          <p>
            {paymentMethod === 'ONLINE' ? 'Online Payment' : 'Cash on Delivery'}
          </p>
        </div>
      </div>

      {/* Items */}
      <div className='checkout-review-section'>
        <div className='checkout-review-section-header'>
          <div>
            <p className='checkout-review-label'>ORDER</p>

            <h4>
              {cartQuantity} {cartQuantity === 1 ? 'item' : 'items'}
            </h4>
          </div>
        </div>

        <div className='checkout-review-items'>
          {cartItems.map((item) => (
            <div
              key={`${item._id}-${item.variantId}`}
              className='checkout-review-item'
            >
              <Image
                src={getCloudinaryImage(item.image)}
                alt={item.name}
                className='checkout-review-item-image'
              />

              <div className='checkout-review-item-info'>
                <p className='checkout-review-item-name'>{item.name}</p>

                <span className='checkout-review-item-variant'>
                  {item.color}
                </span>

                <p className='checkout-review-item-quantity'>Qty: {item.qty}</p>
              </div>

              <div className='checkout-review-item-price'>
                ₹{formatPrice(item.price * item.qty)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className='checkout-review-summary'>
        <div className='checkout-review-summary-row'>
          <span>Subtotal</span>
          <strong>₹{formatPrice(subtotal)}</strong>
        </div>

        <div className='checkout-review-summary-row'>
          <span>Shipping</span>
          <strong>₹{formatPrice(shippingPrice)}</strong>
        </div>

        <div className='checkout-review-summary-row'>
          <span>Tax</span>
          <strong>₹{formatPrice(taxPrice)}</strong>
        </div>

        <div className='checkout-review-summary-total'>
          <span>Total</span>
          <strong>₹{formatPrice(totalPrice)}</strong>
        </div>
      </div>

      {/* Actions */}
      <div className='checkout-review-actions'>
        <Button type='button' className='checkout-back-btn' onClick={onBack}>
          ← Back
        </Button>

        <PaymentButton />
      </div>
    </div>
  );
};

export default CheckoutReview;
