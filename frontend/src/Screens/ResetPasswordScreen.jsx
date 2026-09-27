import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'sonner';

import Loader from '../Components/Loader.jsx';
import { useResetPasswordMutation } from '../slices/usersApiSlice.js';

import '../assets/styles/components/ResetPasswordScreen.css';

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await resetPassword({
        token,
        password,
      }).unwrap();

      toast.success('Password reset successful.');

      navigate('/');
    } catch (err) {
      toast.error(
        err?.data?.message ||
          'Unable to reset your password. Please try again.',
      );
    }
  };

  return (
    <div className='reset-password-page'>
      <div className='reset-password-card'>
        <p className='reset-password-subtitle'>ACCOUNT SECURITY</p>

        <h1 className='reset-password-title'>Reset Password</h1>

        <p className='reset-password-description'>
          Enter your new password below.
        </p>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId='password' className='my-3'>
            <Form.Label className='reset-password-label'>
              New Password
            </Form.Label>

            <Form.Control
              type='password'
              placeholder='Enter new password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='reset-password-input'
              minLength={6}
              required
            />
          </Form.Group>

          <Form.Group controlId='confirmPassword' className='my-3'>
            <Form.Label className='reset-password-label'>
              Confirm Password
            </Form.Label>

            <Form.Control
              type='password'
              placeholder='Confirm new password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='reset-password-input'
              minLength={6}
              required
            />
          </Form.Group>

          <Button
            type='submit'
            className='reset-password-btn mt-3'
            disabled={isLoading}
          >
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>

          {isLoading && (
            <div className='reset-password-loader'>
              <Loader />
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default ResetPasswordScreen;
