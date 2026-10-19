/**
 * Order Controller
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
exports.getMyOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: req.user._id };
    if (status) {
        query.status = status;
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('items.product', 'name images')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit),
        Order.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.id,
        $or: [
            { user: req.user._id },
            { 'shippingAddress.email': req.user.email }
        ]
    }).populate('items.product', 'name images slug');

    if (!order) {
        throw new AppError('Đơn hàng không tìm thấy!', 404);
    }

    res.json({
        status: 'success',
        data: { order }
    });
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
exports.createOrder = asyncHandler(async (req, res) => {
    const { 
        items,
        shippingAddress,
        paymentMethod,
        couponCode,
        customerNote
    } = req.body;

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
        const product = await Product.findById(item.productId);
        
        if (!product || !product.isActive) {
            throw new AppError(`Sản phẩm "${item.name}" không còn khả dụng!`, 400);
        }

        if (product.stock < item.quantity) {
            throw new AppError(`Sản phẩm "${product.name}" không đủ số lượng!`, 400);
        }

        orderItems.push({
            product: product._id,
            name: product.name,
            image: product.thumbnail || product.images[0]?.url,
            price: product.price,
            quantity: item.quantity,
            discount: product.originalPrice > product.price ? 
                product.originalPrice - product.price : 0,
            total: product.price * item.quantity
        });

        subtotal += product.price * item.quantity;
    }

    // Apply coupon
    let discountAmount = 0;
    let couponUsed = null;

    if (couponCode) {
        const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
        
        if (coupon) {
            const validation = await coupon.isValidForUser(req.user._id, subtotal);
            
            if (validation.valid) {
                discountAmount = coupon.calculateDiscount(subtotal, orderItems);
                couponUsed = coupon._id;
                
                // Update coupon usage
                coupon.usageCount += 1;
                await coupon.save();
            }
        }
    }

    // Calculate shipping fee (free over 500k)
    const shippingFee = subtotal - discountAmount >= 500000 ? 0 : 30000;

    // Calculate total
    const total = subtotal - discountAmount + shippingFee;

    // Create order
    const order = await Order.create({
        user: req.user._id,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        couponUsed,
        couponCode: couponCode?.toUpperCase(),
        discountAmount,
        shippingFee,
        subtotal,
        total,
        customerNote
    });

    // Reserve stock
    for (const item of items) {
        await Product.findByIdAndUpdate(item.productId, {
            $inc: { 
                stock: -item.quantity,
                reservedStock: item.quantity 
            }
        });
    }

    // Clear user's cart
    await User.findByIdAndUpdate(req.user._id, {
        $set: { cart: [] }
    });

    // Populate and return
    await order.populate('items.product', 'name slug');

    res.status(201).json({
        status: 'success',
        message: 'Đặt hàng thành công!',
        data: { order }
    });
});

// @route   PATCH /api/orders/:id/cancel
// @desc    Cancel order
// @access  Private
exports.cancelOrder = asyncHandler(async (req, res) => {
    const { reason } = req.body;

    const order = await Order.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!order) {
        throw new AppError('Đơn hàng không tìm thấy!', 404);
    }

    if (!order.canCancel) {
        throw new AppError('Không thể hủy đơn hàng ở trạng thái này!', 400);
    }

    // Restore stock
    for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
            $inc: { 
                stock: item.quantity,
                reservedStock: -item.quantity
            }
        });
    }

    // Update coupon usage if used
    if (order.couponUsed) {
        await Coupon.findByIdAndUpdate(order.couponUsed, {
            $inc: { usageCount: -1 }
        });
    }

    order.status = 'cancelled';
    order.adminNote = reason || 'Khách hàng hủy đơn';
    order.addStatusHistory('cancelled', reason, req.user._id);
    await order.save();

    res.json({
        status: 'success',
        message: 'Hủy đơn hàng thành công!',
        data: { order }
    });
});

// ==================== ADMIN CONTROLLERS ====================

// @route   GET /api/orders/admin/all
// @desc    Get all orders for admin
// @access  Private/Admin
exports.getAdminOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status, search } = req.query;

    const query = {};

    if (status) {
        query.status = status;
    }

    if (search) {
        query.$or = [
            { orderNumber: { $regex: search, $options: 'i' } },
            { 'shippingAddress.name': { $regex: search, $options: 'i' } },
            { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
        ];
    }

    const [orders, total] = await Promise.all([
        Order.find(query)
            .populate('user', 'name email')
            .sort('-createdAt')
            .skip((page - 1) * limit)
            .limit(limit),
        Order.countDocuments(query)
    ]);

    res.json({
        status: 'success',
        data: {
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        }
    });
});

// @route   PATCH /api/orders/admin/:id/status
// @desc    Update order status
// @access  Private/Admin
exports.updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, note, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
        throw new AppError('Đơn hàng không tìm thấy!', 404);
    }

    order.status = status;
    if (note) order.adminNote = note;
    if (trackingNumber) {
        order.trackingNumber = trackingNumber;
        order.shippingProvider = req.body.shippingProvider;
    }

    order.addStatusHistory(status, note, req.user._id);

    // Update timestamps
    if (status === 'shipped') {
        order.shippedAt = new Date();
    } else if (status === 'delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'paid';
        
        // Release reserved stock, update sold count
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { 
                    reservedStock: -item.quantity,
                    sold: item.quantity
                }
            });
        }
    }

    await order.save();

    res.json({
        status: 'success',
        message: 'Cập nhật trạng thái thành công!',
        data: { order }
    });
});

// @route   GET /api/orders/admin/stats
// @desc    Get order statistics
// @access  Private/Admin
exports.getOrderStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [stats, recentOrders, topProducts] = await Promise.all([
        // Overall stats
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 },
                    totalRevenue: { $sum: '$total' },
                    avgOrderValue: { $avg: '$total' },
                    pendingOrders: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    }
                }
            }
        ]),
        
        // Recent orders
        Order.find()
            .populate('user', 'name')
            .sort('-createdAt')
            .limit(5),
        
        // Top selling products
        Order.aggregate([
            { $match: { status: 'delivered' } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    name: { $first: '$items.name' },
                    totalSold: { $sum: '$items.quantity' },
                    revenue: { $sum: '$items.total' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ])
    ]);

    res.json({
        status: 'success',
        data: {
            stats: stats[0] || {
                totalOrders: 0,
                totalRevenue: 0,
                avgOrderValue: 0,
                pendingOrders: 0
            },
            recentOrders,
            topProducts
        }
    });
});
