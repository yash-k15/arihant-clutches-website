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
  price: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  countInStock: {
    type: Number,
    default: 0,
    min: 0,
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
    variants: {
      type: [variantSchema],
      validate: [(val) => val.length > 0, 'At least one variant required'],
    },
    isFeatured: {
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
      type: String,
      trim: true,
    },
    weight: {
      type: String,
      trim: true,
    },
    material: {
      type: String,
      trim: true,
    },
    video: {
      url: {
        type: String,
        default: '',
      },
      publicId: {
        type: String,
        default: '',
      },
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

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const Product = mongoose.model('Product', productSchema);
const Category = mongoose.model('Category', categorySchema);

export { Category };
export default Product;
