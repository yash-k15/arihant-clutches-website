import asyncHandler from '../middleware/asyncHandler.js';
import sendEmail from '../utils/sendEmail.js';
import isValidEmail from '../utils/emailValidator.js';
import {
  isValidIndianPhone,
  validateString,
} from '../utils/inputValidation.js';

const sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const nameValidation = validateString(name, {
    required: true,
    min: 2,
    max: 100,
  });

  if (!nameValidation.valid) {
    return res.status(400).json({
      message: 'Name must be between 2 and 100 characters',
    });
  }

  if (typeof email !== 'string' || !isValidEmail(email.trim())) {
    return res.status(400).json({
      message: 'Please provide a valid email address',
    });
  }

  if (phone !== undefined && phone !== null && phone !== '') {
    if (typeof phone !== 'string' || !isValidIndianPhone(phone.trim())) {
      return res.status(400).json({
        message: 'Please provide a valid mobile number',
      });
    }
  }

  const subjectLabels = {
    general: 'General Enquiry',
    order: 'Order Related',
    product: 'Product Enquiry',
    wholesale: 'Wholesale Enquiry',
    international: 'International Order',
    other: 'Other',
  };

  if (typeof subject !== 'string' || !subjectLabels[subject]) {
    return res.status(400).json({
      message: 'Please select a valid subject',
    });
  }

  const messageValidation = validateString(message, {
    required: true,
    min: 10,
    max: 5000,
  });

  if (!messageValidation.valid) {
    return res.status(400).json({
      message: 'Message must be between 10 and 5000 characters',
    });
  }

  const normalizedName = nameValidation.value;
  const normalizedEmail = email.trim();
  const normalizedPhone = phone?.trim() || '';

  const replyTo = normalizedEmail;

  const subjectLabel = subjectLabels[subject];

  await sendEmail({
    email: process.env.SMTP_EMAIL,
    replyTo,
    subject: `${subjectLabel} — ${normalizedName}`,
    message: `
New contact form enquiry

Name: ${normalizedName}
Email: ${normalizedEmail}
Phone: ${normalizedPhone || 'Not provided'}
Subject: ${subjectLabel}

Message:
${messageValidation.value}
    `.trim(),
  });

  res.status(200).json({
    message: 'Your message has been sent successfully',
  });
});

export { sendContactMessage };
