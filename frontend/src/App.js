import { Container } from 'react-bootstrap';
import Header from './Components/Header';
import Footer from './Components/Footer';

const App = () => {
  return (
    <>
      <Header />
      <main className='py-3'>
        <Container>
          <h1>Welcome to the Website</h1>;
        </Container>
      </main>
      <Footer />
    </>
  );
};

export default App;
