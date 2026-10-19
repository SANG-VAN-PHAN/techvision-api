/**
 * BuybackRequest Routes - Yêu cầu thu mua / định giá
 */
const express = require('express');
const router = express.Router();
const BuybackRequest = require('../models/BuybackRequest');
const ProductItem = require('../models/ProductItem');
const { auth, staffOnly, asyncHandler } = require('../middleware/auth');

// GET /api/buyback - Lấy danh sách yêu cầu
router.get('/', auth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && req.user.role !== 'appraiser') {
        filter.user = req.user._id;
    } else {
        if (req.query.user) filter.user = req.query.user;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.appraiser) filter.appraiser = req.query.appraiser;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [requests, total] = await Promise.all([
        BuybackRequest.find(filter)
            .populate('user', 'fullName phone email')
            .populate('category', 'name slug')
            .populate('branch', 'name city')
            .populate('appraiser', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        BuybackRequest.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: { requests, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
}));

// GET /api/buyback/:id
router.get('/:id', auth, asyncHandler(async (req, res) => {
    const request = await BuybackRequest.findById(req.params.id)
        .populate('user', 'fullName phone email')
        .populate('category', 'name slug')
        .populate('branch', 'name address')
        .populate('appraiser', 'fullName')
        .populate('resultingProductItem');

    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    if (req.user.role === 'customer' && request.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: 'fail', message: 'Không có quyền xem!' });
    }
    res.json({ status: 'success', data: { request } });
}));

// POST /api/buyback - Khách tạo yêu cầu thu mua
router.post('/', auth, asyncHandler(async (req, res) => {
    const request = await BuybackRequest.create({
        ...req.body,
        user: req.user._id
    });
    res.status(201).json({ status: 'success', message: 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.', data: { request } });
}));

// PATCH /api/buyback/:id/assign - Assign cho chuyên viên định giá
router.patch('/:id/assign', staffOnly, asyncHandler(async (req, res) => {
    const request = await BuybackRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    request.appraiser = req.body.appraiserId || req.user._id;
    request.status = 'appraising';
    request.addStatusHistory('appraising', `Assigned cho chuyên viên định giá`, req.user._id);
    await request.save();

    res.json({ status: 'success', message: 'Đã giao cho chuyên viên định giá!', data: { request } });
}));

// PATCH /api/buyback/:id/estimate - Chuyên viên đưa ra giá online
router.patch('/:id/estimate', staffOnly, asyncHandler(async (req, res) => {
    const { estimatedPrice, appraisalNotes } = req.body;
    const request = await BuybackRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    request.estimatedPrice = estimatedPrice;
    request.appraisalNotes = appraisalNotes;
    request.appraisalDate = new Date();
    request.status = 'appraised';
    request.addStatusHistory('appraised', `Định giá online: ${estimatedPrice?.toLocaleString()}đ`, req.user._id);
    await request.save();

    res.json({ status: 'success', message: 'Đã gửi báo giá cho khách!', data: { request } });
}));

// PATCH /api/buyback/:id/accept - Khách đồng ý
router.patch('/:id/accept', auth, asyncHandler(async (req, res) => {
    const request = await BuybackRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    if (request.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: 'fail', message: 'Không có quyền!' });
    }

    request.status = 'accepted';
    request.addStatusHistory('accepted', 'Khách đồng ý giá', req.user._id);
    await request.save();

    res.json({ status: 'success', message: 'Đã xác nhận! Vui lòng mang máy đến chi nhánh.', data: { request } });
}));

// PATCH /api/buyback/:id/reject - Từ chối
router.patch('/:id/reject', auth, asyncHandler(async (req, res) => {
    const request = await BuybackRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    const isOwner = request.user._id.toString() === req.user._id.toString();
    if (!isOwner && !['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({ status: 'fail', message: 'Không có quyền!' });
    }

    request.status = 'rejected';
    request.rejectionReason = req.body.reason || '';
    request.addStatusHistory('rejected', req.body.reason || 'Từ chối', req.user._id);
    await request.save();

    res.json({ status: 'success', message: 'Đã từ chối yêu cầu.', data: { request } });
}));

// PATCH /api/buyback/:id/complete - Hoàn tất thu mua + tạo ProductItem
router.patch('/:id/complete', staffOnly, asyncHandler(async (req, res) => {
    const { finalPrice, productItemData } = req.body;
    const request = await BuybackRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ status: 'fail', message: 'Yêu cầu không tồn tại!' });

    request.finalPrice = finalPrice;
    request.status = 'completed';
    request.paidAt = new Date();
    request.addStatusHistory('completed', `Hoàn tất thu mua với giá ${finalPrice?.toLocaleString()}đ`, req.user._id);

    // Tạo ProductItem mới từ yêu cầu thu mua
    if (productItemData) {
        const newItem = await ProductItem.create({
            ...productItemData,
            costPrice: finalPrice,
            status: 'available'
        });
        request.resultingProductItem = newItem._id;
    }

    await request.save();
    res.json({ status: 'success', message: 'Hoàn tất thu mua!', data: { request } });
}));

module.exports = router;
