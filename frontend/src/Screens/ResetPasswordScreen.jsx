import { useState, useEffect } from 'react';
import { Form, Button, Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    <Row>
      <Col md={3}>
        <h2>Reset Password</h2>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId='password' className='my-2'>
            <Form.Label>Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Form.Group controlId='confirmPassword' className='my-2'>
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type='password'
              placeholder='Confirm password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            ></Form.Control>
          </Form.Group>

          <Button type='submit' variant='primary' className='my-2'>
            Reset Password
          </Button>
        </Form>
      </Col>
    </Row>
  );
};

export default ResetPasswordScreen;
