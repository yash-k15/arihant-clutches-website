import { useState } from 'react';
import { Badge, Container, NavDropdown, Offcanvas } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaBars, FaRegHeart, FaShoppingCart, FaUser } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';

import { useLogoutMutation } from '../slices/usersApiSlice.js';
import { useGetCategoriesQuery } from '../slices/productsApiSlice.js';
import { logout } from '../slices/authSlice.js';

import SearchBox from './SearchBox.jsx';
import logo from '../assets/logo.png';
import { useCartDrawer } from './CartDrawerContext.jsx';
import { useAuthModal } from './AuthModalContext.jsx';

import '../assets/styles/components/Header.css';
import '../assets/styles/components/SearchBox.css';
// import { clearCartItems } from '../slices/cartSlice.js';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  const { data: categories = [] } = useGetCategoriesQuery();

  const { openCart } = useCartDrawer();
  const { openAuth } = useAuthModal();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileCategories, setShowMobileCategories] = useState(false);

  const [logoutApiCall] = useLogoutMutation();

  const cartQuantity = cartItems.reduce((acc, curr) => acc + curr.qty, 0);

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
    setShowMobileCategories(false);
  };

  const openAuthModal = () => {
    closeMobileMenu();
    openAuth();
  };

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      closeMobileMenu();
      // dispatch(clearCartItems());
      navigate('/');
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

                <Link
                  to='/wishlist'
                  className='header-action header-wishlist'
                  aria-label='Wishlist'
                >
                  <FaRegHeart />
                </Link>

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
              <Link to='/products' className='header-nav-link'>
                All Products
              </Link>

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
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products/category/${category.slug}`}
                      className='header-category-item'
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>

              <Link to='/international-orders' className='header-nav-link'>
                International Orders
              </Link>

              <Link to='/wholesale-orders' className='header-nav-link'>
                Wholesale
              </Link>
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

              <Link
                to='/wishlist'
                className='header-action header-wishlist'
                aria-label='Wishlist'
              >
                <FaRegHeart />
              </Link>

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
              to='/products'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              All Products
            </Link>

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

            <div className='mobile-category-section'>
              <button
                type='button'
                className='mobile-category-toggle'
                onClick={() => setShowMobileCategories((prev) => !prev)}
                aria-expanded={showMobileCategories}
              >
                <span>Shop by Category</span>

                <span
                  className={`mobile-category-arrow ${
                    showMobileCategories ? 'open' : ''
                  }`}
                >
                  ▾
                </span>
              </button>

              {showMobileCategories && (
                <div className='mobile-category-list'>
                  {categories.map((category) => (
                    <Link
                      key={category._id}
                      to={`/products/category/${category.slug}`}
                      className='mobile-nav-link mobile-category-link'
                      onClick={closeMobileMenu}
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              to='/international-orders'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              International Orders
            </Link>

            <Link
              to='/wholesale-orders'
              className='mobile-nav-link'
              onClick={closeMobileMenu}
            >
              Wholesale
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
    </header>
  );
};

export default Header;
