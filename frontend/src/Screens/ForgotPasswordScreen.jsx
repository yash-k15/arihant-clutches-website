import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
// import { useDispatch } from 'react-redux';
import FormContainer from '../Components/FormContainer.jsx';
import { useForgotPasswordMutation } from '../slices/usersApiSlice.js';
import { toast } from 'react-toastify';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');

  //   const dispatch = useDispatch();
  //   const navigate = useNavigate();

  const [resetPassword] = useForgotPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({ email }).unwrap();
      toast.success('Reset password link sent');
    } catch (err) {
      toast.error(err?.data?.error || err.error);
    }
  };

  return (
    <FormContainer>
      <h1>Password Reset</h1>
      <Form>
        <Form.Group controlId='email' className='my-3'>
          <Form.Label>Email Address</Form.Label>
          <Form.Control
            type='email'
            placeholder='Enter email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></Form.Control>
        </Form.Group>

        <Button
          type='submit'
          variant='primary'
          className='mt-2'
          disabled={email ? false : true}
          onClick={submitHandler}
        >
          Reset Password
        </Button>
      </Form>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
