import { useEffect, useRef, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterPhoneMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'sonner';

import '../assets/styles/components/AuthModal.css';

const AuthModal = ({ show, onHide, onSuccess }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState('phone');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const firstOtpInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setPhone('');
      setOtp(['', '', '', '', '', '']);
      setName('');
      setEmail('');
      setStep('phone');
    }
  }, [show]);

  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        firstOtpInputRef.current?.focus();
      }, 0);
    }
  }, [step]);

  const [sendOtp, { isLoading: sendingOtp }] = useSendOtpMutation();
  const [verifyOtp, { isLoading: verifyingOtp }] = useVerifyOtpMutation();
  const [registerPhone, { isLoading: registering }] =
    useRegisterPhoneMutation();

  const sendOtpHandler = async (e) => {
    e.preventDefault();

    try {
      await sendOtp({ phone }).unwrap();

      toast.success('OTP sent');
      setStep('otp');
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtpHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await verifyOtp({
        phone,
        otp: otp.join(''),
      }).unwrap();

      if (res.isNewUser) {
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

    try {
      const res = await registerPhone({
        phone,
        name: name.trim(),
        email: email.trim(),
      }).unwrap();

      dispatch(setCredentials(res));

      toast.success('Account created');
      resetForm();
      onSuccess();
    } catch (err) {
      toast.error(err?.data?.message || 'Registration failed');
    }
  };

  const resetForm = () => {
    setPhone('');
    setOtp(['', '', '', '', '', '']);
    setName('');
    setEmail('');
    setStep('phone');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered className='auth-modal'>
      <Modal.Header closeButton>
        <Modal.Title>
          {step === 'phone' && 'Sign In'}
          {step === 'otp' && 'Verify OTP'}
          {step === 'profile' && 'Complete Your Profile'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {step === 'phone' && (
          <Form onSubmit={sendOtpHandler}>
            <Form.Group>
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type='tel'
                placeholder='Enter mobile number'
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={sendingOtp}
            >
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </Button>
          </Form>
        )}

        {step === 'otp' && (
          <Form onSubmit={verifyOtpHandler}>
            <Form.Group>
              <Form.Label>Enter OTP</Form.Label>

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
                    onChange={(e) => {
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
                        document
                          .getElementById(`otp-input-${index + 1}`)
                          ?.focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace') {
                        if (otp[index]) {
                          const newOtp = [...otp];
                          newOtp[index] = '';
                          setOtp(newOtp);
                          return;
                        }

                        if (index > 0) {
                          document
                            .getElementById(`otp-input-${index - 1}`)
                            ?.focus();
                        }
                      }
                    }}
                    onPaste={(e) => {
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

                      const focusIndex = Math.min(
                        index + pastedValue.length,
                        otp.length - 1,
                      );

                      document
                        .getElementById(`otp-input-${focusIndex}`)
                        ?.focus();
                    }}
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
          </Form>
        )}

        {step === 'profile' && (
          <Form onSubmit={registerHandler}>
            <Form.Group className='mb-3'>
              <Form.Label>Name</Form.Label>
              <Form.Control
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your name'
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
                required
              />
            </Form.Group>

            <Button
              type='submit'
              className='auth-submit-btn'
              disabled={registering}
            >
              Complete Registration
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
