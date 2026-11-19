import dotenv from 'dotenv';

dotenv.config();

// Essential backend configuration.
// Keep this list limited to variables required by the application's core
// integrations and currently implemented functionality.
const requiredEnvVariables = [
  'MONGO_URI',
  'JWT_SECRET',
  'CLIENT_URL',

  // Cloudinary
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',

  // Razorpay
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',

  // General email
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_EMAIL',
  'SMTP_PASSWORD',
  'FROM_NAME',
  'FROM_EMAIL',

  // Authentication email
  'AUTH_SMTP_HOST',
  'AUTH_SMTP_PORT',
  'AUTH_SMTP_EMAIL',
  'AUTH_SMTP_PASSWORD',
  'AUTH_FROM_NAME',
  'AUTH_FROM_EMAIL',
];

const missingVariables = requiredEnvVariables.filter(
  (variable) => !process.env[variable]?.trim(),
);

if (missingVariables.length > 0) {
  console.error('\nMissing required environment variables:');
  missingVariables.forEach((variable) => {
    console.error(`- ${variable}`);
  });

  console.error('\nPlease configure these variables in your .env file.\n');
  process.exit(1);
}

console.log('Environment configuration validated.');
