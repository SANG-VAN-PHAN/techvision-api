/**
 * ProductItem Routes - Quản lý từng chiếc máy cụ thể (IMEI/Serial)
 */
const express = require('express');
const router = express.Router();
const ProductItem = require('../models/ProductItem');
const Product = require('../models/Product');
const { adminOnly, staffOnly, asyncHandler } = require('../middleware/auth');

// GET /api/product-items - Lấy danh sách máy
router.get('/', asyncHandler(async (req, res) => {
    const filter = {};
    if (req.query.product) filter.product = req.query.product;
    if (req.query.branch) filter.branch = req.query.branch;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.forSale === 'true') filter.isForSale = true;
    if (req.query.forRent === 'true') filter.isForRent = true;
    if (req.query.minPrice) filter.salePrice = { $gte: Number(req.query.minPrice) };
    if (req.query.maxPrice) filter.salePrice = { ...filter.salePrice, $lte: Number(req.query.maxPrice) };
    if (req.query.condition) filter.conditionLabel = req.query.condition;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
        ProductItem.find(filter)
            .populate('product', 'name slug thumbnail')
            .populate('branch', 'name city')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        ProductItem.countDocuments(filter)
    ]);

    res.json({
        status: 'success',
        data: { items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
    });
}));

// GET /api/product-items/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const item = await ProductItem.findById(req.params.id)
        .populate('product', 'name slug thumbnail description')
        .populate('branch', 'name address phone')
        .populate('consignmentFrom.user', 'fullName phone');
    if (!item) return res.status(404).json({ status: 'fail', message: 'Sản phẩm không tồn tại!' });
    res.json({ status: 'success', data: { item } });
}));

// GET /api/product-items/serial/:serial
router.get('/serial/:serial', asyncHandler(async (req, res) => {
    const item = await ProductItem.findOne({
        $or: [{ serialNumber: req.params.serial }, { imei: req.params.serial }]
    }).populate('product', 'name slug').populate('branch', 'name');
    if (!item) return res.status(404).json({ status: 'fail', message: 'Không tìm thấy máy với serial/IMEI này!' });
    res.json({ status: 'success', data: { item } });
}));

// POST /api/product-items - Staff/Admin tạo máy mới
router.post('/', staffOnly, asyncHandler(async (req, res) => {
    const item = await ProductItem.create(req.body);
    res.status(201).json({ status: 'success', message: 'Thêm sản phẩm vào kho thành công!', data: { item } });
}));

// PUT /api/product-items/:id - Cập nhật
router.put('/:id', staffOnly, asyncHandler(async (req, res) => {
    const item = await ProductItem.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ status: 'fail', message: 'Sản phẩm không tồn tại!' });
    res.json({ status: 'success', message: 'Cập nhật thành công!', data: { item } });
}));

// PATCH /api/product-items/:id/status - Cập nhật trạng thái
router.patch('/:id/status', staffOnly, asyncHandler(async (req, res) => {
    const { status, note } = req.body;
    const item = await ProductItem.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Sản phẩm không tồn tại!' });
    item.status = status;
    if (note) item.serviceHistory.push({ type: 'inspection', description: note, performedAt: new Date() });
    await item.save();
    res.json({ status: 'success', message: 'Cập nhật trạng thái thành công!', data: { item } });
}));

// DELETE /api/product-items/:id
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const item = await ProductItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ status: 'fail', message: 'Sản phẩm không tồn tại!' });
    res.json({ status: 'success', message: 'Xóa sản phẩm thành công!' });
}));

module.exports = router;
