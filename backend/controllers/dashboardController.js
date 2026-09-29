import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

import {
  getPeriodKey,
  generateSalesPeriods,
  startOfDay,
  startOfWeek,
  startOfMonth,
  createISTDate,
  shiftISTDate,
  BUSINESS_TIMEZONE,
} from '../utils/dashboardSales.js';

const getDashboardOverview = asyncHandler(async (req, res) => {
  const [
    totalOrders,
    totalSalesResult,
    onlineProcessingOrders,
    codProcessingOrders,
    toBeDelivered,
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

    Order.countDocuments({
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
    toBeDelivered,
    totalProducts,
    totalCustomers,
    lowStockCount,
    deliveredOrders,
    lowStockProducts,
  });
});

const getDashboardSales = asyncHandler(async (req, res) => {
  const { period = '7days', dateFrom, dateTo } = req.query;

  const now = new Date();
  let startDate;
  let endDate = new Date(now);
  let groupBy;

  switch (period) {
    case '7days':
      startDate = startOfDay(shiftISTDate(now, { days: -6 }));
      groupBy = 'day';
      break;

    case '30days':
      startDate = startOfDay(shiftISTDate(now, { days: -29 }));
      groupBy = 'day';
      break;

    case '3months':
      startDate = shiftISTDate(now, {
        months: -3,
      });
      groupBy = 'week';
      break;

    case '1year':
      startDate = shiftISTDate(now, {
        years: -1,
      });
      groupBy = 'month';
      break;

    case 'custom': {
      if (!dateFrom || !dateTo) {
        res.status(400);
        throw new Error('dateFrom and dateTo are required for a custom range');
      }

      const [fromYear, fromMonth, fromDay] = dateFrom.split('-').map(Number);

      const [toYear, toMonth, toDay] = dateTo.split('-').map(Number);

      startDate = createISTDate(fromYear, fromMonth, fromDay, 0, 0, 0, 0);

      endDate = createISTDate(toYear, toMonth, toDay, 23, 59, 59, 999);

      if (
        Number.isNaN(startDate.getTime()) ||
        Number.isNaN(endDate.getTime())
      ) {
        res.status(400);
        throw new Error('Invalid custom date range');
      }

      if (startDate > endDate) {
        res.status(400);
        throw new Error('dateFrom cannot be later than dateTo');
      }

      const rangeInDays =
        Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

      if (rangeInDays <= 31) {
        groupBy = 'day';
      } else if (rangeInDays <= 120) {
        groupBy = 'week';
      } else {
        groupBy = 'month';
      }

      break;
    }

    default:
      res.status(400);
      throw new Error('Invalid sales period');
  }

  const match = {
    isPaid: true,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  let groupId;

  if (groupBy === 'day') {
    groupId = {
      $dateTrunc: {
        date: '$createdAt',
        unit: 'day',
        timezone: BUSINESS_TIMEZONE,
      },
    };
  }

  if (groupBy === 'week') {
    groupId = {
      $dateTrunc: {
        date: '$createdAt',
        unit: 'week',
        binSize: 1,
        timezone: BUSINESS_TIMEZONE,
        startOfWeek: 'monday',
      },
    };
  }

  if (groupBy === 'month') {
    groupId = {
      $dateTrunc: {
        date: '$createdAt',
        unit: 'month',
        timezone: BUSINESS_TIMEZONE,
      },
    };
  }

  const sales = await Order.aggregate([
    {
      $match: match,
    },
    {
      $group: {
        _id: groupId,
        sales: {
          $sum: '$totalPrice',
        },
      },
    },
    {
      $sort: {
        _id: 1,
      },
    },
  ]);

  const periods = generateSalesPeriods(startDate, endDate, groupBy);

  const periodMap = new Map(periods.map((item) => [item.key, item]));

  sales.forEach((item) => {
    const matchingPeriod = periodMap.get(item._id.toISOString());

    if (matchingPeriod) {
      matchingPeriod.sales = item.sales;
    }
  });

  const totalSales = periods.reduce((total, period) => total + period.sales, 0);

  res.json({
    period,
    timezone: BUSINESS_TIMEZONE,
    startDate,
    endDate,
    groupBy,
    totalSales,
    sales: periods,
  });
});

export { getDashboardOverview, getDashboardSales };
