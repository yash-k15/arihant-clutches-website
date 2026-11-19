import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'sonner';

import Loader from '../Components/Loader.jsx';
import { useResetPasswordMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';

import '../assets/styles/components/ResetPasswordScreen.css';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const ResetPasswordScreen = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
  const dispatch = useDispatch();

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
      const res = await resetPassword({
        token,
        password,
      }).unwrap();

      dispatch(setCredentials(res));

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

            <div className='reset-password-field'>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter new password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='reset-password-input'
                minLength={8}
                required
              />
              <button
                type='button'
                className='reset-password-toggle'
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden='true'
                    focusable='false'
                  >
                    { !showPassword ? (
                      <>
                        <path d='M3 3l18 18' />
                        <path d='M10.6 10.6a2 2 0 0 0 2.8 2.8' />
                        <path d='M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.2-2.5 3.3' />
                        <path d='M6.2 6.2C3.8 7.7 2.4 10 2 12c1 2.5 5 7 10 7 1.1 0 2.1-.2 3-.6' />
                      </>
                    ) : (
                      <>
                        <path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z' />
                        <circle cx='12' cy='12' r='3' />
                      </>
                    )}
                  </svg>
              </button>
            </div>

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

            <div className='reset-password-field'>
              <Form.Control
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder='Confirm new password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className='reset-password-input'
                minLength={8}
                required
              />
              <button
                type='button'
                className='reset-password-toggle'
                onClick={() =>
                  setShowConfirmPassword((visible) => !visible)
                }
                aria-label={
                  showConfirmPassword ? 'Hide password' : 'Show password'
                }
                aria-pressed={showConfirmPassword}
              >
                <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.8'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    aria-hidden='true'
                    focusable='false'
                  >
                    { !showConfirmPassword ? (
                      <>
                        <path d='M3 3l18 18' />
                        <path d='M10.6 10.6a2 2 0 0 0 2.8 2.8' />
                        <path d='M9.9 5.2A10.8 10.8 0 0 1 12 5c5 0 9 4.5 10 7-.4 1-1.3 2.2-2.5 3.3' />
                        <path d='M6.2 6.2C3.8 7.7 2.4 10 2 12c1 2.5 5 7 10 7 1.1 0 2.1-.2 3-.6' />
                      </>
                    ) : (
                      <>
                        <path d='M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z' />
                        <circle cx='12' cy='12' r='3' />
                      </>
                    )}
                  </svg>
              </button>
            </div>
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
