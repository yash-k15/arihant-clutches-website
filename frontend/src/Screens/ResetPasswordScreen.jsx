import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'sonner';

import Loader from '../Components/Loader.jsx';
import { useResetPasswordMutation } from '../slices/usersApiSlice.js';

import '../assets/styles/components/ResetPasswordScreen.css';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const passwordRequirements = [
    {
      label: 'At least 8 characters',
      valid: password.length >= 8,
    },
    {
      label: 'Contains both lowercase and uppercase letters',
      valid: /[a-z]/.test(password) && /[A-Z]/.test(password),
    },
    {
      label: 'Contains 1 number',
      valid: /\d/.test(password),
    },
  ];

  const { token } = useParams();
  const navigate = useNavigate();

  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!PASSWORD_RULE.test(password)) {
      toast.warning(
        'Password must be at least 8 characters and include uppercase, lowercase, and a number',
      );
      return;
    }

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
    } catch (error) {
      toast.error(
        error?.data?.error ||
          error?.data?.message ||
          error?.error ||
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
              minLength={8}
              required
            />

            <div className='password-requirements'>
              <div className='password-requirements-title'>Password must:</div>

              {passwordRequirements.map((requirement) => (
                <div
                  key={requirement.label}
                  className={`password-requirement ${
                    requirement.valid ? 'valid' : ''
                  }`}
                >
                  <span className='password-requirement-icon'>
                    {requirement.valid ? '✓' : '○'}
                  </span>

                  <span>{requirement.label}</span>
                </div>
              ))}
            </div>
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
              minLength={8}
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
