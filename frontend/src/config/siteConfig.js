// Centralized, client-specific website identity and presentation settings.
// Keep frontend-only values here; backend configuration lives separately.
const siteConfig = {
  business: {
    timezone: 'Asia/Kolkata',
  },
  brand: {
    name: 'Arihant Clutches',
    tagline:
      'Premium purses and clutches crafted for elegance and everyday style.',
  },
  seo: {
    description:
      'Discover elegant clutches and handbags from Arihant Clutches. Shop the latest collection of handcrafted, stylish and premium clutches.',
    keywords: 'clutches, purses, handbags, clutch bags, Arihant Clutches',
    siteUrl: 'https://arihantclutches.com',
    socialImage: 'https://arihantclutches.com/social-image.jpg',
  },
  assets: {
    logoUrl:
      'https://res.cloudinary.com/arihantclutches/image/upload/v1791025149/Arihant_Clutches_Logo.png',
  },
  contact: {
    name: 'Sneha Kothari',
    email: 'arihantfashionsindia@gmail.com',
    phoneDisplay: '+91 99090 25236',
    phoneLink: '+919909025236',
  },
  social: {
    instagramUrl: 'https://www.instagram.com/_clutches_arihant_fashions/',
  },
  developer: {
    credit: 'Website is designed and developed by Yash Kothari',
    email: 'kothariyash49@gmail.com',
    phoneDisplay: '+91 9167015147',
    phoneLink: '+919167015147',
  },
  theme: {
    color: '#2c2222',
    razorpayColor: '#b08d57',
  },
};

export default siteConfig;
