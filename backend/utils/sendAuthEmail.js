import nodemailer from 'nodemailer';
import isValidEmail from './emailValidator.js';

const sendAuthEmail = async (options) => {
  if (!isValidEmail(options?.email)) {
    throw new Error('Invalid email recipient');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.AUTH_SMTP_HOST,
    port: Number(process.env.AUTH_SMTP_PORT),
    secure: true,
    auth: {
      user: process.env.AUTH_SMTP_EMAIL,
      pass: process.env.AUTH_SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.AUTH_FROM_NAME} <${process.env.AUTH_FROM_EMAIL}>`,
    to: options.email,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Auth email sent: %s', info.messageId);
};

export default sendAuthEmail;
