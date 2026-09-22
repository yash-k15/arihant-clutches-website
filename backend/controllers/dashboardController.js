import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

const getDashboardOverview = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalSalesResult,
    onlineProcessingOrders,
    codProcessingOrders,
    totalProducts,
    totalCustomers,
    lowStockCount,
    deliveredOrders,
    lowStockProducts,
  ] = await Promise.all([
    Order.countDocuments(),

    Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: '$totalPrice',
          },
        },
      },
    ]),

    Order.countDocuments({
      paymentMethod: 'ONLINE',
      isPaid: true,
      isDelivered: false,
    }),

    Order.countDocuments({
      paymentMethod: 'COD',
      isPaid: false,
      isDelivered: false,
    }),

    Product.countDocuments(),

    User.countDocuments({
      isAdmin: false,
    }),

    Product.countDocuments({
      'variants.countInStock': {
        $lte: 5,
      },
    }),

    Order.countDocuments({
      isDelivered: true,
    }),

    Product.aggregate([
      {
        $match: {
          'variants.countInStock': {
            $lte: 5,
          },
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          variants: {
            $filter: {
              input: '$variants',
              as: 'variant',
              cond: {
                $lte: ['$$variant.countInStock', 5],
              },
            },
          },
        },
      },
    ]),
  ]);

  res.json({
    totalOrders,
    totalSales: totalSalesResult[0]?.totalSales || 0,
    onlineProcessingOrders,
    codProcessingOrders,
    totalProducts,
    totalCustomers,
    lowStockCount,
    deliveredOrders,
    lowStockProducts,
  });
});

export { getDashboardOverview };
