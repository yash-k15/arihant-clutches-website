import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './Components/Header';
import FooterComponent from './Components/FooterComponent';
import { CartDrawerProvider } from './Components/CartDrawerContext.jsx';

const App = () => {
  return (
    <>
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
    </>
  );
};

export default App;
