import { useState } from 'react';
import { useCheckout } from './CheckoutContext.jsx';
import CheckoutDelivery from './CheckoutDelivery.jsx';
import '../../assets/styles/components/Checkout.css';

const Checkout = () => {
  const { showCheckout, closeCheckout } = useCheckout();

  const [currentStep, setCurrentStep] = useState(1);

  const handleClose = () => {
    setCurrentStep(1);
    closeCheckout();
  };

  if (!showCheckout) {
    return null;
  }

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
          <div className={`checkout-step ${currentStep >= 1 ? 'active' : ''}`}>
            <span>1</span>
            <label>Delivery</label>
          </div>

          <div className={`checkout-step ${currentStep >= 2 ? 'active' : ''}`}>
            <span>2</span>
            <label>Payment</label>
          </div>

          <div className={`checkout-step ${currentStep >= 3 ? 'active' : ''}`}>
            <span>3</span>
            <label>Review</label>
          </div>
        </div>

        {currentStep === 1 && (
          <CheckoutDelivery onContinue={() => setCurrentStep(2)} />
        )}

        {currentStep === 2 && (
          <div className='checkout-placeholder'>Payment will go here.</div>
        )}

        {currentStep === 3 && (
          <div className='checkout-placeholder'>Review will go here.</div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
