import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import Loader from '../Components/Loader.jsx';
import { useLoginMutation } from '../slices/usersApiSlice.js';
import { setCredentials } from '../slices/authSlice.js';

import '../assets/styles/components/AdminLogin.css';

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
        toast.warning('You are not authorized to access the admin panel.');
        return;
      }

      dispatch(setCredentials(res));
      toast.success('Admin login successful');
      navigate(redirect);
    } catch (err) {
      toast.error(
        err?.data?.message ||
          'Unable to sign in. Please check your credentials.',
      );
    }
  };

  return (
    <div className='admin-login-page'>
      <div className='admin-login-card'>
        <p className='admin-login-subtitle'>ADMIN PORTAL</p>

        <h1 className='admin-login-title'>Admin Login</h1>

        <Form onSubmit={submitHandler}>
          <Form.Group controlId='email' className='my-3'>
            <Form.Label className='admin-login-label'>Email Address</Form.Label>

            <Form.Control
              type='email'
              placeholder='Enter admin email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='admin-login-input'
              required
            />
          </Form.Group>

          <Form.Group controlId='password' className='my-3'>
            <Form.Label className='admin-login-label'>Password</Form.Label>

            <Form.Control
              type='password'
              placeholder='Enter password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='admin-login-input'
              required
            />
          </Form.Group>

          <Button
            type='submit'
            className='admin-login-btn mt-3'
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {isLoading && (
            <div className='admin-login-loader'>
              <Loader />
            </div>
          )}
        </Form>
      </div>
    </div>
  );
};

export default AdminLoginScreen;
