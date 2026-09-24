import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';

const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name?.trim()) {
    return res.status(400).json({
      message: 'Name is required',
    });
  }

  if (!email?.trim()) {
    return res.status(400).json({
      message: 'Email is required',
    });
  }

  if (!subject) {
    return res.status(400).json({
      message: 'Subject is required',
    });
  }

  if (!message?.trim()) {
    return res.status(400).json({
      message: 'Message is required',
    });
  }

  const replyTo = email.trim();

  const subjectLabels = {
    general: 'General Enquiry',
    order: 'Order Related',
    product: 'Product Enquiry',
    wholesale: 'Wholesale Enquiry',
    international: 'International Order',
    other: 'Other',
  };

  const subjectLabel = subjectLabels[subject] || subject;

  await sendEmail({
    email: process.env.SMTP_EMAIL,
    replyTo,
    subject: `${subjectLabel} — ${name.trim()}`,
    message: `
New contact form enquiry

Name: ${name.trim()}
Email: ${email.trim()}
Phone: ${phone?.trim() || 'Not provided'}
Subject: ${subjectLabel}

Message:
${message.trim()}
    `.trim(),
  });

  res.status(200).json({
    message: 'Your message has been sent successfully',
  });
});

export { sendContactMessage };
