import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress } from '../../slices/cartSlice.js';

const CheckoutDelivery = ({ onContinue }) => {
  const dispatch = useDispatch();

  const { shippingAddress } = useSelector((state) => state.cart);

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [state, setState] = useState(shippingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || '',
  );
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(
      saveShippingAddress({
        address,
        city,
        state,
        postalCode,
        country,
      }),
    );

    onContinue();
  };

  return (
    <div className='checkout-step-content'>
      <div className='checkout-section-heading'>
        <p className='checkout-section-label'>STEP 1</p>
        <h3>Delivery Information</h3>
        <p>Enter your delivery information to continue your order.</p>
      </div>

      <Form onSubmit={submitHandler}>
        <Form.Group className='checkout-form-group' controlId='address'>
          <Form.Label>Address</Form.Label>
          <Form.Control
            type='text'
            placeholder='Enter your address'
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </Form.Group>

        <div className='checkout-form-row'>
          <Form.Group className='checkout-form-group' controlId='city'>
            <Form.Label>City</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter your city'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className='checkout-form-group' controlId='state'>
            <Form.Label>State</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter your state'
              value={state}
              onChange={(e) => setState(e.target.value)}
              required
            />
          </Form.Group>
        </div>

        <div className='checkout-form-row'>
          <Form.Group className='checkout-form-group' controlId='postalCode'>
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type='text'
              inputMode='numeric'
              placeholder='Enter postal code'
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className='checkout-form-group' controlId='country'>
            <Form.Label>Country</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter country'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
            />
          </Form.Group>
        </div>

        <div className='checkout-actions'>
          <Button type='submit' className='checkout-continue-btn'>
            Continue
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default CheckoutDelivery;
