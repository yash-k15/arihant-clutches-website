import { Link } from 'react-router-dom';

import '../../assets/styles/components/InformationPages.css';

const WholesaleOrdersScreen = () => {
  return (
    <div className='info-page info-page-orders'>
      <div className='info-page-header'>
        <span className='info-page-eyebrow'>BUSINESS ORDERS</span>

        <h1>Wholesale Orders</h1>

        <p>
          Looking to purchase Arihant Clutches in larger quantities? We offer
          wholesale ordering for eligible orders.
        </p>
      </div>

      <div className='info-page-content'>
        <section className='info-page-section info-page-feature'>
          <div>
            <h2>Wholesale Eligibility</h2>

            <p>
              Orders containing more than 15 items are eligible for wholesale.
            </p>
          </div>
        </section>

        <section className='info-page-section info-page-feature'>
          <div>
            <h2>How to Place a Wholesale Order</h2>

            <p>
              If you are interested in placing a wholesale order, please contact
              us with the products you are interested in and the required
              quantities.
            </p>

            <p>
              You can contact us through WhatsApp or Instagram, or use our
              Contact Us form.
            </p>

            <p>
              Our team will get in touch with you to discuss your order and
              provide further details.
            </p>
          </div>
        </section>

        <div className='info-page-section-grid'>
          <section className='info-page-section info-page-card'>
            <h2>Wholesale Pricing</h2>

            <p>
              Wholesale pricing and other order details will be discussed
              directly with our team based on your requirements.
            </p>
          </section>

          <section className='info-page-section info-page-card'>
            <h2>Shipping</h2>

            <p>
              Shipping details and charges for wholesale orders will be
              discussed separately based on the order quantity and delivery
              requirements.
            </p>
          </section>
        </div>

        <section className='info-page-contact'>
          <div>
            <span className='info-page-eyebrow'>READY TO DISCUSS?</span>

            <h2>Let's talk about your wholesale order.</h2>

            <p>
              Share the products and quantities you are interested in, and our
              team will get in touch with you.
            </p>
          </div>

          <div className='info-page-contact-details'>
            <a href='tel:+919909025236'>
              <strong>WhatsApp</strong>
              <span>+91 99090 25236</span>
            </a>

            <a
              href='https://www.instagram.com/_clutches_arihant_fashions/'
              target='_blank'
              rel='noreferrer'
            >
              <strong>Instagram</strong>
              <span>@_clutches_arihant_fashions</span>
            </a>

            <a href='mailto:arihantfashionsindia@gmail.com'>
              <strong>Email</strong>
              <span>arihantfashionsindia@gmail.com</span>
            </a>
          </div>

          <Link to='/contact' className='info-page-contact-btn'>
            CONTACT US
            <span>→</span>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default WholesaleOrdersScreen;
