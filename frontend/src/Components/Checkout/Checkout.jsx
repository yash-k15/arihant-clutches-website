import { useState } from 'react';
import { useCheckout } from './CheckoutContext.jsx';
import CheckoutDelivery from './CheckoutDelivery.jsx';
import CheckoutPayment from './CheckoutPayment.jsx';

import '../../assets/styles/components/Checkout.css';

const Checkout = () => {
  const { showCheckout, closeCheckout } = useCheckout();

  const [currentStep, setCurrentStep] = useState(1);

  if (!showCheckout) {
    return null;
  }

  const handleClose = () => {
    setCurrentStep(1);
    closeCheckout();
  };

  const goToDelivery = () => {
    setCurrentStep(1);
  };

  const goToPayment = () => {
    setCurrentStep(2);
  };

  const goToReview = () => {
    setCurrentStep(3);
  };

  return (
    <div className='checkout-overlay'>
      <div className='checkout-container'>
        <div className='checkout-header'>
          <div>
            <p className='checkout-subtitle'>CHECKOUT</p>

            <h2 className='checkout-title'>Complete Your Order</h2>
          </div>

          <button
            type='button'
            className='checkout-close'
            onClick={handleClose}
            aria-label='Close checkout'
          >
            ×
          </button>
        </div>

        <div className='checkout-steps'>
          <button
            type='button'
            className={`checkout-step ${currentStep >= 1 ? 'active' : ''}`}
            onClick={currentStep > 1 ? goToDelivery : undefined}
            disabled={currentStep === 1}
          >
            <span>1</span>
            <label>Delivery</label>
          </button>

          <button
            type='button'
            className={`checkout-step ${currentStep >= 2 ? 'active' : ''}`}
            onClick={currentStep > 2 ? goToPayment : undefined}
            disabled={currentStep <= 2}
          >
            <span>2</span>
            <label>Payment</label>
          </button>

          <div className={`checkout-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Review</label>
          </div>
        </div>

        {currentStep === 1 && <CheckoutDelivery onContinue={goToPayment} />}

        {currentStep === 2 && (
          <CheckoutPayment onBack={goToDelivery} onContinue={goToReview} />
        )}

        {currentStep === 3 && (
          <div className='checkout-placeholder'>Review will go here.</div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
