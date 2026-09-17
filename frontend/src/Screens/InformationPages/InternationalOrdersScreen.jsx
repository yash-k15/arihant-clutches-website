import '../../assets/styles/components/InformationPages.css';

const InternationalOrdersScreen = () => {
  return (
    <div className='info-page'>
      <div className='info-page-header'>
        <h1>International Orders</h1>
        <p>
          We currently accept international orders through a manual ordering
          process.
        </p>
      </div>

      <div className='info-page-content'>
        <section className='info-page-section'>
          <h2>How to Place an Order</h2>

          <p>
            If you are interested in placing an international order, please
            contact us with the products you are interested in purchasing.
          </p>

          <p>You can contact us through Call/ Message/ WhatsApp/ Instagram.</p>

          <p>
            Our team will confirm product availability and provide you with the
            details required to proceed with your order.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>International Shipping Charges</h2>

          <p>
            International shipping charges are calculated separately based on
            the destination, package weight, dimensions, and applicable courier
            charges.
          </p>

          <p>
            The shipping cost will be communicated to you before the order is
            confirmed.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Payment</h2>

          <p>
            Once the product availability and shipping charges have been
            confirmed, our team will provide you with the necessary payment
            details to complete your order.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Customs &amp; Import Charges</h2>

          <p>
            International orders may be subject to customs duties, import taxes,
            or other charges imposed by the destination country.
          </p>

          <p>
            Any customs duties, import taxes, or other charges applicable to the
            shipment are the responsibility of the customer.
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

export default InternationalOrdersScreen;
