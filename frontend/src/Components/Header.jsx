import { useState } from 'react';
import { Badge, Container, NavDropdown, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { useLogoutMutation } from '../slices/usersApiSlice.js';
import { logout } from '../slices/authSlice.js';

import SearchBox from './SearchBox.jsx';
import logo from '../assets/logo.png';
import AuthModal from './AuthModal.jsx';
import { useCartDrawer } from './CartDrawerContext.jsx';

import '../assets/styles/components/Header.css';
import '../assets/styles/components/SearchBox.css';
// import { clearCartItems } from '../slices/cartSlice.js';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { openCart } = useCartDrawer();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [logoutApiCall] = useLogoutMutation();

  const cartQuantity = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  const openAuthModal = () => {
    closeMobileMenu();
    setShowAuthModal(true);
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      closeMobileMenu();
      // dispatch(clearCartItems());
      navigate('/login');
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <header className='site-header'>
      {/* ========================================
          DESKTOP / TABLET HEADER
          ======================================== */}

      <div className='desktop-header'>
        <div className='header-top'>
          <Container>
            <div className='header-top-inner'>
              {/* Brand */}
              <Link to='/' className='header-brand'>
                <img
                  src={logo}
                  alt='Arihant Clutches'
                  className='header-logo'
                />

                <span>Arihant Clutches</span>
              </Link>

              {/* Actions */}
              <div className='header-actions'>
                <SearchBox />

                <button
                  type='button'
                  className='header-action header-cart'
                  aria-label='Shopping cart'
                  onClick={openCart}
                >
                  <FaShoppingCart />

                  {cartQuantity > 0 && (
                    <Badge className='header-cart-badge'>{cartQuantity}</Badge>
                  )}
                </button>

                {userInfo ? (
                  <NavDropdown
                    title={userInfo.name}
                    id='desktop-user-menu'
                    className='header-account'
                  >
                    <LinkContainer to='/profile'>
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>

                    <NavDropdown.Item onClick={logoutHandler}>
                      Logout
                    </NavDropdown.Item>
                  </NavDropdown>
                ) : (
                  <button
                    type='button'
                    className='header-action'
                    aria-label='Sign in'
                    onClick={openAuthModal}
                  >
                    <FaUser />
                  </button>
                )}

                {userInfo?.isAdmin && (
                  <NavDropdown
                    title='Admin'
                    id='desktop-admin-menu'
                    className='header-account'
                  >
                    <LinkContainer to='/admin/productlist'>
                      <NavDropdown.Item>Products</NavDropdown.Item>
                    </LinkContainer>

                    <LinkContainer to='/admin/userlist'>
                      <NavDropdown.Item>Users</NavDropdown.Item>
                    </LinkContainer>

                    <LinkContainer to='/admin/orderlist'>
                      <NavDropdown.Item>Orders</NavDropdown.Item>
                    </LinkContainer>
                  </NavDropdown>
                )}
              </div>
            </div>
          </Container>
        </div>

        {/* Main navigation */}
        <div className='header-navigation'>
          <Container>
            <nav className='header-nav'>
              <Link to='/products/new-arrivals' className='header-nav-link'>
                New Arrivals
              </Link>

              <Link to='/products/best-sellers' className='header-nav-link'>
                Best Sellers
              </Link>

              <Link to='/products/featured' className='header-nav-link'>
                Featured
              </Link>

              <div className='header-category'>
                <button type='button' className='header-category-toggle'>
                  Shop by Category
                </button>

                <div className='header-category-menu'>
                  {/* Dummy categories for now */}
                  <Link
                    to='/products/category/clutches'
                    className='header-category-item'
                  >
                    Clutches
                  </Link>

                  <Link
                    to='/products/category/handbags'
                    className='header-category-item'
                  >
                    Handbags
                  </Link>

                  <Link
                    to='/products/category/wallets'
                    className='header-category-item'
                  >
                    Wallets
                  </Link>

                  <Link
                    to='/products/category/accessories'
                    className='header-category-item'
                  >
                    Fashion Accessories
                  </Link>
                </div>
              </div>
            </nav>
          </Container>
        </div>
      </div>

      {/* ========================================
          MOBILE HEADER
          ======================================== */}

      <div className='mobile-header'>
        <Container fluid>
          <div className='mobile-header-inner'>
            <div className='mobile-header-left'>
              <button
                type='button'
                className='mobile-menu-button'
                aria-label='Open menu'
                onClick={() => setShowMobileMenu(true)}
              >
                <FaBars />
              </button>
            </div>

            <Link to='/' className='mobile-brand'>
              <img src={logo} alt='Arihant Clutches' className='mobile-logo' />

              <span>Arihant Clutches</span>
            </Link>

            <div className='mobile-header-right'>
              <SearchBox />

              <button
                type='button'
                className='header-action header-cart'
                aria-label='Shopping cart'
                onClick={openCart}
              >
                <FaShoppingCart />

                {cartQuantity > 0 && (
                  <Badge className='header-cart-badge'>{cartQuantity}</Badge>
                )}
              </button>
            </div>
          </div>
        </Container>
      </div>

      {/* ========================================
          MOBILE DRAWER
          ======================================== */}

      <Offcanvas
        show={showMobileMenu}
        onHide={closeMobileMenu}
        placement='start'
        className='mobile-drawer'
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title className='mobile-drawer-brand'>
            <img
              src={logo}
              alt='Arihant Clutches'
              className='mobile-drawer-logo'
            />

            <span>Arihant Clutches</span>
          </Offcanvas.Title>
        </Offcanvas.Header>

        <Offcanvas.Body>
          <nav className='mobile-nav'>
            <Link
              to='/products/new-arrivals'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              New Arrivals
            </Link>

            <Link
              to='/products/best-sellers'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              Best Sellers
            </Link>

            <Link
              to='/products/featured'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              Featured
            </Link>

            <div className='mobile-nav-section'>Shop by Category</div>

            {/* Dummy categories for now */}
            <Link
              to='/products/category/clutches'
              className='mobile-nav-link mobile-category-link'
              onClick={closeMobileMenu}
            >
              Clutches
            </Link>

            <Link
              to='/products/category/handbags'
              className='mobile-nav-link mobile-category-link'
              onClick={closeMobileMenu}
            >
              Handbags
            </Link>

            <Link
              to='/products/category/wallets'
              className='mobile-nav-link mobile-category-link'
              onClick={closeMobileMenu}
            >
              Wallets
            </Link>

            <Link
              to='/products/category/accessories'
              className='mobile-nav-link mobile-category-link'
              onClick={closeMobileMenu}
            >
              Fashion Accessories
            </Link>

            <div className='mobile-account-section'>
              <div className='mobile-nav-section'>Account</div>

              {userInfo ? (
                <>
                  <Link
                    to='/profile'
                    className='mobile-nav-link'
                    onClick={closeMobileMenu}
                  >
                    Profile
                  </Link>

                  <button
                    type='button'
                    className='mobile-nav-link mobile-logout'
                    onClick={logoutHandler}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  type='button'
                  className='mobile-nav-link mobile-logout'
                  onClick={openAuthModal}
                >
                  <FaUser style={{ marginRight: '10px' }} />
                  Sign In
                </button>
              )}
            </div>

            {userInfo?.isAdmin && (
              <>
                <div className='mobile-nav-section'>Admin</div>

                <Link
                  to='/admin/productlist'
                  className='mobile-nav-link'
                  onClick={closeMobileMenu}
                >
                  Products
                </Link>

                <Link
                  to='/admin/userlist'
                  className='mobile-nav-link'
                  onClick={closeMobileMenu}
                >
                  Users
                </Link>

                <Link
                  to='/admin/orderlist'
                  className='mobile-nav-link'
                  onClick={closeMobileMenu}
                >
                  Orders
                </Link>
              </>
            )}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>

      <AuthModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </header>
  );
};

export default Header;
