import { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../Components/FormContainer.jsx';
import Message from '../Components/Message.jsx';
import Loader from '../Components/Loader.jsx';
import { useResetPasswordMutation } from '../slices/usersApiSlice.js';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigate = useNavigate();

  const [resetPassword] = useResetPasswordMutation();

  const { token } = useParams();

  const submitHandler = async (e) => {
    e.preventDefault();

    // CHECK PASSWORD MATCH
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      const res = await resetPassword({ token, password }).unwrap();

      toast.success(res.message || 'Password reset successful');

      navigate('/login');
    } catch (error) {
      toast.error(
        error?.data?.message || error?.message || 'Something went wrong',
      );
    }
  };

  return (
    <FormContainer>
      <div className='auth-card'>
        <p className='auth-subtitle'>SECURE YOUR ACCOUNT</p>
        <h1 className='auth-title'>Reset Password</h1>
        <p className='auth-description'>
          Enter your new password below to complete your account recovery.
        </p>
        <Form onSubmit={submitHandler}>
          <Form.Group controlId='password' className='my-3'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='confirmPassword' className='my-3'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='auth-input'
            ></Form.Control>
          </Form.Group>

          <Button type='submit' className='auth-btn mt-3'>
            Reset Password
          </Button>
        </Form>
      </div>
    </FormContainer>
  );
};

export default ResetPasswordScreen;
