/**
 * Category Routes
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { adminOnly, asyncHandler } = require('../middleware/auth');

// Get all categories (public)
router.get('/', asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true, isMenu: true })
        .sort('order');

    res.json({
        status: 'success',
        data: { categories }
    });
}));

// Get category with products
router.get('/:slug', asyncHandler(async (req, res) => {
    const category = await Category.findOne({ 
        slug: req.params.slug, 
        isActive: true 
    });

    if (!category) {
        return res.status(404).json({
            status: 'fail',
            message: 'Danh mục không tìm thấy!'
        });
    }

    // Get products in this category
    const products = await Product.find({
        category: category._id,
        isActive: true
    })
    .populate('category', 'name slug')
    .limit(20);

    res.json({
        status: 'success',
        data: { category, products }
    });
}));

// Admin: Create category
router.post('/', adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Tạo danh mục thành công!',
        data: { category }
    });
}));

// Admin: Update category
router.put('/:id', adminOnly, asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    if (!category) {
        return res.status(404).json({
            status: 'fail',
            message: 'Danh mục không tìm thấy!'
        });
    }

    res.json({
        status: 'success',
        message: 'Cập nhật danh mục thành công!',
        data: { category }
    });
}));

// Admin: Delete category
router.delete('/:id', adminOnly, asyncHandler(async (req, res) => {
    // Check if category has products
    const productCount = await Product.countDocuments({ 
        category: req.params.id 
    });

    if (productCount > 0) {
        return res.status(400).json({
            status: 'fail',
            message: `Danh mục có ${productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm trước!`
        });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
        status: 'success',
        message: 'Xóa danh mục thành công!'
    });
}));

module.exports = router;
