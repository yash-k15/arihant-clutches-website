const otpEmail = (otp, expiryMinutes) => {
  return `
    <h2>Your Arihant Fashion Login OTP</h2>

    <p>Your one-time password (OTP) is:</p>

    <h1>${otp}</h1>

    <p>This OTP is valid for ${expiryMinutes} minutes.</p>

    <p>
      If you did not request this OTP, you can safely ignore this email.
    </p>

    <p>
      For your security, do not share this OTP with anyone.
    </p>
  `;
};

export default otpEmail;
