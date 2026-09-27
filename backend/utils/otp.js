import crypto from 'crypto';

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 60;

const generateOTP = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

const verifyOTP = (otp, otpHash) => {
  const hashedOtp = hashOTP(otp);

  return crypto.timingSafeEqual(
    Buffer.from(hashedOtp, 'hex'),
    Buffer.from(otpHash, 'hex'),
  );
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
