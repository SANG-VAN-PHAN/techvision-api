/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, asyncHandler } = require('../middleware/auth');
const { AppError } = require('../middleware/errorHandler');

// Get user profile
router.get('/profile', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('wishlist', 'name price images thumbnail rating');

    res.json({
        status: 'success',
        data: { user }
    });
}));

// Update profile
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const allowedUpdates = ['name', 'phone', 'avatar'];
    const updates = {};

    for (const key of allowedUpdates) {
        if (req.body[key] !== undefined) {
            updates[key] = req.body[key];
        }
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
    );

    res.json({
        status: 'success',
        message: 'Cập nhật hồ sơ thành công!',
        data: { user }
    });
}));

// Change password
router.put('/change-password', protect, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    if (user.googleId || user.facebookId) {
        // OAuth users don't have password
        if (currentPassword) {
            throw new AppError('Tài khoản này không có mật khẩu!', 400);
        }
    } else {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            throw new AppError('Mật khẩu hiện tại không đúng!', 400);
        }
    }

    user.password = newPassword;
    await user.save();

    res.json({
        status: 'success',
        message: 'Đổi mật khẩu thành công!'
    });
}));

// Add address
router.post('/addresses', protect, asyncHandler(async (req, res) => {
    const { name, phone, address, city, district, isDefault } = req.body;

    const user = await User.findById(req.user._id);

    // If this is default, unset other defaults
    if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ name, phone, address, city, district, isDefault: !!isDefault });
    await user.save();

    res.status(201).json({
        status: 'success',
        message: 'Thêm địa chỉ thành công!',
        data: { addresses: user.addresses }
    });
}));

// Update address
router.put('/addresses/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
        throw new AppError('Địa chỉ không tìm thấy!', 404);
    }

    // If this is default, unset other defaults
    if (req.body.isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
    }

    address.set(req.body);
    await user.save();

    res.json({
        status: 'success',
        message: 'Cập nhật địa chỉ thành công!',
        data: { addresses: user.addresses }
    });
}));

// Delete address
router.delete('/addresses/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.addresses.id(req.params.id);

    if (!address) {
        throw new AppError('Địa chỉ không tìm thấy!', 404);
    }

    address.deleteOne();
    await user.save();

    res.json({
        status: 'success',
        message: 'Xóa địa chỉ thành công!',
        data: { addresses: user.addresses }
    });
}));

// Add to wishlist
router.post('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.wishlist.includes(req.params.productId)) {
        throw new AppError('Sản phẩm đã có trong danh sách yêu thích!', 400);
    }

    user.wishlist.push(req.params.productId);
    await user.save();

    res.json({
        status: 'success',
        message: 'Thêm vào danh sách yêu thích!'
    });
}));

// Remove from wishlist
router.delete('/wishlist/:productId', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    user.wishlist = user.wishlist.filter(
        id => id.toString() !== req.params.productId
    );
    await user.save();

    res.json({
        status: 'success',
        message: 'Xóa khỏi danh sách yêu thích!'
    });
}));

// Add to cart
router.post('/cart', protect, asyncHandler(async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
        throw new AppError('Sản phẩm không tồn tại!', 404);
    }

    const user = await User.findById(req.user._id);

    const existingItem = user.cart.find(
        item => item.product.toString() === productId
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        user.cart.push({ product: productId, quantity, selected: true });
    }

    await user.save();
    await user.populate('cart.product', 'name price images stock');

    res.json({
        status: 'success',
        message: 'Thêm vào giỏ hàng!',
        data: { cart: user.cart }
    });
}));

// Update cart item
router.patch('/cart/:itemId', protect, asyncHandler(async (req, res) => {
    const { quantity, selected } = req.body;

    const user = await User.findById(req.user._id);
    const item = user.cart.id(req.params.itemId);

    if (!item) {
        throw new AppError('Sản phẩm không có trong giỏ hàng!', 404);
    }

    if (quantity !== undefined) item.quantity = quantity;
    if (selected !== undefined) item.selected = selected;

    await user.save();
    await user.populate('cart.product', 'name price images stock');

    res.json({
        status: 'success',
        data: { cart: user.cart }
    });
}));

// Remove from cart
router.delete('/cart/:itemId', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const item = user.cart.id(req.params.itemId);

    if (!item) {
        throw new AppError('Sản phẩm không có trong giỏ hàng!', 404);
    }

    item.deleteOne();
    await user.save();

    res.json({
        status: 'success',
        message: 'Xóa khỏi giỏ hàng!',
        data: { cart: user.cart }
    });
}));

// Clear cart
router.delete('/cart', protect, asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $set: { cart: [] } });

    res.json({
        status: 'success',
        message: 'Đã xóa giỏ hàng!'
    });
}));

// Get cart
router.get('/cart', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('cart.product', 'name price images stock thumbnail slug');

    res.json({
        status: 'success',
        data: { cart: user.cart }
    });
}));

module.exports = router;
