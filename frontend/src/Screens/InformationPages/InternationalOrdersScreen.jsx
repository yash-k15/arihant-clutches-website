import { Link } from 'react-router-dom';

import '../../assets/styles/components/InformationPages.css';

const InternationalOrdersScreen = () => {
  return (
    <div className='info-page info-page-orders'>
      <div className='info-page-header'>
        <span className='info-page-eyebrow'>SHOP WITH US</span>

        <h1>International Orders</h1>

        <p>
          We currently accept international orders through a manual ordering
          process.
        </p>
      </div>

      <div className='info-page-content'>
        <section className='info-page-section info-page-feature'>
          <div>
            <h2>How to Place an Order</h2>

            <p>
              If you are interested in placing an international order, please
              contact us with the products you are interested in purchasing.
            </p>

            <p>
              You can contact us through WhatsApp or Instagram, or use our
              Contact Us form.
            </p>

            <p>
              Our team will confirm product availability and provide you with
              the details required to proceed with your order.
            </p>
          </div>
        </section>

        <div className='info-page-section-grid'>
          <section className='info-page-section info-page-card'>
            <h2>International Shipping Charges</h2>

            <p>
              International shipping charges are calculated separately based on
              the destination, package weight, dimensions, and applicable
              courier charges.
            </p>

            <p>
              The shipping cost will be communicated to you before the order is
              confirmed.
            </p>
          </section>

          <section className='info-page-section info-page-card'>
            <h2>Payment</h2>

            <p>
              Once the product availability and shipping charges have been
              confirmed, our team will provide you with the necessary payment
              details to complete your order.
            </p>
          </section>
        </div>

        <section className='info-page-section info-page-feature'>
          <div>
            <h2>Customs &amp; Import Charges</h2>

            <p>
              International orders may be subject to customs duties, import
              taxes, or other charges imposed by the destination country.
            </p>

            <p>
              Any customs duties, import taxes, or other charges applicable to
              the shipment are the responsibility of the customer.
            </p>
          </div>
        </section>

        <section className='info-page-contact'>
          <div>
            <span className='info-page-eyebrow'>NEED HELP?</span>

            <h2>Let's talk about your order.</h2>

            <p>
              Have questions about an international order? Get in touch with us
              and our team will help you with the next steps.
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

export default InternationalOrdersScreen;
