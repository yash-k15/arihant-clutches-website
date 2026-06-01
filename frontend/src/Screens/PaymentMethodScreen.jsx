import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { savePaymentMethod } from '../slices/cartSlice.js';
import FormContainer from '../Components/FormContainer.jsx';
import CheckoutSteps from '../Components/CheckoutSteps';

const PaymentMethodScreen = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { paymentMethod } = useSelector((state) => state.cart);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(
    paymentMethod || 'COD',
  );

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(selectedPaymentMethod));
    navigate('/placeorder');
  };
  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <FormContainer>
        <div className='auth-card'>
          <p className='auth-subtitle'>Payment Method</p>
          <h1 className='auth-title'>Choose Payment Method</h1>
          <p className='auth-description'>
            Please select how you would like to pay for your order.
          </p>
          <Form onSubmit={submitHandler}>
            <div className='payment-options'>
              {/* COD */}
              <label
                className={`payment-option-card ${
                  selectedPaymentMethod === 'COD' ? 'active' : ''
                }`}
              >
                <Form.Check
                  type='radio'
                  name='paymentMethod'
                  value='COD'
                  checked={selectedPaymentMethod === 'COD'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className='d-none'
                />

                <div>
                  <h6 className='mb-1'>Cash on Delivery</h6>

                  <small>Pay in cash when your order arrives.</small>
                </div>
              </label>

              {/* ONLINE */}
              <label
                className={`payment-option-card ${
                  selectedPaymentMethod === 'ONLINE' ? 'active' : ''
                }`}
              >
                <Form.Check
                  type='radio'
                  name='paymentMethod'
                  value='ONLINE'
                  checked={selectedPaymentMethod === 'ONLINE'}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className='d-none'
                />

                <div>
                  <h6 className='mb-1'>Online Payment</h6>
                  <small>Pay securely using card, UPI or wallet.</small>
                </div>
              </label>
            </div>

            <Button type='submit' className='w-100 auth-btn mt-4'>
              Continue
            </Button>
          </Form>
        </div>
      </FormContainer>
    </>
  );
};

export default PaymentMethodScreen;
