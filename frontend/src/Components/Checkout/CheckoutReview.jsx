import { useEffect, useRef } from 'react';
import { Button, Image } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import PaymentButton from '../PaymentButton.jsx';
import { getCloudinaryImage } from '../../utils/cloudinary.js';

import { useCalculateOrderPricingMutation } from '../../slices/ordersApiSlice.js';

const CheckoutReview = ({ onBack, onEditDelivery }) => {
  const { cartItems, shippingAddress, paymentMethod } = useSelector(
    (state) => state.cart,
  );

  const [
    calculateOrderPricing,
    {
      data: pricingData,
      isLoading: isPricingLoading,
      isError: isPricingError,
      error: pricingError,
    },
  ] = useCalculateOrderPricingMutation();

  const pricing = pricingData?.pricing;

  const pricingRequestKeyRef = useRef(null);

  const formatPrice = (price) => {
    return Number(price).toLocaleString('en-IN', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const cartQuantity = cartItems.reduce((acc, item) => acc + item.qty, 0);

  useEffect(() => {
    if (!cartItems.length || !paymentMethod) return;

    const pricingRequestKey = JSON.stringify({
      paymentMethod,
      orderItems: cartItems.map((item) => ({
        product: item._id,
        variantId: item.variantId,
        qty: item.qty,
      })),
    });

    if (pricingRequestKeyRef.current === pricingRequestKey) return;

    pricingRequestKeyRef.current = pricingRequestKey;

    calculateOrderPricing({
      orderItems: cartItems.map((item) => ({
        product: item._id,
        variantId: item.variantId,
        qty: item.qty,
      })),
      paymentMethod,
    });
  }, [cartItems, paymentMethod, calculateOrderPricing]);

  const getServerItem = (item) =>
    pricing?.validatedItems?.find(
      (serverItem) =>
        serverItem.product?.toString() === item._id?.toString() &&
        serverItem.variantId?.toString() === item.variantId?.toString(),
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
                ₹{(getServerItem(item)?.price ?? item.price) * item.qty}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className='checkout-review-summary'>
        <div className='checkout-review-summary-row'>
          <span>Subtotal</span>
          <strong>
            {pricing ? `₹${formatPrice(pricing.itemsPrice)}` : '—'}
          </strong>
        </div>

        <div className='checkout-review-summary-row'>
          <span>Shipping</span>
          <strong>
            {pricing ? `₹${formatPrice(pricing.shippingPrice)}` : '—'}
          </strong>
        </div>

        <div className='checkout-review-summary-total'>
          <span>Total</span>
          <strong>
            {pricing ? `₹${formatPrice(pricing.totalPrice)}` : '—'}
          </strong>
        </div>
      </div>

      {/* Actions */}
      <div className='checkout-review-actions'>
        <Button type='button' className='checkout-back-btn' onClick={onBack}>
          ← Back
        </Button>

        {isPricingLoading ? (
          <p className='checkout-pricing-status'>Checking current prices...</p>
        ) : isPricingError ? (
          <p className='checkout-pricing-status checkout-pricing-error'>
            {pricingError?.data?.error ||
              pricingError?.data?.message ||
              'Unable to verify current prices. Please try again.'}
          </p>
        ) : pricing ? (
          <PaymentButton />
        ) : null}
      </div>
    </div>
  );
};

export default CheckoutReview;
