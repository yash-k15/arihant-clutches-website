import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';
import FooterComponent from './Components/FooterComponent';
import { CartDrawerProvider } from './Components/CartDrawerContext.jsx';
import { CheckoutProvider } from './Components/Checkout/CheckoutContext.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';
import { AuthModalProvider } from './Components/AuthModalContext.jsx';

const App = () => {
  return (
    <>
      <CheckoutProvider>
        <AuthModalProvider>
          <CartDrawerProvider>
            <Header />
            <main className='py-3'>
              <Container>
                <Outlet />
              </Container>
            </main>
            <FooterComponent />
            <ToastContainer />
          </CartDrawerProvider>
        </AuthModalProvider>
        <Checkout />
      </CheckoutProvider>
    </>
  );
};

export default App;
