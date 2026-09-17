import Product from '../models/productModel.js';

const calculateOrderPricing = async (orderItems, paymentMethod) => {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    throw new Error('No order items provided');
  }

  let itemsPrice = 0;
  let totalQuantity = 0;
  const validatedItems = [];

  for (const item of orderItems) {
    if (
      !item.product ||
      !item.variantId ||
      !Number.isInteger(item.qty) ||
      item.qty <= 0
    ) {
      throw new Error('Invalid order item');
    }

    const product = await Product.findOne({
      _id: item.product,
      variants: {
        $elemMatch: {
          _id: item.variantId,
          countInStock: { $gte: item.qty },
        },
      },
    });

    if (!product) {
      throw new Error(
        `${item.name || 'Product'} is out of stock or unavailable`,
      );
    }

    const variant = product.variants.id(item.variantId);

    if (!variant) {
      throw new Error('Product variant not found');
    }

    const image = variant.images?.includes(item.image)
      ? item.image
      : variant.images?.[0];

    if (!image) {
      throw new Error(`${product.name} has no image for the selected variant`);
    }

    itemsPrice += variant.price * item.qty;
    totalQuantity += item.qty;

    validatedItems.push({
      product: product._id,
      slug: product.slug,
      name: product.name,
      image,
      color: variant.color,
      variantId: variant._id,
      price: variant.price,
      qty: item.qty,
    });
  }

  const shippingPrice = paymentMethod === 'COD' ? totalQuantity * 150 : 0;

  const taxPrice = 0;

  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  return {
    validatedItems,
    itemsPrice: Number(itemsPrice.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    taxPrice,
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

export default calculateOrderPricing;
