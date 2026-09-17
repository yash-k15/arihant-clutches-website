import '../../assets/styles/components/InformationPages.css';

const WholesaleOrdersScreen = () => {
  return (
    <div className='info-page'>
      <div className='info-page-header'>
        <h1>Wholesale Orders</h1>
        <p>
          Looking to purchase Arihant Clutches in larger quantities? We offer
          wholesale ordering for eligible orders.
        </p>
      </div>

      <div className='info-page-content'>
        <section className='info-page-section'>
          <h2>Wholesale Eligibility</h2>

          <p>
            Orders containing more than 15 or more items are eligible for
            wholesale.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>How to Place a Wholesale Order</h2>

          <p>
            If you are interested in placing a wholesale order, please contact
            us with the products you are interested in and the required
            quantities.
          </p>

          <p>You can contact us through Call/ Message/ WhatsApp/ Instagram.</p>

          <p>
            Our team will get in touch with you to discuss your order and
            provide further details.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Wholesale Pricing</h2>

          <p>
            Wholesale pricing and other order details will be discussed directly
            with our team based on your requirements.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Shipping</h2>

          <p>
            Shipping details and charges for wholesale orders will be discussed
            separately based on the order quantity and delivery requirements.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Contact Us</h2>

          <p>
            For international orders or any questions, please contact us using
            the details below.
          </p>

          <p>
            <strong>WhatsApp:</strong> +919909025236
          </p>

          <p>
            <strong>Instagram:</strong>{' '}
            https://www.instagram.com/_clutches_arihant_fashions/
          </p>

          <p>
            <strong>Email:</strong> support@arihantclutches.com
          </p>
        </section>
      </div>
    </div>
  );
};

export default WholesaleOrdersScreen;
