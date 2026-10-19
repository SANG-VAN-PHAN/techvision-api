/**
 * Review Model
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    rating: {
        type: Number,
        required: [true, 'Đánh giá là bắt buộc'],
        min: [1, 'Đánh giá tối thiểu là 1 sao'],
        max: [5, 'Đánh giá tối đa là 5 sao']
    },
    title: String,
    comment: String,
    images: [{ url: String }],
    isVerifiedPurchase: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
    notHelpful: { type: Number, default: 0 }
}, { timestamps: true });

reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);
