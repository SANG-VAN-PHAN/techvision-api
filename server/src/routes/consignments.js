/**
 * Consignment Routes - Ký gửi sản phẩm
 * Khách gửi hàng để bán hộ, cửa hàng hưởng % hoa hồng
 */
const express = require('express');
const router = express.Router();
const Consignment = require('../models/Consignment');
const ProductItem = require('../models/ProductItem');
const { auth, staffOnly, adminOnly, asyncHandler } = require('../middleware/auth');

// GET /api/consignments - Danh sách
router.get('/', auth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.user.role === 'user') {
        filter.owner = req.user._id;
    } else {
        if (req.query.owner) filter.owner = req.query.owner;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branch) filter.branch = req.query.branch;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [consignments, total] = await Promise.all([
        Consignment.find(filter)
            .populate('owner', 'fullName phone email')
            .populate('branch', 'name city')
            .populate({
                path: 'productItem',
                populate: { path: 'product', select: 'name slug thumbnail' }
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Consignment.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: { consignments, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
}));

// GET /api/consignments/:id
router.get('/:id', auth, asyncHandler(async (req, res) => {
    const consignment = await Consignment.findById(req.params.id)
        .populate('owner', 'fullName phone email')
        .populate('branch', 'name address phone')
        .populate({
            path: 'productItem',
            populate: { path: 'product', select: 'name slug thumbnail' }
        });

    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Hợp đồng ký gửi không tồn tại!' });

    if (req.user.role === 'user' && consignment.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: 'fail', message: 'Không có quyền xem!' });
    }
    res.json({ status: 'success', data: { consignment } });
}));

// POST /api/consignments - Khách đăng ký ký gửi
router.post('/', auth, asyncHandler(async (req, res) => {
    const { branch, startDate, endDate, salePrice, minimumPrice, commissionRate, terms } = req.body;

    if (!req.body.productItemData) {
        return res.status(400).json({ status: 'fail', message: 'Thiếu thông tin sản phẩm ký gửi!' });
    }

    // Tạo ProductItem với trạng thái consigned
    const item = await ProductItem.create({
        ...req.body.productItemData,
        branch,
        isForSale: true,
        isForConsignment: true,
        status: 'consigned',
        consignmentFrom: {
            user: req.user._id,
            consignedAt: new Date(),
            commissionRate
        }
    });

    const consignment = await Consignment.create({
        consignmentCode: undefined, // auto-generate
        owner: req.user._id,
        branch,
        productItem: item._id,
        startDate,
        endDate,
        salePrice,
        minimumPrice,
        commissionRate,
        status: 'pending',
        terms
    });

    res.status(201).json({
        status: 'success',
        message: 'Đăng ký ký gửi thành công! Chờ xác nhận từ cửa hàng.',
        data: { consignment, productItem: item }
    });
}));

// PATCH /api/consignments/:id/approve - Staff duyệt
router.patch('/:id/approve', staffOnly, asyncHandler(async (req, res) => {
    const consignment = await Consignment.findById(req.params.id);
    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Không tồn tại!' });
    if (consignment.status !== 'pending') return res.status(400).json({ status: 'fail', message: 'Trạng thái không hợp lệ!' });

    consignment.status = 'active';
    consignment.contractNumber = `HDKG-${Date.now()}`;
    await consignment.save();

    res.json({ status: 'success', message: 'Duyệt ký gửi thành công!', data: { consignment } });
}));

// PATCH /api/consignments/:id/sold - Đánh dấu đã bán
router.patch('/:id/sold', staffOnly, asyncHandler(async (req, res) => {
    const { actualSalePrice } = req.body;
    const consignment = await Consignment.findById(req.params.id);
    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Không tồn tại!' });
    if (consignment.status !== 'active') return res.status(400).json({ status: 'fail', message: 'Chưa active!' });

    const finalPrice = actualSalePrice || consignment.salePrice;
    consignment.salePrice = finalPrice;
    consignment.status = 'sold';
    consignment.soldAt = new Date();
    consignment.commissionAmount = Math.round(finalPrice * consignment.commissionRate) / 100;
    consignment.ownerReceives = finalPrice - consignment.commissionAmount;
    consignment.paidToOwnerAt = new Date();
    await consignment.save();

    // Cập nhật productItem
    await ProductItem.findByIdAndUpdate(consignment.productItem, { status: 'sold' });

    res.json({
        status: 'success',
        message: `Đã bán! Hoa hồng: ${consignment.commissionAmount.toLocaleString()}đ, Chủ nhận: ${consignment.ownerReceives.toLocaleString()}đ`,
        data: { consignment }
    });
}));

// PATCH /api/consignments/:id/return - Trả lại hàng cho chủ
router.patch('/:id/return', staffOnly, asyncHandler(async (req, res) => {
    const consignment = await Consignment.findById(req.params.id);
    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Không tồn tại!' });
    if (!['active', 'pending'].includes(consignment.status)) {
        return res.status(400).json({ status: 'fail', message: 'Không thể trả lại!' });
    }

    consignment.status = 'returned';
    await consignment.save();

    await ProductItem.findByIdAndUpdate(consignment.productItem, { status: 'available', isForConsignment: false });

    res.json({ status: 'success', message: 'Đã trả lại hàng cho khách!', data: { consignment } });
}));

// PATCH /api/consignments/:id/cancel
router.patch('/:id/cancel', auth, asyncHandler(async (req, res) => {
    const consignment = await Consignment.findById(req.params.id);
    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Không tồn tại!' });

    if (consignment.owner._id.toString() !== req.user._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({ status: 'fail', message: 'Không có quyền!' });
    }

    consignment.status = 'cancelled';
    await consignment.save();

    await ProductItem.findByIdAndUpdate(consignment.productItem, { status: 'available', isForConsignment: false });

    res.json({ status: 'success', message: 'Hủy ký gửi thành công!', data: { consignment } });
}));

// DELETE /api/consignments/:id
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const consignment = await Consignment.findByIdAndDelete(req.params.id);
    if (!consignment) return res.status(404).json({ status: 'fail', message: 'Không tồn tại!' });

    if (consignment.productItem) {
        await ProductItem.findByIdAndDelete(consignment.productItem);
    }
    res.json({ status: 'success', message: 'Xóa hợp đồng ký gửi!' });
}));

module.exports = router;
