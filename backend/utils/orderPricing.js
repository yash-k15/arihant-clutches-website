import Product from '../models/productModel.js';

const MAX_ORDER_ITEMS = 50;
const MAX_ITEM_QUANTITY = 15;

const calculateOrderPricing = async (orderItems, paymentMethod) => {
  if (
    !Array.isArray(orderItems) ||
    orderItems.length === 0 ||
    orderItems.length > MAX_ORDER_ITEMS
  ) {
    throw new Error('Invalid order items');
  }

  let itemsPrice = 0;
  let totalQuantity = 0;
  const validatedItems = [];
  const seenItems = new Set();

  for (const item of orderItems) {
    if (
      !item ||
      typeof item.product !== 'string' ||
      typeof item.variantId !== 'string' ||
      !Number.isInteger(item.qty) ||
      item.qty < 1 ||
      item.qty > MAX_ITEM_QUANTITY
    ) {
      throw new Error('Invalid order item');
    }

    const itemKey = `${item.product}:${item.variantId}`;

    if (seenItems.has(itemKey)) {
      throw new Error('Duplicate product variant in order');
    }

    seenItems.add(itemKey);

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
