import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';
import FooterComponent from './Components/FooterComponent';
import { CartDrawerProvider } from './Components/CartDrawerContext.jsx';
import { CheckoutProvider } from './Components/Checkout/CheckoutContext.jsx';
import Checkout from './Components/Checkout/Checkout.jsx';

const App = () => {
  return (
    <>
      <CheckoutProvider>
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
        <Checkout />
      </CheckoutProvider>
    </>
  );
};

export default App;
