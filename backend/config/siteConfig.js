// Centralized, client-specific identity and email presentation settings.
// Keep backend-only values here; frontend configuration lives separately.
const siteConfig = {
  brandName: 'Arihant Clutches',
  websiteUrl: 'https://arihantclutches.com',
  supportEmail: 'arihantfashionsindia@gmail.com',
  emailLogoUrl: 'https://res.cloudinary.com/arihantclutches/image/upload/v1791025149/Arihant_Clutches_Logo.png',
  emailColors: {
    primary: '#2c2222', accent: '#b08d57', background: '#f7f3ee',
    text: '#6f6258', muted: '#8a7b6d', subtle: '#9a8979',
    border: '#e8ddcd', lightBorder: '#eee6dc', surface: '#fdfaf5',
    white: '#ffffff', footerText: '#cfc4b8', resetText: '#555555',
    resetMuted: '#777777', resetSubtle: '#999999', resetLink: '#8a6a3f',
    resetBackground: '#f7f5f2', resetBorder: '#e8e1d9',
    resetFooterBackground: '#faf9f7', resetDivider: '#eee8e2',
  },
  emailSubjects: {
    orderConfirmation: 'Order Confirmation from {brandName}',
    passwordReset: 'Reset your {brandName} password',
    loginOtp: 'Your {brandName} Login OTP',
  },
  emailFooter: { copyright: '© {year} {brandName}. All rights reserved.' },
};

export default siteConfig;
