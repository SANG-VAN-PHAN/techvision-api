/**
 * Consignment Model - Ký gửi sản phẩm
 * Khách gửi hàng để bán hộ, cửa hàng hưởng % hoa hồng
 */
const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
    consignmentCode: {
        type: String,
        unique: true,
        required: true
    },
    // Chủ sở hữu (khách ký gửi)
    owner: {
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
    // Thời hạn ký gửi
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    // Giá & hoa hồng
    salePrice: {
        type: Number,
        required: true,
        comment: 'Giá bán niêm yết'
    },
    minimumPrice: {
        type: Number,
        comment: 'Giá sàn (dưới giá này phải hỏi chủ)'
    },
    commissionRate: {
        type: Number,
        required: true,
        comment: '% hoa hồng cửa hàng (VD: 15 = 15%)'
    },
    commissionAmount: {
        type: Number,
        comment: 'Số tiền hoa hồng = salePrice * commissionRate / 100'
    },
    ownerReceives: {
        type: Number,
        comment: 'Số tiền chủ nhận = salePrice - commissionAmount'
    },
    // Trạng thái
    status: {
        type: String,
        enum: ['pending', 'active', 'sold', 'returned', 'cancelled', 'expired'],
        default: 'pending'
    },
    soldAt: Date,
    paidToOwnerAt: Date,
    // Hợp đồng
    contractNumber: String,
    contractImage: String,
    // Ghi chú
    terms: String,
    adminNote: String
}, {
    timestamps: true
});

consignmentSchema.index({ owner: 1 });
consignmentSchema.index({ status: 1 });
consignmentSchema.index({ endDate: 1 });

// Auto generate code
consignmentSchema.pre('save', async function(next) {
    if (!this.consignmentCode) {
        const date = new Date();
        const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.consignmentCode = `CSG${ymd}${random}`;
    }
    // Auto calculate
    if (this.salePrice && this.commissionRate) {
        this.commissionAmount = Math.round(this.salePrice * this.commissionRate) / 100;
        this.ownerReceives = this.salePrice - this.commissionAmount;
    }
    next();
});

module.exports = mongoose.model('Consignment', consignmentSchema);
