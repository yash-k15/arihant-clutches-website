import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <Button
      variant='light'
      className='back-btn my-3'
      onClick={() => navigate(-1)}
    >
      ← Go Back
    </Button>
  );
};

export default BackButton;
