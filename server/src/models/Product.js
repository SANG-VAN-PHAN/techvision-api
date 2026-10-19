/**
 * Product Model
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên sản phẩm là bắt buộc'],
        trim: true,
        maxlength: [200, 'Tên sản phẩm không được vượt quá 200 ký tự']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    sku: {
        type: String,
        required: [true, 'SKU là bắt buộc'],
        unique: true,
        uppercase: true
    },
    description: {
        type: String,
        required: [true, 'Mô tả là bắt buộc']
    },
    shortDescription: {
        type: String,
        maxlength: [300, 'Mô tả ngắn không được vượt quá 300 ký tự']
    },
    price: {
        type: Number,
        required: [true, 'Giá là bắt buộc'],
        min: [0, 'Giá không được âm']
    },
    originalPrice: {
        type: Number,
        min: [0, 'Giá gốc không được âm']
    },
    cost: {
        type: Number,
        min: [0, 'Giá vốn không được âm']
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'Danh mục là bắt buộc']
    },
    brand: {
        type: String,
        trim: true
    },
    images: [{
        url: { type: String, required: true },
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    thumbnail: {
        type: String,
        default: ''
    },
    model3d: {
        url: String,
        type: { type: String, enum: ['headphones', 'phone', 'watch', 'speaker', 'camera', 'drone', 'laptop', 'custom'] },
        color: String
    },
    stock: {
        type: Number,
        required: true,
        min: [0, 'Số lượng không được âm'],
        default: 0
    },
    reservedStock: {
        type: Number,
        default: 0
    },
    barcode: String,
    attributes: {
        weight: Number,
        dimensions: {
            length: Number,
            width: Number,
            height: Number
        },
        color: String,
        material: String
    },
    specifications: [{
        label: String,
        value: String
    }],
    features: [String],
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isNew: {
        type: Boolean,
        default: false
    },
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    sold: {
        type: Number,
        default: 0
    },
    viewCount: {
        type: Number,
        default: 0
    },
    publishAt: Date,
    unpublishedAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    suppressReservedKeysWarning: true
});

// Indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ sold: -1 });
productSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for available stock
productSchema.virtual('availableStock').get(function() {
    return this.stock - this.reservedStock;
});

// Virtual for discount percentage
productSchema.virtual('discountPercent').get(function() {
    if (this.originalPrice && this.originalPrice > this.price) {
        return Math.round((1 - this.price / this.originalPrice) * 100);
    }
    return 0;
});

// Virtual: danh sách ProductItem (chiếc máy cụ thể)
productSchema.virtual('items', {
    ref: 'ProductItem',
    localField: '_id',
    foreignField: 'product'
});

// Pre-save hook to generate slug
productSchema.pre('save', function(next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = this.name.toLowerCase()
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
    next();
});

module.exports = mongoose.model('Product', productSchema);
