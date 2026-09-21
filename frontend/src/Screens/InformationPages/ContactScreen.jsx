import { useRef } from 'react';
import { FaInstagram, FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import { FiArrowRight, FiChevronDown, FiMail } from 'react-icons/fi';

import '../../assets/styles/components/ContactScreen.css';

const ContactScreen = () => {
  const formRef = useRef(null);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className='contact-page'>
      {/* ============================================== */}
      {/* CONTACT HEADER                                 */}
      {/* ============================================== */}

      <section className='contact-hero'>
        <p className='contact-eyebrow'>REACH OUT</p>

        <h1 className='contact-title'>How Can We Help?</h1>
      </section>

      {/* ============================================== */}
      {/* CONTACT OPTIONS                                */}
      {/* ============================================== */}

      <section className='contact-options'>
        <div
          className='contact-card'
          onClick={scrollToForm}
          role='button'
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              scrollToForm();
            }
          }}
        >
          <div className='contact-card-icon'>
            <FiMail />
          </div>

          <h2>Email Us</h2>

          <p className='contact-card-value'>hello@arihantclutches.com</p>

          <p className='contact-card-description'>
            Send us your query and our team will get back to you.
          </p>

          <span className='contact-card-link'>
            SEND EMAIL <FiArrowRight />
          </span>
        </div>

        <a
          href='https://wa.me/919909025236'
          target='_blank'
          rel='noreferrer'
          className='contact-card'
        >
          <div className='contact-card-icon'>
            <FaWhatsapp />
          </div>

          <h2>WhatsApp</h2>

          <p className='contact-card-value'>+91 99090 25236</p>

          <p className='contact-card-description'>
            Quick chat available for any questions.
          </p>

          <span className='contact-card-link'>
            CHAT NOW
            <FiArrowRight />
          </span>
        </a>

        <a href='tel:+919909025236' className='contact-card'>
          <div className='contact-card-icon'>
            <FaPhoneAlt />
          </div>

          <h2>Call Us</h2>

          <p className='contact-card-value'>+91 99090 25236</p>

          <p className='contact-card-description'>Mon - Sat, 10am - 7pm</p>

          <span className='contact-card-link'>
            CALL NOW
            <FiArrowRight />
          </span>
        </a>

        <a
          href='https://www.instagram.com/_clutches_arihant_fashions/'
          target='_blank'
          rel='noreferrer'
          className='contact-card'
        >
          <div className='contact-card-icon'>
            <FaInstagram />
          </div>

          <h2>Social Media</h2>

          <p className='contact-card-value'>@_clutches_arihant_fashions</p>

          <p className='contact-card-description'>
            Follow us for new arrivals and updates.
          </p>

          <span className='contact-card-link'>
            FOLLOW US
            <FiArrowRight />
          </span>
        </a>
      </section>

      {/* ============================================== */}
      {/* CONTACT FORM                                  */}
      {/* ============================================== */}

      <section id='contact-form' className='contact-form-section' ref={formRef}>
        <div className='contact-form-header'>
          <p className='contact-eyebrow'>SEND A MESSAGE</p>

          <h2 className='contact-form-title'>Get In Touch</h2>

          <p className='contact-form-description'>
            Fill in the form below and our team will get back to you within 24
            hours.
          </p>
        </div>

        <form className='contact-form'>
          <div className='contact-form-grid'>
            <input type='text' placeholder='Your Name' aria-label='Your Name' />

            <input
              type='email'
              placeholder='Email Address'
              aria-label='Email Address'
            />

            <input
              type='tel'
              placeholder='Phone Number'
              aria-label='Phone Number'
            />

            <div className='contact-form-select'>
              <select defaultValue='' aria-label='Subject'>
                <option value='' disabled>
                  Subject
                </option>
                <option value='general'>General Enquiry</option>
                <option value='order'>Order Related</option>
                <option value='product'>Product Enquiry</option>
                <option value='wholesale'>Wholesale Enquiry</option>
                <option value='international'>International Order</option>
                <option value='other'>Other</option>
              </select>

              <FiChevronDown className='contact-form-select-icon' />
            </div>
          </div>

          <textarea
            placeholder='Your Message'
            aria-label='Your Message'
            rows='7'
          />

          <button type='submit' className='contact-form-submit'>
            SEND MESSAGE
            <FiArrowRight />
          </button>
        </form>
      </section>
    </div>
  );
};

export default ContactScreen;
