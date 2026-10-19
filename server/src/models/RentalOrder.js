/**
 * RentalOrder Model - Đơn thuê sản phẩm
 */
const mongoose = require('mongoose');

const rentalOrderSchema = new mongoose.Schema({
    rentalCode: {
        type: String,
        unique: true,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: true
    },
    productItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductItem',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    // Thời gian thuê
    startDate: {
        type: Date,
        required: [true, 'Ngày bắt đầu thuê là bắt buộc']
    },
    endDate: {
        type: Date,
        required: [true, 'Ngày kết thúc thuê là bắt buộc']
    },
    actualReturnDate: Date,
    rentalDays: {
        type: Number,
        required: true,
        min: 1
    },
    overdueDays: {
        type: Number,
        default: 0
    },
    // Đơn giá
    dailyRate: {
        type: Number,
        required: true,
        min: 0
    },
    totalRentalFee: {
        type: Number,
        required: true,
        min: 0
    },
    overdueFee: {
        type: Number,
        default: 0,
        comment: 'Phí phát sinh khi trả trễ'
    },
    damageFee: {
        type: Number,
        default: 0,
        comment: 'Phí hư hỏng (nếu có) trừ vào cọc'
    },
    // Tiền cọc
    depositAmount: {
        type: Number,
        required: true,
        min: 0
    },
    depositPaid: {
        type: Number,
        default: 0
    },
    refundAmount: {
        type: Number,
        default: 0,
        comment: 'Tiền cọc hoàn trả sau khi trừ hư hỏng'
    },
    refundedAt: Date,
    // Thanh toán
    paymentMethod: {
        type: String,
        enum: ['cod', 'bank_transfer', 'momo', 'vnpay', 'zalopay', 'cash'],
        default: 'cash'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid', 'refunded'],
        default: 'unpaid'
    },
    depositStatus: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'forfeited'],
        default: 'unpaid'
    },
    // Trạng thái đơn
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'active', 'returned', 'overdue', 'cancelled', 'completed'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now }
    }],
    // Thông tin người thuê (lưu snapshot)
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        idCard: { type: String, comment: 'CMND/CCCD' },
        idCardImage: String,
        address: String
    },
    // Hợp đồng thuê
    contractNumber: String,
    contractImage: String,
    // Ghi chú kiểm tra khi trả máy
    returnInspection: {
        conditionRate: Number,
        conditionNote: String,
        inspectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        inspectedAt: Date,
        images: [String]
    },
    // Ghi chú
    customerNote: String,
    adminNote: String
}, {
    timestamps: true
});

rentalOrderSchema.index({ user: 1 });
rentalOrderSchema.index({ productItem: 1 });
rentalOrderSchema.index({ status: 1 });
rentalOrderSchema.index({ startDate: 1, endDate: 1 });
rentalOrderSchema.index({ createdAt: -1 });

// Auto generate rental code
rentalOrderSchema.pre('save', async function(next) {
    if (!this.rentalCode) {
        const date = new Date();
        const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.rentalCode = `RENT${ymd}${random}`;
    }
    next();
});

// Virtual: is overdue
rentalOrderSchema.virtual('isOverdue').get(function() {
    if (this.status !== 'active') return false;
    return new Date() > this.endDate;
});

// Method: calculate overdue days
rentalOrderSchema.methods.calculateOverdue = function() {
    if (this.status !== 'active') return 0;
    const now = new Date();
    if (now > this.endDate) {
        const diff = Math.ceil((now - this.endDate) / (1000 * 60 * 60 * 24));
        this.overdueDays = diff;
        return diff;
    }
    return 0;
};

rentalOrderSchema.methods.addStatusHistory = function(status, note, userId) {
    this.statusHistory.push({ status, note, updatedBy: userId, updatedAt: new Date() });
};

module.exports = mongoose.model('RentalOrder', rentalOrderSchema);
