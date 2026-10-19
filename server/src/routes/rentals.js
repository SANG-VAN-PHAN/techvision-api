/**
 * RentalOrder Routes - Đơn thuê sản phẩm
 */
const express = require('express');
const router = express.Router();
const RentalOrder = require('../models/RentalOrder');
const ProductItem = require('../models/ProductItem');
const { auth, staffOnly, asyncHandler } = require('../middleware/auth');

// GET /api/rentals - Danh sách đơn thuê (staff xem tất cả, user xem của mình)
router.get('/', auth, asyncHandler(async (req, res) => {
    const filter = {};
    if (req.user.role !== 'admin' && req.user.role !== 'staff') {
        filter.user = req.user._id;
    } else {
        if (req.query.user) filter.user = req.query.user;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.branch) filter.branch = req.query.branch;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [rentals, total] = await Promise.all([
        RentalOrder.find(filter)
            .populate('user', 'fullName phone email')
            .populate('productItem', 'serialNumber imei salePrice conditionRate')
            .populate('product', 'name slug thumbnail')
            .populate('branch', 'name city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        RentalOrder.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: { rentals, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
}));

// GET /api/rentals/:id
router.get('/:id', auth, asyncHandler(async (req, res) => {
    const rental = await RentalOrder.findById(req.params.id)
        .populate('user', 'fullName phone email')
        .populate('productItem')
        .populate('product', 'name slug thumbnail')
        .populate('branch', 'name address phone')
        .populate('returnInspection.inspectedBy', 'fullName');

    if (!rental) return res.status(404).json({ status: 'fail', message: 'Đơn thuê không tồn tại!' });

    // Check quyền
    if (req.user.role !== 'admin' && req.user.role !== 'staff' && rental.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền xem đơn này!' });
    }
    res.json({ status: 'success', data: { rental } });
}));

// POST /api/rentals - Tạo đơn thuê mới
router.post('/', auth, asyncHandler(async (req, res) => {
    const { productItem, startDate, endDate, customerInfo, paymentMethod, branch, depositAmount } = req.body;

    const item = await ProductItem.findById(productItem);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Sản phẩm không tồn tại!' });
    if (!item.isForRent) return res.status(400).json({ status: 'fail', message: 'Sản phẩm này không cho thuê!' });
    if (item.status !== 'available') return res.status(400).json({ status: 'fail', message: 'Sản phẩm đang không có sẵn!' });

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days < 1) return res.status(400).json({ status: 'fail', message: 'Ngày thuê không hợp lệ!' });

    const dailyRate = item.rentalPricePerDay;
    const totalFee = dailyRate * days;
    const deposit = depositAmount || item.rentalDeposit || 0;

    const rental = await RentalOrder.create({
        user: req.user._id,
        productItem,
        product: item.product,
        branch: branch || item.branch,
        startDate: start,
        endDate: end,
        rentalDays: days,
        dailyRate,
        totalRentalFee: totalFee,
        depositAmount: deposit,
        depositPaid: 0,
        paymentMethod: paymentMethod || 'cash',
        customerInfo,
        status: 'pending'
    });

    res.status(201).json({ status: 'success', message: 'Tạo đơn thuê thành công!', data: { rental } });
}));

// PATCH /api/rentals/:id/confirm - Staff xác nhận đơn
router.patch('/:id/confirm', staffOnly, asyncHandler(async (req, res) => {
    const rental = await RentalOrder.findById(req.params.id);
    if (!rental) return res.status(404).json({ status: 'fail', message: 'Đơn thuê không tồn tại!' });
    if (rental.status !== 'pending') return res.status(400).json({ status: 'fail', message: 'Đơn không ở trạng thái chờ!' });

    rental.status = 'confirmed';
    rental.depositStatus = 'paid';
    rental.depositPaid = rental.depositAmount;
    rental.addStatusHistory('confirmed', 'Đơn đã xác nhận và nhận cọc', req.user._id);
    await rental.save();

    // Cập nhật trạng thái máy
    await ProductItem.findByIdAndUpdate(rental.productItem, { status: 'reserved' });

    res.json({ status: 'success', message: 'Xác nhận đơn thuê thành công!', data: { rental } });
}));

// PATCH /api/rentals/:id/active - Bàn giao máy
router.patch('/:id/active', staffOnly, asyncHandler(async (req, res) => {
    const rental = await RentalOrder.findById(req.params.id);
    if (!rental) return res.status(404).json({ status: 'fail', message: 'Đơn thuê không tồn tại!' });
    if (rental.status !== 'confirmed') return res.status(400).json({ status: 'fail', message: 'Đơn chưa được xác nhận!' });

    rental.status = 'active';
    rental.addStatusHistory('active', 'Đã bàn giao máy cho khách', req.user._id);
    await rental.save();

    await ProductItem.findByIdAndUpdate(rental.productItem, { status: 'rented' });

    res.json({ status: 'success', message: 'Đã bàn giao máy!', data: { rental } });
}));

// PATCH /api/rentals/:id/return - Trả máy
router.patch('/:id/return', staffOnly, asyncHandler(async (req, res) => {
    const { conditionRate, conditionNote, damageFee, images } = req.body;
    const rental = await RentalOrder.findById(req.params.id);
    if (!rental) return res.status(404).json({ status: 'fail', message: 'Đơn thuê không tồn tại!' });
    if (!['active', 'overdue'].includes(rental.status)) {
        return res.status(400).json({ status: 'fail', message: 'Đơn không trong trạng thái đang thuê!' });
    }

    const now = new Date();
    rental.actualReturnDate = now;
    rental.status = 'returned';
    rental.paymentStatus = 'paid';

    if (now > rental.endDate) {
        rental.overdueDays = Math.ceil((now - rental.endDate) / (1000 * 60 * 60 * 24));
        rental.overdueFee = rental.overdueDays * rental.dailyRate * 1.5;
    }

    rental.damageFee = damageFee || 0;
    rental.refundAmount = Math.max(0, rental.depositAmount - rental.damageFee - rental.overdueFee);
    rental.refundedAt = now;
    rental.depositStatus = rental.refundAmount > 0 ? 'refunded' : 'forfeited';

    rental.returnInspection = {
        conditionRate,
        conditionNote,
        inspectedBy: req.user._id,
        inspectedAt: now,
        images: images || []
    };
    rental.addStatusHistory('returned', `Trả máy - Hoàn cọc: ${rental.refundAmount}`, req.user._id);
    await rental.save();

    // Cập nhật máy về kho
    await ProductItem.findByIdAndUpdate(rental.productItem, {
        status: 'available',
        conditionRate,
        $push: {
            serviceHistory: {
                type: 'inspection',
                description: `Trả từ đơn thuê ${rental.rentalCode}: ${conditionNote || ''}`,
                performedAt: now
            }
        }
    });

    res.json({ status: 'success', message: 'Trả máy thành công!', data: { rental } });
}));

// PATCH /api/rentals/:id/cancel - Hủy đơn
router.patch('/:id/cancel', auth, asyncHandler(async (req, res) => {
    const rental = await RentalOrder.findById(req.params.id);
    if (!rental) return res.status(404).json({ status: 'fail', message: 'Đơn thuê không tồn tại!' });

    if (rental.user._id.toString() !== req.user._id.toString() && !['admin', 'staff'].includes(req.user.role)) {
        return res.status(403).json({ status: 'fail', message: 'Bạn không có quyền hủy đơn này!' });
    }
    if (['returned', 'cancelled', 'completed'].includes(rental.status)) {
        return res.status(400).json({ status: 'fail', message: 'Đơn không thể hủy!' });
    }

    rental.status = 'cancelled';
    rental.addStatusHistory('cancelled', req.body.reason || 'Khách hủy', req.user._id);
    await rental.save();

    await ProductItem.findByIdAndUpdate(rental.productItem, { status: 'available' });

    res.json({ status: 'success', message: 'Hủy đơn thuê thành công!', data: { rental } });
}));

module.exports = router;
