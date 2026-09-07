import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../../slices/cartSlice.js';

const CheckoutPayment = ({ onBack, onContinue }) => {
  const dispatch = useDispatch();

  const { paymentMethod } = useSelector((state) => state.cart);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethod || 'COD',
  );

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(savePaymentMethod(selectedPaymentMethod));
    onContinue();
  };

  return (
    <div className='checkout-step-content'>
      <div className='checkout-section-heading'>
        <p className='checkout-section-label'>STEP 2</p>
        <h3>Payment Method</h3>
        <p>Select how you would like to pay for your order.</p>
      </div>

      <form onSubmit={submitHandler}>
        <div className='checkout-payment-options'>
          <label
            className={`checkout-payment-option ${
              selectedPaymentMethod === 'COD' ? 'selected' : ''
            }`}
          >
            <input
              type='radio'
              name='paymentMethod'
              value='COD'
              checked={selectedPaymentMethod === 'COD'}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />

            <div className='checkout-payment-content'>
              <span className='checkout-payment-title'>Cash on Delivery</span>

              <span className='checkout-payment-description'>
                Pay in cash when your order arrives.
              </span>
            </div>
          </label>

          <label
            className={`checkout-payment-option ${
              selectedPaymentMethod === 'ONLINE' ? 'selected' : ''
            }`}
          >
            <input
              type='radio'
              name='paymentMethod'
              value='ONLINE'
              checked={selectedPaymentMethod === 'ONLINE'}
              onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            />

            <div className='checkout-payment-content'>
              <span className='checkout-payment-title'>Online Payment</span>

              <span className='checkout-payment-description'>
                Pay securely using card, UPI or wallet.
              </span>
            </div>
          </label>
        </div>

        <div className='checkout-actions checkout-actions-between'>
          <Button type='button' className='checkout-back-btn' onClick={onBack}>
            ← Back
          </Button>

          <Button type='submit' className='checkout-continue-btn'>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPayment;
