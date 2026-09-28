import mongoose from 'mongoose';

const wishlistItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const wishlistSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    items: [wishlistItemSchema],

    shareToken: {
      type: String,
      unique: true,
      sparse: true,
    },
    expiresAt: {
      type: Date,
      index: {
        expireAfterSeconds: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

wishlistSchema.index(
  { owner: 1 },
  {
    unique: true,
    partialFilterExpression: {
      owner: { $type: 'objectId' },
    },
  },
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
