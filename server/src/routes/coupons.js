/**
 * Coupon Routes
 */

const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { protect, adminOnly, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// Validate coupon
router.post('/validate', protect, asyncHandler(async (req, res) => {
    const { code, orderAmount } = req.body;

    const coupon = await Coupon.findOne({ 
        code: code.toUpperCase(),
        isPublic: true,
        isActive: true
    });

    if (!coupon) {
        throw new AppError('Mã coupon không tồn tại!', 404);
    }

    const validation = await coupon.isValidForUser(req.user._id, orderAmount);

    if (!validation.valid) {
        return res.json({
            status: 'fail',
            message: validation.reason
        });
    }

    const discount = coupon.calculateDiscount(orderAmount);

    res.json({
        status: 'success',
        data: {
            coupon,
            discount
        }
    });
}));

// Get available coupons for user
router.get('/available', protect, asyncHandler(async (req, res) => {
    const now = new Date();
    
    const coupons = await Coupon.find({
        isActive: true,
        isPublic: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usageCount', '$usageLimit'] } }
        ]
    }).sort('-createdAt');

    // Filter by per-user limit
    const availableCoupons = [];
    
    for (const coupon of coupons) {
        const userUsage = await Order.countDocuments({
            user: req.user._id,
            couponUsed: coupon._id
        });
        
        if (userUsage < coupon.perUserLimit) {
            availableCoupons.push(coupon);
        }
    }

    res.json({
        status: 'success',
        data: { coupons: availableCoupons }
    });
}));

// Admin: Get all coupons
router.get('/admin/all', adminOnly, asyncHandler(async (req, res) => {
    const coupons = await Coupon.find()
        .populate('createdBy', 'name')
        .sort('-createdAt');

    res.json({
        status: 'success',
        data: { coupons }
    });
}));

// Admin: Create coupon
router.post('/', adminOnly, asyncHandler(async (req, res) => {
    const coupon = await Coupon.create({
        ...req.body,
        createdBy: req.user._id
    });

    res.status(201).json({
        status: 'success',
        message: 'Tạo coupon thành công!',
        data: { coupon }
    });
}));

// Admin: Update coupon
router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!coupon) {
        throw new AppError('Coupon không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        message: 'Cập nhật coupon thành công!',
        data: { coupon }
    });
}));

// Admin: Delete coupon
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) {
        throw new AppError('Coupon không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        message: 'Xóa coupon thành công!'
    });
}));

module.exports = router;
