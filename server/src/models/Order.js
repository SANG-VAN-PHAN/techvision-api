/**
 * Order Model
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: String,
    image: String,
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, 'Số lượng tối thiểu là 1']
    },
    discount: {
        type: Number,
        default: 0
    },
    total: Number
});

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    // Guest info
    guestEmail: String,
    guestName: String,
    guestPhone: String,
    // Shipping address
    shippingAddress: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        address: { type: String, required: true },
        city: { type: String, required: true },
        district: String,
        note: String
    },
    // Order items
    items: [orderItemSchema],
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: String,
    shippingFee: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    // Payment
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    },
    paymentId: String,
    paidAt: Date,
    // Order status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now }
    }],
    // Shipping
    shippingProvider: String,
    trackingNumber: String,
    shippedAt: Date,
    deliveredAt: Date,
    // Coupon used
    couponUsed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Coupon'
    },
    // Notes
    customerNote: String,
    adminNote: String,
    // Refund
    refundAmount: Number,
    refundReason: String,
    refundedAt: Date
}, {
    timestamps: true
});

// Indexes (orderNumber auto-indexed via unique: true)
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'shippingAddress.phone': 1 });
orderSchema.index({ 'shippingAddress.email': 1 });

// Pre-save to generate order number
orderSchema.pre('save', async function(next) {
    if (!this.orderNumber) {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.orderNumber = `TV${year}${month}${day}${random}`;
    }
    
    // Calculate totals
    this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
    this.total = this.subtotal - this.discountAmount + this.shippingFee;
    
    next();
});

// Calculate item total
orderItemSchema.pre('save', function(next) {
    this.total = (this.price - this.discount) * this.quantity;
    next();
});

// Method to add status history
orderSchema.methods.addStatusHistory = function(status, note, userId) {
    this.statusHistory.push({
        status,
        note,
        updatedBy: userId,
        updatedAt: new Date()
    });
};

// Virtual for can cancel
orderSchema.virtual('canCancel').get(function() {
    return ['pending', 'confirmed'].includes(this.status);
});

// Virtual for can refund
orderSchema.virtual('canRefund').get(function() {
    return ['paid', 'delivered'].includes(this.paymentStatus) && !this.refundedAt;
});

module.exports = mongoose.model('Order', orderSchema);
