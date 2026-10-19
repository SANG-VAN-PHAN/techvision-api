/**
 * Payment Routes
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// Get payment methods
router.get('/methods', (req, res) => {
    res.json({
        status: 'success',
        data: {
            methods: [
                { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', icon: '💵' },
                { id: 'bank_transfer', name: 'Chuyển khoản ngân hàng', icon: '🏦' },
                { id: 'momo', name: 'Ví MoMo', icon: '📱' },
                { id: 'vnpay', name: 'VNPay', icon: '💳' }
            ]
        }
    });
});

// VNPay integration placeholder
router.post('/vnpay/create', protect, asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.user._id });
    
    if (!order) {
        throw new AppError('Đơn hàng không tìm thấy!', 404);
    }

    // In production, integrate with VNPay API
    // For now, return mock payment URL
    const vnpUrl = `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?orderId=${orderId}&amount=${amount}&vnp_ReturnUrl=${process.env.FRONTEND_URL}/payment/return`;

    res.json({
        status: 'success',
        data: { paymentUrl: vnpUrl }
    });
}));

// MoMo integration placeholder
router.post('/momo/create', protect, asyncHandler(async (req, res) => {
    const { orderId, amount } = req.body;

    // In production, integrate with MoMo API
    // For now, return mock payment URL
    const momoUrl = `https://momo.vn/payment?orderId=${orderId}&amount=${amount}`;

    res.json({
        status: 'success',
        data: { paymentUrl: momoUrl }
    });
}));

// Payment return/callback
router.get('/return', asyncHandler(async (req, res) => {
    const { vnp_ResponseCode, orderId, vnp_TransactionNo } = req.query;

    if (vnp_ResponseCode === '00') {
        // Payment successful
        await Order.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            paidAt: new Date(),
            paymentId: vnp_TransactionNo
        });

        return res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${orderId}`);
    }

    // Payment failed
    await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed'
    });

    res.redirect(`${process.env.FRONTEND_URL}/payment/failed?orderId=${orderId}`);
}));

// Check payment status
router.get('/status/:orderId', protect, asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderId,
        user: req.user._id
    }).select('paymentStatus paymentId paidAt');

    if (!order) {
        throw new AppError('Đơn hàng không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        data: { paymentStatus: order.paymentStatus }
    });
}));

module.exports = router;
