import { Nav } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const CheckoutSteps = ({ step1, step2, step3 }) => {
  return (
    <Nav className='checkout-steps'>
      <Nav.Item>
        {step1 ? (
          <LinkContainer to='/login'>
            <Nav.Link className='checkout-step active'>
              <span>1</span>Sign In
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className='checkout-step'>
            <span>1</span>Sign In
          </Nav.Link>
        )}
      </Nav.Item>
      <Nav.Item>
        {step2 ? (
          <LinkContainer to='/shipping'>
            <Nav.Link className='checkout-step active'>
              <span>2</span>Shipping
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className='checkout-step'>
            <span>2</span>Shipping
          </Nav.Link>
        )}
      </Nav.Item>
      <Nav.Item>
        {step3 ? (
          <LinkContainer to='/placeorder'>
            <Nav.Link className='checkout-step active'>
              <span>3</span>Place Order
            </Nav.Link>
          </LinkContainer>
        ) : (
          <Nav.Link disabled className='checkout-step'>
            <span>3</span>Place Order
          </Nav.Link>
        )}
      </Nav.Item>
    </Nav>
  );
};

export default CheckoutSteps;
