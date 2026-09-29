import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getOtpHashSecret = () => {
  const secret = process.env.OTP_HASH_SECRET;

  if (!secret) {
    throw new Error('OTP_HASH_SECRET is not configured');
  }

  return secret;
};

const hashOTP = (otp) => {
  return crypto
    .createHmac('sha256', getOtpHashSecret())
    .update(otp)
    .digest('hex');
};

const verifyOTP = (otp, otpHash) => {
  const hashedOtp = hashOTP(otp);

  const hashedOtpBuffer = Buffer.from(hashedOtp, 'hex');
  const storedHashBuffer = Buffer.from(otpHash, 'hex');

  if (hashedOtpBuffer.length !== storedHashBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashedOtpBuffer, storedHashBuffer);
};

export {
  OTP_LENGTH,
  OTP_EXPIRY_MINUTES,
  MAX_OTP_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SECONDS,
  generateOTP,
  hashOTP,
  verifyOTP,
};
