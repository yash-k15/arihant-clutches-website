import asyncHandler from '../middleware/asyncHandler.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

import { getPeriodKey, generateSalesPeriods } from '../utils/dashboardSales.js';

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
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 6);
      groupBy = 'day';
      break;

    case '30days':
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 29);
      groupBy = 'day';
      break;

    case '3months':
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      groupBy = 'week';
      break;

    case '1year':
      startDate = new Date(now);
      startDate.setFullYear(startDate.getFullYear() - 1);
      groupBy = 'month';
      break;

    case 'custom':
      if (!dateFrom || !dateTo) {
        res.status(400);
        throw new Error('dateFrom and dateTo are required for a custom range');
      }

      const [fromYear, fromMonth, fromDay] = dateFrom.split('-').map(Number);

      const [toYear, toMonth, toDay] = dateTo.split('-').map(Number);

      startDate = new Date(fromYear, fromMonth - 1, fromDay, 0, 0, 0, 0);

      endDate = new Date(toYear, toMonth - 1, toDay, 23, 59, 59, 999);

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
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
      day: { $dayOfMonth: '$createdAt' },
    };
  }

  if (groupBy === 'week') {
    groupId = {
      year: { $isoWeekYear: '$createdAt' },
      week: { $isoWeek: '$createdAt' },
    };
  }

  if (groupBy === 'month') {
    groupId = {
      year: { $year: '$createdAt' },
      month: { $month: '$createdAt' },
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
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1,
        '_id.week': 1,
      },
    },
  ]);

  const periods = generateSalesPeriods(startDate, endDate, groupBy);

  sales.forEach((item) => {
    const date = new Date();

    date.setFullYear(item._id.year);
    date.setMonth(item._id.month ? item._id.month - 1 : 0);

    if (item._id.day) {
      date.setDate(item._id.day);
    }

    if (groupBy === 'week') {
      date.setDate(1);

      const firstDayOfYear = new Date(item._id.year, 0, 1);

      const dayOffset = (item._id.week - 1) * 7;

      date.setTime(firstDayOfYear.getTime() + dayOffset * 24 * 60 * 60 * 1000);
    }

    const key = getPeriodKey(date, groupBy);

    const matchingPeriod = periods.find((period) => period.key === key);

    if (matchingPeriod) {
      matchingPeriod.sales = item.sales;
    }
  });

  const totalSales = periods.reduce((total, period) => total + period.sales, 0);

  res.json({
    period,
    startDate,
    endDate,
    groupBy,
    totalSales,
    sales: periods,
  });
});

export { getDashboardOverview, getDashboardSales };
