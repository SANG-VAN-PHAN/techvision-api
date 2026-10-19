/**
 * Branch Routes
 */
const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const { adminOnly, asyncHandler } = require('../middleware/auth');

// GET /api/branches - Public
router.get('/', asyncHandler(async (req, res) => {
    const filter = { isActive: true };
    if (req.query.city) filter.city = req.query.city;

    const branches = await Branch.find(filter)
        .populate('manager', 'fullName phone')
        .sort('name');

    res.json({ status: 'success', data: { branches } });
}));

// GET /api/branches/:id
router.get('/:id', asyncHandler(async (req, res) => {
    const branch = await Branch.findById(req.params.id)
        .populate('manager', 'fullName phone email');
    if (!branch) return res.status(404).json({ status: 'fail', message: 'Chi nhánh không tồn tại!' });
    res.json({ status: 'success', data: { branch } });
}));

// POST /api/branches - Admin
router.post('/', adminOnly, asyncHandler(async (req, res) => {
    const branch = await Branch.create(req.body);
    res.status(201).json({ status: 'success', message: 'Tạo chi nhánh thành công!', data: { branch } });
}));

// PUT /api/branches/:id - Admin
router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
    const branch = await Branch.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!branch) return res.status(404).json({ status: 'fail', message: 'Chi nhánh không tồn tại!' });
    res.json({ status: 'success', message: 'Cập nhật thành công!', data: { branch } });
}));

// DELETE /api/branches/:id - Admin
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    const branch = await Branch.findByIdAndDelete(req.params.id);
    if (!branch) return res.status(404).json({ status: 'fail', message: 'Chi nhánh không tồn tại!' });
    res.json({ status: 'success', message: 'Xóa chi nhánh thành công!' });
}));

module.exports = router;
