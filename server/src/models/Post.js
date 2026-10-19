/**
 * Post Model - Blog/SEO/Tin tức
 */
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Tiêu đề là bắt buộc'],
        trim: true,
        maxlength: 255
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    excerpt: {
        type: String,
        maxlength: 500
    },
    content: {
        type: String,
        required: [true, 'Nội dung là bắt buộc']
    },
    thumbnail: String,
    images: [String],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['news', 'review', 'guide', 'tips', 'announcement'],
        default: 'news'
    },
    tags: [String],
    // Liên kết sản phẩm (cho bài review)
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // SEO
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    // Trạng thái
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: Date,
    // Thống kê
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    // Bình luận
    allowComments: { type: Boolean, default: true }
}, {
    timestamps: true
});

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ category: 1 });

postSchema.pre('save', function(next) {
    if (this.isModified('title') && !this.slug) {
        this.slug = this.title.toLowerCase()
            .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, 'a')
            .replace(/[èéẹẻẽêềếệểễ]/g, 'e')
            .replace(/[ìíịỉĩ]/g, 'i')
            .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, 'o')
            .replace(/[ùúụủũưừứựửữ]/g, 'u')
            .replace(/[ỳýỵỷỹ]/g, 'y')
            .replace(/[đ]/g, 'd')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    }
    if (this.status === 'published' && !this.publishedAt) {
        this.publishedAt = new Date();
    }
    next();
});

module.exports = mongoose.model('Post', postSchema);
