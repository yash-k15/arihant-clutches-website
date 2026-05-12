import mongoose from 'mongoose';
import slugify from 'slugify';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const variantSchema = mongoose.Schema({
  color: {
    type: String,
  },
  size: {
    type: String,
  },
  material: {
    type: String,
  },
  images: [String],
});

const productSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
      },
    ],
    brand: {
      type: String,
      default: 'Arihant Clutches',
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      // required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    featured: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },

    weight: {
      type: Number,
      min: 0,
    },

    material: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Create product slug from the name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
