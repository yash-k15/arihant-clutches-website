import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Card, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { useLoginMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';

const AdminLoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [login, { isLoading }] = useLoginMutation();

  const { userInfo } = useSelector((state) => state.auth);

  const redirect = location.search
    ? new URLSearchParams(location.search).get('redirect')
    : '/';

  useEffect(() => {
    if (userInfo) {
      if (userInfo.isAdmin) {
        navigate(redirect);
      } else {
        navigate('/');
      }
    }
  }, [userInfo, navigate, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      const res = await login({
        email,
        password,
      }).unwrap();

      if (!res.isAdmin) {
        toast.error('You are not authorized to access the admin panel.');
        return;
      }

      dispatch(setCredentials(res));
      toast.success('Admin login successful');
      navigate(redirect);
    } catch (err) {
      toast.error(err?.data?.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className='d-flex justify-content-center align-items-center'>
      <Card style={{ width: '100%', maxWidth: '450px' }}>
        <Card.Body className='p-4'>
          <h1 className='mb-2'>Admin Login</h1>

          <p className='text-muted mb-4'>
            Sign in with your administrator credentials.
          </p>

          <Form onSubmit={submitHandler}>
            <Form.Group className='mb-3' controlId='email'>
              <Form.Label>Email</Form.Label>
              <Form.Control
                type='email'
                placeholder='Enter admin email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className='mb-3' controlId='password'>
              <Form.Label>Password</Form.Label>
              <Form.Control
                type='password'
                placeholder='Enter password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type='submit' className='w-100' disabled={isLoading}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminLoginScreen;
