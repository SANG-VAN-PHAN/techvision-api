/**
 * Dashboard Stats Controller - Thống kê cho Admin
 */
const Product = require('../models/Product');
const ProductItem = require('../models/ProductItem');
const Order = require('../models/Order');
const RentalOrder = require('../models/RentalOrder');
const BuybackRequest = require('../models/BuybackRequest');
const Consignment = require('../models/Consignment');
const User = require('../models/User');
const Branch = require('../models/Branch');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// GET /api/admin/dashboard/overview
exports.getOverview = asyncHandler(async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const [
        totalUsers, totalProducts, totalProductItems, totalBranches,
        todayOrders, monthOrders, lastMonthOrders,
        monthRevenue, lastMonthRevenue,
        pendingBuybacks, activeRentals, activeConsignments,
        totalInventoryValue
    ] = await Promise.all([
        User.countDocuments({}),
        Product.countDocuments({ isActive: true }),
        ProductItem.countDocuments({}),
        Branch.countDocuments({ isActive: true }),
        Order.countDocuments({ createdAt: { $gte: startOfDay } }),
        Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
        Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        BuybackRequest.countDocuments({ status: { $in: ['pending', 'appraising'] } }),
        RentalOrder.countDocuments({ status: { $in: ['active', 'confirmed'] } }),
        Consignment.countDocuments({ status: 'active' }),
        ProductItem.aggregate([
            { $match: { status: 'available', isForSale: true } },
            { $group: { _id: null, total: { $sum: '$costPrice' } } }
        ])
    ]);

    const currentRevenue = monthRevenue[0]?.total || 0;
    const previousRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousRevenue > 0
        ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
        : 0;
    const orderGrowth = lastMonthOrders > 0
        ? Math.round(((monthOrders - lastMonthOrders) / lastMonthOrders) * 100)
        : 0;

    res.json({
        status: 'success',
        data: {
            counts: {
                users: totalUsers,
                products: totalProducts,
                productItems: totalProductItems,
                branches: totalBranches
            },
            orders: {
                today: todayOrders,
                thisMonth: monthOrders,
                lastMonth: lastMonthOrders,
                growth: orderGrowth
            },
            revenue: {
                thisMonth: currentRevenue,
                lastMonth: previousRevenue,
                growth: revenueGrowth
            },
            alerts: {
                pendingBuybacks,
                activeRentals,
                activeConsignments
            },
            inventoryValue: totalInventoryValue[0]?.total || 0
        }
    });
});

// GET /api/admin/dashboard/revenue?period=7days|30days|12months
exports.getRevenueChart = asyncHandler(async (req, res) => {
    const period = req.query.period || '7days';
    let groupFormat, startDate;

    const now = new Date();
    if (period === '7days') {
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === '30days') {
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
    } else if (period === '12months') {
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
    } else {
        throw new AppError('Period không hợp lệ!', 400);
    }

    const data = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                paymentStatus: 'paid'
            }
        },
        {
            $group: {
                _id: groupFormat,
                revenue: { $sum: '$total' },
                count: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    res.json({ status: 'success', data: { period, chart: data } });
});

// GET /api/admin/dashboard/top-products?limit=10
exports.getTopProducts = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;

    const data = await Order.aggregate([
        { $unwind: '$items' },
        {
            $group: {
                _id: '$items.product',
                sold: { $sum: '$items.quantity' },
                revenue: { $sum: '$items.total' }
            }
        },
        { $sort: { sold: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                sold: 1,
                revenue: 1,
                name: '$product.name',
                slug: '$product.slug',
                thumbnail: '$product.thumbnail'
            }
        }
    ]);

    res.json({ status: 'success', data: { products: data } });
});

// GET /api/admin/dashboard/inventory-by-branch
exports.getInventoryByBranch = asyncHandler(async (req, res) => {
    const data = await ProductItem.aggregate([
        {
            $group: {
                _id: '$branch',
                total: { $sum: 1 },
                available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
                sold: { $sum: { $cond: [{ $eq: ['$status', 'sold'] }, 1, 0] } },
                rented: { $sum: { $cond: [{ $eq: ['$status', 'rented'] }, 1, 0] } },
                value: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, '$costPrice', 0] } }
            }
        },
        {
            $lookup: {
                from: 'branches',
                localField: '_id',
                foreignField: '_id',
                as: 'branch'
            }
        },
        { $unwind: '$branch' },
        {
            $project: {
                total: 1,
                available: 1,
                sold: 1,
                rented: 1,
                value: 1,
                branchName: '$branch.name',
                city: '$branch.city'
            }
        },
        { $sort: { total: -1 } }
    ]);

    res.json({ status: 'success', data: { branches: data } });
});

// GET /api/admin/dashboard/recent-orders
exports.getRecentOrders = asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 10;
    const orders = await Order.find({})
        .populate('user', 'name email')
        .sort('-createdAt')
        .limit(limit);

    res.json({ status: 'success', data: { orders } });
});

// GET /api/admin/dashboard/condition-stats
exports.getConditionStats = asyncHandler(async (req, res) => {
    const data = await ProductItem.aggregate([
        { $match: { status: 'available' } },
        {
            $group: {
                _id: '$conditionLabel',
                count: { $sum: 1 },
                avgPrice: { $avg: '$salePrice' },
                avgBattery: { $avg: '$batteryHealth' }
            }
        },
        { $sort: { count: -1 } }
    ]);

    res.json({ status: 'success', data: { conditions: data } });
});

// GET /api/admin/dashboard/low-stock
exports.getLowStock = asyncHandler(async (req, res) => {
    const data = await ProductItem.aggregate([
        { $match: { status: 'available', isForSale: true } },
        {
            $group: {
                _id: '$product',
                count: { $sum: 1 }
            }
        },
        { $match: { count: { $lte: 2 } } },
        { $sort: { count: 1 } },
        {
            $lookup: {
                from: 'products',
                localField: '_id',
                foreignField: '_id',
                as: 'product'
            }
        },
        { $unwind: '$product' },
        {
            $project: {
                count: 1,
                name: '$product.name',
                slug: '$product.slug',
                thumbnail: '$product.thumbnail'
            }
        }
    ]);

    res.json({ status: 'success', data: { lowStock: data } });
});
