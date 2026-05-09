import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FooterComponent = () => {
  return (
    <footer
      className='text-light py-4 mt-5'
      style={{ backgroundColor: '#3b2f2f' }}
    >
      <Container>
        <Row className='gy-4'>
          {/* BRAND */}
          <Col md={4}>
            <h5 className='fw-bold'>Arihant Clutches</h5>
            <p style={{ fontSize: '0.95rem' }}>
              Premium purses and clutches crafted for elegance and everyday
              style.
            </p>
          </Col>

          {/* QUICK LINKS */}
          <Col md={4}>
            <h5 className='fw-bold'>Quick Links</h5>
            <ul className='list-unstyled'>
              <li>
                <Link to='/' className='text-light text-decoration-none'>
                  Home
                </Link>
              </li>

              <li>
                <Link to='/cart' className='text-light text-decoration-none'>
                  Cart
                </Link>
              </li>

              <li>
                <Link to='/login' className='text-light text-decoration-none'>
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to='/register'
                  className='text-light text-decoration-none'
                >
                  Register
                </Link>
              </li>
            </ul>
          </Col>

          {/* CONTACT */}
          <Col md={4}>
            <h5 className='fw-bold'>Contact</h5>
            <p className='mb-1'>Sneha Kothari</p>
            <p className='mb-1'>support@arihantclutches.com</p>
            <p className='mb-0'>+91 98765 43210</p>
          </Col>
        </Row>

        <hr className='border-light my-4' />

        <div className='text-center'>
          © {new Date().getFullYear()} Arihant Clutches. All rights reserved.
        </div>
      </Container>
    </footer>
  );
};

export default FooterComponent;
