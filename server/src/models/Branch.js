/**
 * Branch Model - Hệ thống đa chi nhánh
 */
const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tên chi nhánh là bắt buộc'],
        trim: true,
        maxlength: 100
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: [true, 'Số điện thoại là bắt buộc']
    },
    email: String,
    address: {
        type: String,
        required: [true, 'Địa chỉ là bắt buộc']
    },
    city: {
        type: String,
        required: true
    },
    district: String,
    location: {
        lat: Number,
        lng: Number
    },
    workingHours: {
        type: String,
        default: '8:00 - 21:00'
    },
    manager: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

branchSchema.index({ name: 1 });
branchSchema.index({ city: 1 });

branchSchema.pre('save', function(next) {
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

module.exports = mongoose.model('Branch', branchSchema);
