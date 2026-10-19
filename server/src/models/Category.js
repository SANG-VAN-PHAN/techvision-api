/**
 * Category Model
 */

const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên danh mục là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên danh mục không được vượt quá 100 ký tự']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String,
        default: '📁'
    },
    image: {
        url: String,
        alt: String
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        default: null
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isMenu: {
        type: Boolean,
        default: true
    },
    metaTitle: String,
    metaDescription: String,
    // Statistics
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes
categorySchema.index({ parent: 1 });
categorySchema.index({ order: 1 });
categorySchema.index({ isActive: 1 });

// Pre-save hook to generate slug
categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = slugify(this.name, { lower: true, strict: true });
    }
    next();
});

// Virtual for children categories
categorySchema.virtual('children', {
    ref: 'Category',
    localField: '_id',
    foreignField: 'parent'
});

// Update product count
categorySchema.methods.updateProductCount = async function() {
    const Product = require('./Product');
    const count = await Product.countDocuments({ 
        category: this._id, 
        isActive: true 
    });
    this.productCount = count;
    await this.save();
};

module.exports = mongoose.model('Category', categorySchema);
