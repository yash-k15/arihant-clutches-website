import '../../assets/styles/components/InformationPages.css';

const ShippingPolicyScreen = () => {
  return (
    <div className='info-page info-page-shipping'>
      <div className='info-page-header'>
        <h1>Shipping Policy</h1>
      </div>

      <div className='info-page-content'>
        <section className='info-page-section'>
          <p>
            At Arihant Clutches, we are pleased to offer free shipping on all
            prepaid orders across India.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Order &amp; Address Details</h2>

          <p>
            Please ensure that your shipping address and contact details are
            entered correctly at the time of checkout. Once an order is
            confirmed, address changes cannot be accommodated.
          </p>

          <p>
            Arihant Clutches is not responsible for delays, lost shipments, or
            returns caused due to incorrect or incomplete addresses provided by
            the customer. If a parcel is returned to us due to an incomplete or
            incorrect address, or requires re-shipping for any reason, the
            additional shipping charges will be borne by the customer.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Delivery Timeline</h2>

          <p>
            Our standard delivery timeline is <strong>7–10 working days</strong>
            , depending on the delivery location.
          </p>

          <p>
            If you require your order by a specific date, we request you to DM
            us and confirm the delivery timeline before placing your order.
            Urgent orders should be placed only after delivery confirmation from
            our team.
          </p>

          <p>
            Please note that delivery timelines may be affected by factors
            beyond our control, such as festivals, local disturbances, strikes,
            or natural circumstances including heavy rains or floods. We
            appreciate your understanding in such cases.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>Order Tracking</h2>

          <p>
            Once your order is shipped, tracking details will be shared via
            email and/or the phone number provided at checkout.
          </p>

          <p>
            If your order is not delivered within the mentioned timeframe,
            please contact us so we can coordinate with our delivery partners
            and assist you promptly.
          </p>
        </section>

        <section className='info-page-section'>
          <h2>International Shipping</h2>

          <p>
            For shipping outside India, please contact us directly prior to
            placing your order.
          </p>
        </section>
      </div>
    </div>
  );
};

export default ShippingPolicyScreen;
