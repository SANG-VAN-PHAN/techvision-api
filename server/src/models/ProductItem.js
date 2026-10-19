/**
 * ProductItem Model - Chi tiết từng máy cụ thể (Serial/IMEI)
 * Đặc thù đồ 2hand: mỗi máy là 1 item riêng với tình trạng, % pin, % ngoại hình
 */
const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Sản phẩm là bắt buộc'],
        index: true
    },
    branch: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Branch',
        required: [true, 'Chi nhánh là bắt buộc']
    },
    // Mã định danh riêng
    serialNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    imei: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    // Tình trạng sản phẩm
    conditionRate: {
        type: Number,
        min: [0, 'Tỉ lệ không được âm'],
        max: [100, 'Tỉ lệ không được vượt quá 100%'],
        comment: 'VD: 97, 98, 99 (OpenBox)'
    },
    conditionLabel: {
        type: String,
        enum: ['new', 'openbox', 'like_new', 'good', 'fair', 'poor'],
        default: 'good'
    },
    conditionDetail: {
        type: String,
        comment: 'Mô tả chi tiết: xước sườn, màn xanh viền, ...'
    },
    batteryHealth: {
        type: Number,
        min: 0,
        max: 100,
        comment: '% pin (VD: 86% cho iPhone, iPad)'
    },
    cycleCount: {
        type: Number,
        comment: 'Số lần sạc pin (cho laptop/iPhone)'
    },
    includedAccessories: {
        type: String,
        comment: 'Kèm box, dây sạc, tai nghe, túi...'
    },
    // Giá bán thẳng
    salePrice: {
        type: Number,
        required: [true, 'Giá bán là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    originalPrice: {
        type: Number,
        comment: 'Giá niêm yết cũ / Giá máy mới'
    },
    costPrice: {
        type: Number,
        comment: 'Giá vốn (để tính lợi nhuận)'
    },
    // Giá thuê
    rentalPricePerDay: {
        type: Number,
        min: 0
    },
    rentalPricePerWeek: Number,
    rentalPricePerMonth: Number,
    rentalDeposit: {
        type: Number,
        min: 0,
        comment: 'Tiền cọc khi thuê'
    },
    // Loại hình kinh doanh
    isForSale: {
        type: Boolean,
        default: true
    },
    isForRent: {
        type: Boolean,
        default: false
    },
    isForConsignment: {
        type: Boolean,
        default: false,
        comment: 'Hàng ký gửi từ khách'
    },
    // Trạng thái
    status: {
        type: String,
        enum: ['available', 'reserved', 'sold', 'rented', 'in_maintenance', 'in_transit', 'consigned'],
        default: 'available'
    },
    // Hình ảnh riêng cho từng máy
    images: [{
        url: { type: String, required: true },
        isThumbnail: { type: Boolean, default: false }
    }],
    // Lịch sử bảo hành/sửa chữa
    serviceHistory: [{
        type: { type: String, enum: ['repair', 'maintenance', 'inspection'] },
        description: String,
        cost: Number,
        performedAt: Date,
        performedBy: String
    }],
    // Nếu là hàng ký gửi - tham chiếu
    consignmentFrom: {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        consignedAt: Date,
        commissionRate: Number
    }
}, {
    timestamps: true
});

productItemSchema.index({ product: 1, status: 1 });
productItemSchema.index({ branch: 1, status: 1 });
productItemSchema.index({ status: 1 });
productItemSchema.index({ isForSale: 1, isForRent: 1 });
productItemSchema.index({ conditionRate: -1 });

// Virtual: available for what
productItemSchema.virtual('availableFor').get(function() {
    const opts = [];
    if (this.isForSale && this.status === 'available') opts.push('sale');
    if (this.isForRent && this.status === 'available') opts.push('rent');
    return opts;
});

module.exports = mongoose.model('ProductItem', productItemSchema);
