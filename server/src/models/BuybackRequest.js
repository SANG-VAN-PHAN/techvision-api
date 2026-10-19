/**
 * BuybackRequest Model - Yêu cầu thu mua / định giá sản phẩm cũ
 * Workflow: pending -> appraising -> appraised -> accepted/rejected -> completed
 */
const mongoose = require('mongoose');

const buybackRequestSchema = new mongoose.Schema({
    requestCode: {
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
        comment: 'Chi nhánh muốn giao dịch'
    },
    // Thông tin sản phẩm khách muốn bán
    productName: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc'],
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brand: String,
    model: String,
    yearOfPurchase: Number,
    description: {
        type: String,
        comment: 'Mô tả tình trạng máy'
    },
    // Tình trạng máy (do khách tự đánh giá)
    condition: {
        rate: { type: Number, min: 0, max: 100 },
        label: { type: String, enum: ['new', 'like_new', 'good', 'fair', 'poor'] },
        batteryHealth: Number,
        hasBox: { type: Boolean, default: false },
        hasCharger: { type: Boolean, default: false },
        hasInvoice: { type: Boolean, default: false },
        issues: [String]
    },
    // Hình ảnh khách gửi
    images: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['front', 'back', 'side', 'screen', 'accessory', 'other'], default: 'other' }
    }],
    // Giá
    expectedPrice: {
        type: Number,
        comment: 'Giá khách mong muốn'
    },
    estimatedPrice: {
        type: Number,
        comment: 'Mức giá cửa hàng đề xuất (online)'
    },
    finalPrice: {
        type: Number,
        comment: 'Giá chốt sau khi kiểm định thực tế'
    },
    // Kiểm định viên
    appraiser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        comment: 'Chuyên viên định giá phụ trách'
    },
    appraisalNotes: String,
    appraisalDate: Date,
    // Phương thức thanh toán khi mua lại
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank_transfer', 'momo'],
        default: 'bank_transfer'
    },
    paidAt: Date,
    // Trạng thái
    status: {
        type: String,
        enum: ['pending', 'contacted', 'appraising', 'appraised', 'accepted', 'rejected', 'completed', 'cancelled'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        updatedAt: { type: Date, default: Date.now }
    }],
    // Lý do từ chối
    rejectionReason: String,
    // Sản phẩm được tạo từ buyback (nếu accepted)
    resultingProductItem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductItem'
    },
    // Ghi chú
    customerNote: String,
    adminNote: String
}, {
    timestamps: true
});

buybackRequestSchema.index({ user: 1 });
buybackRequestSchema.index({ status: 1 });
buybackRequestSchema.index({ createdAt: -1 });
buybackRequestSchema.index({ category: 1, status: 1 });

// Auto generate request code
buybackRequestSchema.pre('save', async function(next) {
    if (!this.requestCode) {
        const date = new Date();
        const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.requestCode = `BB${ymd}${random}`;
    }
    next();
});

buybackRequestSchema.methods.addStatusHistory = function(status, note, userId) {
    this.statusHistory.push({ status, note, updatedBy: userId, updatedAt: new Date() });
};

module.exports = mongoose.model('BuybackRequest', buybackRequestSchema);
