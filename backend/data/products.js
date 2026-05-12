const products = [
  {
    name: 'Velvet Evening Clutch',
    brand: 'Arihant Clutches',
    category: 'Evening Bags',
    description:
      'Elegant velvet clutch designed for weddings, parties, and formal evenings.',
    material: 'Velvet',
    dimensions: '10 x 5 x 2 inches',
    weight: 0.45,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    variants: [
      {
        color: 'Black',
        price: 2499,
        countInStock: 12,
        images: ['/images/bag-1.jpg', '/images/bag-2.jpg'],
      },
      {
        color: 'Maroon',
        price: 2599,
        countInStock: 8,
        images: ['/images/circle-1.jpg', '/images/circle-2.jpg'],
      },
    ],
  },

  {
    name: 'Crystal Shine Party Bag',
    brand: 'Arihant Clutches',
    category: 'Party Bags',
    description:
      'Luxury crystal-studded clutch perfect for glamorous party outfits.',
    material: 'Synthetic Leather',
    dimensions: '9 x 4 x 2 inches',
    weight: 0.4,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    variants: [
      {
        color: 'Silver',
        price: 3299,
        countInStock: 10,
        images: ['/images/clutches-1.jpg', '/images/clutches-2.jpg'],
      },
      {
        color: 'Gold',
        price: 3399,
        countInStock: 6,
        images: ['/images/handbag-1.jpg', '/images/handbag-2.jpg'],
      },
    ],
  },

  {
    name: 'Classic Leather Handbag',
    brand: 'Arihant Clutches',
    category: 'Handbags',
    description:
      'Premium leather handbag crafted for everyday elegance and durability.',
    material: 'Genuine Leather',
    dimensions: '14 x 10 x 5 inches',
    weight: 0.9,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    variants: [
      {
        color: 'Tan',
        price: 4999,
        countInStock: 15,
        images: ['/images/potli-1.jpg', '/images/potli-2.jpg'],
      },
      {
        color: 'Brown',
        price: 5199,
        countInStock: 9,
        images: ['/images/pouch-1.jpg', '/images/pouch-2.jpg'],
      },
    ],
  },

  {
    name: 'Pearl Bridal Clutch',
    brand: 'Arihant Clutches',
    category: 'Bridal Collection',
    description:
      'Beautiful pearl embellished bridal clutch for wedding occasions.',
    material: 'Silk',
    dimensions: '11 x 5 x 2 inches',
    weight: 0.5,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    variants: [
      {
        color: 'Ivory',
        price: 4599,
        countInStock: 7,
        images: ['/images/purse-1.jpg', '/images/purse-2.jpg'],
      },
    ],
  },

  {
    name: 'Minimalist Crossbody Bag',
    brand: 'Arihant Clutches',
    category: 'Crossbody Bags',
    description: 'Compact crossbody bag with minimalist design for daily use.',
    material: 'PU Leather',
    dimensions: '8 x 6 x 3 inches',
    weight: 0.55,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    variants: [
      {
        color: 'Beige',
        price: 2199,
        countInStock: 20,
        images: ['/images/samosa-1.jpg', '/images/samosa-2.jpg'],
      },
      {
        color: 'Pink',
        price: 2199,
        countInStock: 11,
        images: ['/images/square-1.jpg', '/images/square-2.jpg'],
      },
    ],
  },

  {
    name: 'Royal Potli Bag',
    brand: 'Arihant Clutches',
    category: 'Ethnic Bags',
    description:
      'Traditional embroidered potli bag for festive and ethnic wear.',
    material: 'Jacquard Fabric',
    dimensions: '7 x 8 inches',
    weight: 0.3,
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: false,
    variants: [
      {
        color: 'Red',
        price: 1799,
        countInStock: 18,
        images: ['/images/potli-3.jpg'],
      },
      {
        color: 'Green',
        price: 1799,
        countInStock: 13,
        images: ['/images/potli-4.jpg'],
      },
    ],
  },

  {
    name: 'Designer Tote Bag',
    brand: 'Arihant Clutches',
    category: 'Tote Bags',
    description:
      'Spacious designer tote bag suitable for shopping and office use.',
    material: 'Canvas',
    dimensions: '16 x 12 x 5 inches',
    weight: 1.1,
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    variants: [
      {
        color: 'Navy Blue',
        price: 2899,
        countInStock: 14,
        images: ['/images/tote-1.jpg'],
      },
      {
        color: 'Olive',
        price: 2999,
        countInStock: 10,
        images: ['/images/tote-2.jpg'],
      },
    ],
  },

  {
    name: 'Luxury Satin Clutch',
    brand: 'Arihant Clutches',
    category: 'Luxury Collection',
    description:
      'Premium satin clutch with metallic detailing and elegant finish.',
    material: 'Satin',
    dimensions: '10 x 4 x 2 inches',
    weight: 0.42,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    variants: [
      {
        color: 'Champagne',
        price: 3899,
        countInStock: 9,
        images: ['/images/triangle-1.jpg'],
      },
      {
        color: 'Rose Gold',
        price: 3999,
        countInStock: 5,
        images: ['/images/triangle-2.jpg'],
      },
    ],
  },

  {
    name: 'Everyday Sling Bag',
    brand: 'Arihant Clutches',
    category: 'Sling Bags',
    description:
      'Stylish and lightweight sling bag designed for casual outings.',
    material: 'PU Leather',
    dimensions: '9 x 7 x 3 inches',
    weight: 0.5,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: true,
    variants: [
      {
        color: 'Black',
        price: 1999,
        countInStock: 22,
        images: ['/images/handbag-3.jpg'],
      },
      {
        color: 'White',
        price: 1999,
        countInStock: 16,
        images: ['/images/pouch-3.jpg'],
      },
    ],
  },

  {
    name: 'Luxury Wedding Box Clutch',
    brand: 'Arihant Clutches',
    category: 'Wedding Collection',
    description: 'Hard-case luxury box clutch with premium crystal detailing.',
    material: 'Metal & Crystal',
    dimensions: '8 x 4 x 2 inches',
    weight: 0.65,
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: true,
    variants: [
      {
        color: 'Rose Pink',
        price: 5499,
        countInStock: 4,
        images: ['/images/purse-3.jpg'],
      },
      {
        color: 'Silver',
        price: 5599,
        countInStock: 3,
        images: ['/images/samosa-3.jpg'],
      },
    ],
  },
];
export default products;
