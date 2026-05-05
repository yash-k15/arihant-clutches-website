import CheckoutSteps from '../Components/CheckoutSteps';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const PaymentScreen = () => {
  const navigate = useNavigate();

  const clickHandler = (e) => {
    e.preventDefault();
    navigate('/placeorder');
  };
  return (
    <>
      <CheckoutSteps step1 step2 step3 />
      <h3>Payment</h3>
      <Button type='submit' onClick={clickHandler}>
        Next Step
      </Button>
    </>
  );
};

export default PaymentScreen;
