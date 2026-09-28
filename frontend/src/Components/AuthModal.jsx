import { useEffect, useRef, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useRegisterMutation,
  useForgotPasswordMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'sonner';

import '../assets/styles/components/AuthModal.css';

const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

const AuthModal = ({ show, onHide, onSuccess }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState('login');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationToken, setVerificationToken] = useState('');
  const [phone, setPhone] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

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

  const firstOtpInputRef = useRef(null);

  const [login, { isLoading: loggingIn }] = useLoginMutation();
  const [register, { isLoading: registering }] = useRegisterMutation();
  const [forgotPassword, { isLoading: sendingResetEmail }] =
    useForgotPasswordMutation();
  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();

  useEffect(() => {
    if (show) {
      resetForm();
    }
  }, [show]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        firstOtpInputRef.current?.focus();
      }, 0);
    }
  }, [step]);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  // ================================
  // Password Login
  // ================================

  const loginHandler = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.warning('Please enter your email and password');
      return;
    }

    try {
      const res = await login({
        email: email.trim().toLowerCase(),
        password,
      }).unwrap();

      dispatch(setCredentials(res));

      toast.success('Login successful');
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid email or password');
    }
  };

  // ================================
  // Send Email OTP
  // ================================

  const sendOtpHandler = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.warning('Please enter your email address');
      return;
    }

    try {
      await sendOtp({
        email: email.trim().toLowerCase(),
      }).unwrap();

      toast.success('OTP sent to your email');
      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);
      setStep('otp');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const resendOtpHandler = async () => {
    if (resendTimer > 0 || sendingOtp) return;

    try {
      await sendOtp({
        email: email.trim().toLowerCase(),
      }).unwrap();

      toast.success('A new OTP has been sent to your email');

      setOtp(['', '', '', '', '', '']);
      setResendTimer(60);

      setTimeout(() => {
        firstOtpInputRef.current?.focus();
      }, 0);
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to resend OTP');
    }
  };

  // ================================
  // Verify Email OTP
  // ================================

  const verifyOtpHandler = async (e) => {
    e.preventDefault();

    const enteredOtp = otp.join('');

    if (enteredOtp.length !== 6) {
      toast.warning('Please enter the 6-digit OTP');
      return;
    }

    try {
      const res = await verifyOtp({
        email: email.trim().toLowerCase(),
        otp: enteredOtp,
      }).unwrap();

      if (res.isNewUser) {
        setVerificationToken(res.verificationToken);
        setPassword('');
        setConfirmPassword('');
        setName('');
        setStep('profile');
        return;
      }

      dispatch(setCredentials(res));

      toast.success('Login successful');
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid OTP');
    }
  };

  // ================================
  // Registration
  // ================================

  const registerHandler = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.warning('Please enter your name');
      return;
    }

    if (!email.trim()) {
      toast.warning('Please enter your email address');
      return;
    }

    if (!PASSWORD_RULE.test(password)) {
      toast.warning(
        'Password must be at least 8 characters and include uppercase, lowercase, and a number',
      );
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    try {
      const registrationData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
      };

      if (verificationToken) {
        registrationData.verificationToken = verificationToken;
      }

      const res = await register(registrationData).unwrap();

      dispatch(setCredentials(res));

      toast.success('Account created');
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  // ================================
  // Forgot Password
  // ================================

  const forgotPasswordHandler = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.warning('Please enter your email address');
      return;
    }

    try {
      await forgotPassword({
        email: email.trim().toLowerCase(),
      }).unwrap();

      toast.success('Password reset email sent');
      setStep('login');
    } catch (err) {
      toast.error(err?.data?.message || 'Unable to send password reset email');
    }
  };

  // ================================
  // OTP Input Helpers
  // ================================

  const handleOtpChange = (e, index) => {
    const value = e.target.value.replace(/\D/g, '');
    const newOtp = [...otp];

    if (!value) {
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key !== 'Backspace') return;

    if (otp[index]) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    if (index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e, index) => {
    e.preventDefault();

    const pastedValue = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6);

    if (!pastedValue) return;

    const newOtp = [...otp];

    pastedValue.split('').forEach((digit, pasteIndex) => {
      const targetIndex = index + pasteIndex;

      if (targetIndex < otp.length) {
        newOtp[targetIndex] = digit;
      }
    });

    setOtp(newOtp);

    const focusIndex = Math.min(index + pastedValue.length, otp.length - 1);

    document.getElementById(`otp-input-${focusIndex}`)?.focus();
  };

  // ================================
  // Navigation
  // ================================

  const switchToLogin = () => {
    setStep('login');
    setPassword('');
    setConfirmPassword('');
    setVerificationToken('');
  };

  const switchToRegister = () => {
    setStep('register');
    setPassword('');
    setConfirmPassword('');
    setVerificationToken('');
  };

  const switchToOtp = () => {
    setStep('otpEmail');
    setPassword('');
    setConfirmPassword('');
    setVerificationToken('');
  };

  const switchToForgotPassword = () => {
    setStep('forgot');
    setPassword('');
    setConfirmPassword('');
    setVerificationToken('');
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setOtp(['', '', '', '', '', '']);
    setVerificationToken('');
    setPhone('');
    setResendTimer(0);
    setStep('login');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  // ================================
  // Render
  // ================================

  return (
    <Modal show={show} onHide={handleClose} centered className='auth-modal'>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 'login' && 'Sign In'}
          {step === 'otpEmail' && 'Email OTP Login'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'profile' && 'Complete Your Profile'}
          {step === 'register' && 'Create Account'}
          {step === 'forgot' && 'Forgot Password'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* ================================
            Password Login
        ================================= */}

        {step === 'login' && (
          <Form onSubmit={loginHandler}>
            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                autoComplete='email'
                required
              />
            </Form.Group>

            <Form.Group>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Enter your password'
                autoComplete='current-password'
                required
              />
            </Form.Group>

            <div className='auth-modal-link-row'>
              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToForgotPassword}
              >
                Forgot password?
              </button>
            </div>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={loggingIn}
            >
              {loggingIn ? 'Signing in...' : 'Sign In'}
            </Button>

            <div className='auth-modal-divider'>
              <span>OR</span>
            </div>

            <Button
              type='button'
              className='auth-secondary-btn'
              onClick={switchToOtp}
            >
              Sign in using OTP
            </Button>

            <div className='auth-modal-footer'>
              <span>Don't have an account?</span>

              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToRegister}
              >
                Create Account
              </button>
            </div>
          </Form>
        )}

        {/* ================================
            Email OTP - Enter Email
        ================================= */}

        {step === 'otpEmail' && (
          <Form onSubmit={sendOtpHandler}>
            <Form.Group>
              <Form.Label>Email</Form.Label>

              <Form.Text className='auth-form-helper'>
                We'll send a 6-digit OTP to this email address.
              </Form.Text>

              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                autoComplete='email'
                required
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={sendingOtp}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </Button>

            <div className='auth-modal-footer'>
              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToLogin}
              >
                Back to Sign In
              </button>
            </div>
          </Form>
        )}

        {/* ================================
            OTP Verification
        ================================= */}

        {step === 'otp' && (
          <Form onSubmit={verifyOtpHandler}>
            <Form.Group>
              <Form.Label>Enter OTP</Form.Label>

              <Form.Text className='auth-form-helper'>
                Enter the 6-digit OTP sent to {email}.
              </Form.Text>

              <div className='otp-input-group'>
                {otp.map((digit, index) => (
                  <Form.Control
                    ref={index === 0 ? firstOtpInputRef : null}
                    key={index}
                    type='text'
                    inputMode='numeric'
                    maxLength={1}
                    value={digit}
                    className='otp-input'
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    onPaste={(e) => handleOtpPaste(e, index)}
                    id={`otp-input-${index}`}
                    autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  />
                ))}
              </div>
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={verifyingOtp || otp.join('').length !== 6}
            >
              {verifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </Button>

            <div className='auth-modal-footer'>
              {resendTimer > 0 ? (
                <span>Resend OTP in {resendTimer}s</span>
              ) : (
                <button
                  type='button'
                  className='auth-modal-link'
                  onClick={resendOtpHandler}
                  disabled={sendingOtp}
                >
                  {sendingOtp ? 'Sending...' : 'Resend OTP'}
                </button>
              )}

              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToOtp}
              >
                Change email
              </button>
            </div>
          </Form>
        )}

        {/* ================================
            New User Registration After OTP
        ================================= */}

        {step === 'profile' && (
          <Form onSubmit={registerHandler}>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>

              <Form.Control
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your name'
                autoComplete='name'
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>

              <Form.Text className='auth-form-helper'>
                This email has been verified and cannot be changed.
              </Form.Text>

              <Form.Control type='email' value={email} readOnly required />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Phone Number</Form.Label>

              <Form.Text className='auth-form-helper'>Optional</Form.Text>

              <Form.Control
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='Enter your mobile number'
                autoComplete='tel'
                maxLength={10}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Password</Form.Label>

              <Form.Control
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Create a password'
                autoComplete='new-password'
                required
              />

              <div className='password-requirements'>
                <div className='password-requirements-title'>
                  Password must:
                </div>

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

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>

              <Form.Control
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm your password'
                autoComplete='new-password'
                required
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={registering}
            >
              {registering ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Form>
        )}

        {/* ================================
            Normal Registration
        ================================= */}

        {step === 'register' && (
          <Form onSubmit={registerHandler}>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>

              <Form.Control
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your name'
                autoComplete='name'
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Email</Form.Label>

              <Form.Text className='auth-form-helper'>
                Your order receipt will be sent to this address.
              </Form.Text>

              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                autoComplete='email'
                required
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Phone Number</Form.Label>

              <Form.Text className='auth-form-helper'>Optional</Form.Text>

              <Form.Control
                type='tel'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder='Enter your mobile number'
                autoComplete='tel'
                maxLength={10}
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Password</Form.Label>

              <Form.Control
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Create a password'
                autoComplete='new-password'
                required
              />

              <div className='password-requirements'>
                <div className='password-requirements-title'>
                  Password must:
                </div>

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

            <Form.Group>
              <Form.Label>Confirm Password</Form.Label>

              <Form.Control
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Confirm your password'
                autoComplete='new-password'
                required
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={registering}
            >
              {registering ? 'Creating Account...' : 'Create Account'}
            </Button>

            <div className='auth-modal-footer'>
              <span>Already have an account?</span>

              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToLogin}
              >
                Sign In
              </button>
            </div>
          </Form>
        )}

        {/* ================================
            Forgot Password
        ================================= */}

        {step === 'forgot' && (
          <Form onSubmit={forgotPasswordHandler}>
            <Form.Group>
              <Form.Label>Email</Form.Label>

              <Form.Text className='auth-form-helper'>
                Enter your account email and we'll send you a password reset
                link.
              </Form.Text>

              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='Enter your email address'
                autoComplete='email'
                required
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={sendingResetEmail}
            >
              {sendingResetEmail ? 'Sending...' : 'Send Reset Link'}
            </Button>

            <div className='auth-modal-footer'>
              <button
                type='button'
                className='auth-modal-link'
                onClick={switchToLogin}
              >
                Back to Sign In
              </button>
            </div>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
