import { useEffect, useState } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import {
  useSendOtpMutation,
  useVerifyOtpMutation,
  useRegisterPhoneMutation,
} from '../slices/usersApiSlice';
import { setCredentials } from '../slices/authSlice';
import { toast } from 'react-toastify';

const AuthModal = ({ show, onHide, onSuccess }) => {
  const dispatch = useDispatch();

  const [step, setStep] = useState('phone');

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (show) {
      setPhone('');
      setOtp('');
      setName('');
      setEmail('');
      setStep('phone');
    }
  }, [show]);

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
        otp,
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

    try {
      const res = await registerPhone({
        phone,
        name,
        email,
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
    setOtp('');
    setName('');
    setEmail('');
    setStep('phone');
  };

  const handleClose = () => {
    resetForm();
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{step === 'phone' ? 'Sign In' : 'Verify OTP'}</Modal.Title>
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

            <Button type='submit' className='w-100 mt-3' disabled={sendingOtp}>
              {sendingOtp ? 'Sending...' : 'Send OTP'}
            </Button>
          </Form>
        )}

        {step === 'otp' && (
          <Form onSubmit={verifyOtpHandler}>
            <Form.Group>
              <Form.Label>OTP</Form.Label>
              <Form.Control
                type='text'
                placeholder='Enter OTP'
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </Form.Group>

            <Button
              type='submit'
              className='w-100 mt-3'
              disabled={verifyingOtp}
            >
              Verify OTP
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
              />
            </Form.Group>

            <Form.Group className='mb-3'>
              <Form.Label>Email (Optional)</Form.Label>
              <Form.Control
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Form.Group>

            <Button type='submit' className='w-100' disabled={registering}>
              Complete Registration
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default AuthModal;
