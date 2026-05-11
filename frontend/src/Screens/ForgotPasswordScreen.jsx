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
      <div className='auth-card'>
        <p className='auth-subtitle'>ACCOUNT RECOVERY</p>
        <h1 className='auth-title'>Forgot Password</h1>
        <p className='auth-description'>
          Enter your email address and we’ll send you a password reset link.
        </p>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='email' className='my-3'>
            <Form.Label>Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Button type='submit' className='auth-btn mt-3' disabled={!email}>
            Reset Password
          </Button>
        </Form>
      </div>
    </FormContainer>
  );
};

export default ForgotPasswordScreen;
