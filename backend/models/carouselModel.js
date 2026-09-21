import mongoose from 'mongoose';

const carouselItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    _id: false,
  },
);

const carouselSchema = new mongoose.Schema(
  {
    items: [carouselItemSchema],
  },
  {
    timestamps: true,
  },
);

const Carousel = mongoose.model('Carousel', carouselSchema);

export default Carousel;
