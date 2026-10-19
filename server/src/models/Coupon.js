/**
 * Coupon Model
 */

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Mã coupon là bắt buộc'],
        unique: true,
        uppercase: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Tên coupon là bắt buộc'],
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_shipping'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    maxDiscount: {
        type: Number,
        default: null
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxOrderAmount: {
        type: Number,
        default: null
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usageCount: {
        type: Number,
        default: 0
    },
    perUserLimit: {
        type: Number,
        default: 1
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date,
        required: [true, 'Ngày kết thúc là bắt buộc']
    },
    applicableTo: {
        type: String,
        enum: ['all', 'categories', 'products'],
        default: 'all'
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    firstOrderOnly: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    newUsersOnly: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

couponSchema.methods.isValidForUser = async function(userId, orderAmount) {
    const now = new Date();
    if (!this.isActive || now < this.startDate || now > this.endDate) {
        return { valid: false, reason: 'Coupon đã hết hạn hoặc không hoạt động' };
    }
    if (this.usageLimit && this.usageCount >= this.usageLimit) {
        return { valid: false, reason: 'Coupon đã hết lượt sử dụng' };
    }
    if (orderAmount < this.minOrderAmount) {
        return { valid: false, reason: `Đơn hàng tối thiểu ${this.minOrderAmount.toLocaleString('vi-VN')}đ` };
    }
    if (this.maxOrderAmount && orderAmount > this.maxOrderAmount) {
        return { valid: false, reason: `Đơn hàng tối đa ${this.maxOrderAmount.toLocaleString('vi-VN')}đ` };
    }
    return { valid: true };
};

couponSchema.methods.calculateDiscount = function(orderAmount) {
    let discount = 0;
    if (this.type === 'percentage') {
        discount = (orderAmount * this.value) / 100;
        if (this.maxDiscount) discount = Math.min(discount, this.maxDiscount);
    } else if (this.type === 'fixed') {
        discount = this.value;
    }
    return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
