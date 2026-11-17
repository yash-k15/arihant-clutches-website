// Centralized, client-specific identity settings used by backend emails.
// Keep backend-only values here; frontend configuration lives separately.
const siteConfig = {
  brandName: 'Arihant Clutches',
  supportEmail: 'arihantfashionsindia@gmail.com',
  emailLogoUrl:
    'https://res.cloudinary.com/arihantclutches/image/upload/v1791025149/Arihant_Clutches_Logo.png',
  emailSubjects: {
    orderConfirmation: 'Order Confirmation from Arihant Clutches',
    passwordReset: 'Reset your Arihant Clutches password',
    loginOtp: 'Your Arihant Clutches Login OTP',
  },
};

export default siteConfig;
