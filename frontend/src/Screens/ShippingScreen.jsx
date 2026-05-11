import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { saveShippingAddress } from '../slices/cartSlice.js';
import FormContainer from '../Components/FormContainer.jsx';
import CheckoutSteps from '../Components/CheckoutSteps.jsx';

const ShippingScreen = () => {
  const cart = useSelector((state) => state.cart);
  const { shippingAddress } = cart;

  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [state, setState] = useState(shippingAddress?.state || '');
  const [postalCode, setPostalCode] = useState(
    shippingAddress?.postalCode || '',
  );
  const [country, setCountry] = useState(shippingAddress?.country || '');

  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    navigate('/placeorder');
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 />
      <div className='auth-card'>
        <p className='auth-subtitle'>CHECKOUT</p>
        <h1 className='auth-title'>Shipping Details</h1>
        <p className='auth-description'>
          Enter your delivery information to continue your order.
        </p>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='address' className='my-3'>
            <Form.Label>Address</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter Address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='city' className='my-3'>
            <Form.Label>City</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter City'
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='state' className='my-3'>
            <Form.Label>State</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter State'
              value={state}
              onChange={(e) => setState(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='postalCode' className='my-3'>
            <Form.Label>Postal Code</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter Postal Code'
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='country' className='my-3'>
            <Form.Label>Country</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter Country'
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Button type='submit' className='auth-btn mt-3'>
            Continue
          </Button>
        </Form>
      </div>
    </FormContainer>
  );
};

export default ShippingScreen;
