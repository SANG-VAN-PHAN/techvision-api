/**
 * Admin Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Category = require('../models/Category');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const { adminOnly, asyncHandler } = require('../middleware/auth');

// Dashboard stats
router.get('/dashboard', adminOnly, asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrders,
        lowStockProducts,
        recentOrders,
        recentReviews
    ] = await Promise.all([
        User.countDocuments({ role: 'user' }),
        Product.countDocuments({ isActive: true }),
        Order.countDocuments(),
        Order.aggregate([
            { $match: { paymentStatus: 'paid' } },
            { $group: { _id: null, total: { $sum: '$total' } } }
        ]),
        Order.countDocuments({ status: 'pending' }),
        Product.find({ 
            stock: { $lte: 10 },
            isActive: true 
        }).select('name stock').limit(5),
        Order.find()
            .populate('user', 'name email')
            .sort('-createdAt')
            .limit(5),
        Review.find({ isApproved: false })
            .populate('user', 'name')
            .populate('product', 'name')
            .sort('-createdAt')
            .limit(5)
    ]);

    // Monthly stats for chart
    const monthlyStats = await Order.aggregate([
        {
            $match: {
                createdAt: {
                    $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
                }
            }
        },
        {
            $group: {
                _id: {
                    month: { $month: '$createdAt' },
                    year: { $year: '$createdAt' }
                },
                orders: { $sum: 1 },
                revenue: { $sum: '$total' }
            }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
        status: 'success',
        data: {
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                pendingOrders,
                lowStockProducts,
                recentOrders,
                recentReviews
            },
            monthlyStats
        }
    });
}));

// User management
router.get('/users', adminOnly, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, search, role } = req.query;

    const query = {};
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }
    if (role) query.role = role;

    const [users, total] = await Promise.all([
        User.find(query)
            .select('-refreshTokens')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit),
        User.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: { users, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } }
    });
}));

router.patch('/users/:id/toggle-status', adminOnly, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    
    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'Người dùng không tìm thấy!' });
    }
    
    if (user.role === 'admin') {
        return res.status(400).json({ status: 'fail', message: 'Không thể vô hiệu hóa tài khoản admin!' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
        status: 'success',
        message: user.isActive ? 'Đã kích hoạt tài khoản!' : 'Đã vô hiệu hóa tài khoản!',
        data: { isActive: user.isActive }
    });
}));

// Reviews management
router.get('/reviews', adminOnly, asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, approved } = req.query;

    const query = {};
    if (approved === 'true') query.isApproved = true;
    if (approved === 'false') query.isApproved = false;

    const [reviews, total] = await Promise.all([
        Review.find(query)
            .populate('user', 'name avatar')
            .populate('product', 'name')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit),
        Review.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: { reviews, pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) } }
    });
}));

router.patch('/reviews/:id/approve', adminOnly, asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true }
    );

    if (!review) {
        return res.status(404).json({ status: 'fail', message: 'Đánh giá không tìm thấy!' });
    }

    // Update product rating
    const stats = await Review.aggregate([
        { $match: { product: review.product, isApproved: true } },
        { $group: { _id: '$product', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    if (stats.length > 0) {
        await Product.findByIdAndUpdate(review.product, {
            'rating.average': Math.round(stats[0].avg * 10) / 10,
            'rating.count': stats[0].count
        });
    }

    res.json({ status: 'success', message: 'Đã phê duyệt đánh giá!' });
}));

router.delete('/reviews/:id', adminOnly, asyncHandler(async (req, res) => {
    const review = await Review.findByIdAndDelete(req.params.id);

    if (!review) {
        return res.status(404).json({ status: 'fail', message: 'Đánh giá không tìm thấy!' });
    }

    res.json({ status: 'success', message: 'Đã xóa đánh giá!' });
}));

// Categories management
router.get('/categories', adminOnly, asyncHandler(async (req, res) => {
    const categories = await Category.find().sort('order');
    res.json({ status: 'success', data: { categories } });
}));

router.post('/categories', adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);
    res.status(201).json({ status: 'success', data: { category } });
}));

router.put('/categories/:id', adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ status: 'success', data: { category } });
}));

router.delete('/categories/:id', adminOnly, asyncHandler(async (req, res) => {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ status: 'success' });
}));

module.exports = router;
