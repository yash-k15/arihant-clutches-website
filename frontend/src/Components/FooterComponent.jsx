import siteConfig from '../config/siteConfig.js';
import { Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaInstagram } from 'react-icons/fa';

import { useAuthModal } from './AuthModalContext.jsx';

import '../assets/styles/components/Footer.css';

const FooterComponent = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const navigate = useNavigate();
  const { openAuth } = useAuthModal();

  return (
    <footer className='footer-section'>
      <Container>
        {/* SOCIAL */}
        <div className='footer-social'>
          <p className='footer-social-label'>FOLLOW US</p>

          <a
            href={siteConfig.social.instagramUrl}
            target='_blank'
            rel='noreferrer'
            className='footer-social-link'
            aria-label='Instagram'
          >
            <FaInstagram />
          </a>
        </div>

        <div className='footer-divider' />

        {/* MAIN FOOTER */}
        <Row className='footer-main gy-4'>
          {/* BRAND */}
          <Col lg={4} md={6}>
            <div className='footer-brand'>
              <h5 className='footer-heading footer-brand-heading'>
                {siteConfig.brand.name}
              </h5>

              <span className='footer-heading-accent' />

              <p className='footer-text'>{siteConfig.brand.tagline}</p>

              <div className='footer-developer'>
                <p className='footer-developer-credit'>
                  {siteConfig.developer.credit}
                </p>

                <a
                  href={`mailto:${siteConfig.developer.email}`}
                  className='footer-developer-link'
                >
                  {siteConfig.developer.email}
                </a>

                <a href={`tel:${siteConfig.developer.phoneLink}`} className='footer-developer-link'>
                  {siteConfig.developer.phoneDisplay}
                </a>
              </div>
            </div>
          </Col>

          {/* SHOP */}
          <Col lg={2} md={6}>
            <h5 className='footer-heading'>Shop</h5>
            <span className='footer-heading-accent' />

            <ul className='footer-links list-unstyled'>
              <li>
                <Link to='/' className='footer-link'>
                  Home
                </Link>
              </li>

              <li>
                <Link to='/products' className='footer-link'>
                  Shop All
                </Link>
              </li>

              <li>
                <Link to='/cart' className='footer-link'>
                  Cart
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
                <li>
                  <button
                    type='button'
                    className='footer-link footer-auth-btn'
                    onClick={() => navigate('/profile')}
                  >
                    My Account
                  </button>
                </li>
              )}
            </ul>
          </Col>

          {/* INFORMATION */}
          <Col lg={3} md={6}>
            <h5 className='footer-heading'>Information</h5>
            <span className='footer-heading-accent' />

            <ul className='footer-links list-unstyled'>
              <li>
                <Link to='/shipping-policy' className='footer-link'>
                  Shipping Policy
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

              <li>
                <Link to='/contact' className='footer-link'>
                  Contact Us
                </Link>
              </li>
            </ul>
          </Col>

          {/* CONTACT */}
          <Col lg={3} md={6}>
            <h5 className='footer-heading'>Contact</h5>
            <span className='footer-heading-accent' />

            <div className='footer-contact'>
              <p className='footer-contact-name'>{siteConfig.contact.name}</p>

              <a
                href={`mailto:${siteConfig.contact.email}`}
                className='footer-contact-link'
              >
                {siteConfig.contact.email}
              </a>

              <a href={`tel:${siteConfig.contact.phoneLink}`} className='footer-contact-link'>
                {siteConfig.contact.phoneDisplay}
              </a>
            </div>
          </Col>
        </Row>

        <div className='footer-divider footer-divider-bottom' />

        {/* FOOTER BOTTOM */}
        <div className='footer-bottom'>
          <span>
            © {new Date().getFullYear()} {siteConfig.brand.name}. All rights reserved.
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default FooterComponent;
