import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    orderItems: [
      {
        name: { type: String, required: true },
        qty: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },

        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },

        slug: {
          type: String,
          required: true,
        },

        variantId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        color: {
          type: String,
          required: true,
        },
      },
    ],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine1: {
        type: String,
        required: true,
        trim: true,
      },

      addressLine2: {
        type: String,
        trim: true,
        default: '',
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      state: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        required: true,
        trim: true,
      },

      country: {
        type: String,
        required: true,
        trim: true,
        default: 'India',
      },
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ['COD', 'ONLINE'],
    },

    // Used for both COD and online checkout retries.
    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    // Razorpay Order ID created by our backend.
    razorpayOrderId: {
      type: String,
      unique: true,
      sparse: true,
    },

    paymentResult: {
      id: {
        type: String,
      },

      status: {
        type: String,
      },

      update_time: {
        type: String,
      },
    },

    // Prevents stock from being deducted more than once
    // when frontend verification and webhook processing race.
    stockDeducted: {
      type: Boolean,
      required: true,
      default: false,
    },

    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },

    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },

    paidAt: {
      type: Date,
    },

    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// One payment ID can belong to only one application order.
orderSchema.index({ 'paymentResult.id': 1 }, { unique: true, sparse: true });

const Order = mongoose.model('Order', orderSchema);

export default Order;
