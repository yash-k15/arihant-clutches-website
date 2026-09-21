import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from './AuthModalContext.jsx';
import { logout } from '../slices/authSlice.js';

import '../assets/styles/components/Footer.css';

const FooterComponent = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { openAuth } = useAuthModal();

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <footer className='footer-section'>
      <Container>
        <Row className='gy-4'>
          {/* BRAND */}
          <Col md={4}>
            <h5 className='footer-heading'>Arihant Clutches</h5>
            <p className='footer-text'>
              Premium purses and clutches crafted for elegance and everyday
              style.
            </p>
          </Col>

          {/* QUICK LINKS */}
          <Col md={4}>
            <h5 className='footer-heading'>Quick Links</h5>
            <ul className='list-unstyled'>
              <li>
                <Link to='/' className='footer-link'>
                  Home
                </Link>
              </li>

              <li>
                <Link to='/cart' className='footer-link'>
                  Cart
                </Link>
              </li>

              <li>
                <Link to='/contact' className='footer-link'>
                  Contact Us
                </Link>
              </li>

              <li>
                <Link to='/international-orders' className='footer-link'>
                  International Orders
                </Link>
              </li>

              <li>
                <Link to='/wholesale-orders' className='footer-link'>
                  Wholesale
                </Link>
              </li>

              {!userInfo ? (
                <>
                  <li>
                    <button
                      type='button'
                      className='footer-link footer-auth-btn'
                      onClick={() => openAuth()}
                    >
                      Login
                    </button>
                  </li>

                  <li>
                    <button
                      type='button'
                      className='footer-link footer-auth-btn'
                      onClick={() => openAuth()}
                    >
                      Register
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <button
                      type='button'
                      className='footer-link footer-auth-btn'
                      onClick={() => navigate('/profile')}
                    >
                      My Account
                    </button>
                  </li>

                  <li>
                    <button
                      type='button'
                      className='footer-link footer-auth-btn'
                      onClick={logoutHandler}
                    >
                      Logout
                    </button>
                  </li>
                </>
              )}
            </ul>
          </Col>

          {/* CONTACT */}
          <Col md={4}>
            <h5 className='footer-heading'>Contact</h5>
            <p className='mb-1'>Sneha Kothari</p>
            <p className='mb-1'>support@arihantclutches.com</p>
            <p className='mb-0'>+91 99090 25236</p>
          </Col>
        </Row>

        <hr className='border-light my-4' />

        <div className='footer-bottom text-center'>
          © {new Date().getFullYear()} Arihant Clutches. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default FooterComponent;
