const products = [
  {
    name: 'Elegant Black Clutch',

    slug: 'elegant-black-clutch',

    image: '/images/bag-1.jpg',

    images: ['/images/bag-1.jpg', '/images/bag-2.jpg', '/images/bag-3.jpg'],

    brand: 'Arihant Clutches',

    category: 'Clutch',

    description:
      'Elegant black clutch designed for evening parties and special occasions.',

    material: 'PU Leather',

    price: 1499,

    countInStock: 12,

    featured: true,

    isNewArrival: true,

    isBestSeller: true,

    rating: 4.7,

    numReviews: 12,

    dimensions: {
      length: 28,
      width: 5,
      height: 14,
    },

    weight: 0.5,
  },

  {
    name: 'Rose Gold Party Purse',

    slug: 'rose-gold-party-purse',

    image: '/images/circle-1.jpg',

    images: [
      '/images/circle-1.jpg',
      '/images/circle-2.jpg',
      '/images/circle-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Purse',

    description:
      'Stylish rose gold purse perfect for weddings and festive occasions.',

    material: 'Synthetic Leather',

    price: 1999,

    countInStock: 8,

    featured: true,

    isNewArrival: true,

    isBestSeller: false,

    rating: 4.5,

    numReviews: 8,

    dimensions: {
      length: 30,
      width: 6,
      height: 16,
    },

    weight: 0.7,
  },

  {
    name: 'Classic Beige Handbag',

    slug: 'classic-beige-handbag',

    image: '/images/clutches-1.jpeg',

    images: [
      '/images/clutches-1.jpeg',
      '/images/clutches-2.jpg',
      '/images/clutches-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Handbag',

    description: 'Minimal beige handbag crafted for everyday elegance.',

    material: 'Vegan Leather',

    price: 2499,

    countInStock: 15,

    featured: false,

    isNewArrival: false,

    isBestSeller: true,

    rating: 4.8,

    numReviews: 20,

    dimensions: {
      length: 34,
      width: 10,
      height: 24,
    },

    weight: 0.9,
  },

  {
    name: 'Luxury Bridal Clutch',

    slug: 'luxury-bridal-clutch',

    image: '/images/handbag-1.jpg',

    images: [
      '/images/handbag-1.jpg',
      '/images/handbag-2.jpg',
      '/images/handbag-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Clutch',

    description: 'Premium embellished bridal clutch with elegant detailing.',

    material: 'Silk',

    price: 3499,

    countInStock: 5,

    featured: true,

    isNewArrival: false,

    isBestSeller: true,

    rating: 4.9,

    numReviews: 16,

    dimensions: {
      length: 26,
      width: 5,
      height: 13,
    },

    weight: 0.45,
  },

  {
    name: 'Casual Tan Sling Bag',

    slug: 'casual-tan-sling-bag',

    image: '/images/triangle-1.jpg',

    images: [
      '/images/triangle-1.jpg',
      '/images/triangle-2.jpg',
      '/images/triangle-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Sling Bag',

    description: 'Compact and trendy sling bag for everyday casual use.',

    material: 'PU Leather',

    price: 1799,

    countInStock: 18,

    featured: false,

    isNewArrival: true,

    isBestSeller: false,

    rating: 4.4,

    numReviews: 11,

    dimensions: {
      length: 22,
      width: 7,
      height: 18,
    },

    weight: 0.55,
  },

  {
    name: 'Premium Office Tote',

    slug: 'premium-office-tote',

    image: '/images/pouch-1.jpg',

    images: [
      '/images/pouch-1.jpg',
      '/images/pouch-2.jpg',
      '/images/pouch-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Tote Bag',

    description:
      'Spacious office tote bag designed for style and practicality.',

    material: 'Leather',

    price: 3999,

    countInStock: 7,

    featured: true,

    isNewArrival: false,

    isBestSeller: true,

    rating: 4.8,

    numReviews: 24,

    dimensions: {
      length: 38,
      width: 12,
      height: 28,
    },

    weight: 1.2,
  },

  {
    name: 'Compact Red Evening Bag',

    slug: 'compact-red-evening-bag',

    image: '/images/purse-1.jpg',

    images: [
      '/images/purse-1.jpg',
      '/images/purse-2.jpg',
      '/images/purse-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Evening Bag',

    description: 'Chic red evening bag perfect for dinner outings and parties.',

    material: 'Velvet',

    price: 1699,

    countInStock: 10,

    featured: false,

    isNewArrival: true,

    isBestSeller: false,

    rating: 4.3,

    numReviews: 6,

    dimensions: {
      length: 24,
      width: 5,
      height: 14,
    },

    weight: 0.4,
  },

  {
    name: 'Designer Pearl Clutch',

    slug: 'designer-pearl-clutch',

    image: '/images/samosa-1.jpg',

    images: [
      '/images/samosa-1.jpg',
      '/images/samosa-2.jpg',
      '/images/samosa-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Clutch',

    description: 'Beautiful pearl embellished clutch for luxurious occasions.',

    material: 'Silk',

    price: 2899,

    countInStock: 6,

    featured: true,

    isNewArrival: false,

    isBestSeller: true,

    rating: 4.9,

    numReviews: 14,

    dimensions: {
      length: 27,
      width: 4,
      height: 12,
    },

    weight: 0.42,
  },

  {
    name: 'Minimal White Shoulder Bag',

    slug: 'minimal-white-shoulder-bag',

    image: '/images/square-1.jpg',

    images: [
      '/images/square-1.jpg',
      '/images/square-2.jpg',
      '/images/square-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Shoulder Bag',

    description: 'Modern minimalist shoulder bag with clean elegant styling.',

    material: 'Vegan Leather',

    price: 2299,

    countInStock: 14,

    featured: false,

    isNewArrival: true,

    isBestSeller: false,

    rating: 4.5,

    numReviews: 9,

    dimensions: {
      length: 32,
      width: 8,
      height: 20,
    },

    weight: 0.8,
  },

  {
    name: 'Luxury Maroon Potli Bag',

    slug: 'luxury-maroon-potli-bag',

    image: '/images/potli-1.jpg',

    images: [
      '/images/potli-1.jpg',
      '/images/potli-2.jpg',
      '/images/potli-3.jpg',
    ],

    brand: 'Arihant Clutches',

    category: 'Potli Bag',

    description: 'Traditional maroon potli bag with premium embroidery work.',

    material: 'Velvet',

    price: 1899,

    countInStock: 9,

    featured: true,

    isNewArrival: false,

    isBestSeller: true,

    rating: 4.8,

    numReviews: 18,

    dimensions: {
      length: 20,
      width: 8,
      height: 20,
    },

    weight: 0.35,
  },
];

export default products;
