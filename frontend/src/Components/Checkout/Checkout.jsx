import { useCheckout } from './CheckoutContext.jsx';
import '../../assets/styles/components/Checkout.css';

const Checkout = () => {
  const { showCheckout, closeCheckout } = useCheckout();

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
            onClick={closeCheckout}
            aria-label='Close checkout'
          >
            ×
          </button>
        </div>

        <div className='checkout-placeholder'>Checkout steps will go here.</div>
      </div>
    </div>
  );
};

export default Checkout;
