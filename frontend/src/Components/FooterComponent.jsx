import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
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
                <Link to='/login' className='footer-link'>
                  Login
                </Link>
              </li>

              <li>
                <Link to='/register' className='footer-link'>
                  Register
                </Link>
              </li>
            </ul>
          </Col>

          {/* CONTACT */}
          <Col md={4}>
            <h5 className='footer-heading'>Contact</h5>
            <p className='mb-1'>Sneha Kothari</p>
            <p className='mb-1'>support@arihantclutches.com</p>
            <p className='mb-0'>+91 98765 43210</p>
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
