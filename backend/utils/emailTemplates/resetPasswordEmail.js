const resetPasswordEmail = (resetUrl) => {
  return `
    <h2>Password Reset</h2>

    <p>You are recieving this email because you have requested the reset of your password.</p>

    <p>
      Click the link below
      to reset your password:
    </p>

    <a href="${resetUrl}">
      Reset Password
    </a>
  `;
};

export default resetPasswordEmail;
