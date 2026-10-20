/**
 * User Model
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email là bắt buộc'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ']
    },
    password: {
        type: String,
        required: function() { return !this.googleId && !this.facebookId; },
        minlength: [6, 'Mật khẩu phải có ít nhất 6 ký tự'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'Tên là bắt buộc'],
        trim: true,
        maxlength: [100, 'Tên không được vượt quá 100 ký tự']
    },
    phone: {
        type: String,
        trim: true,
        required: [true, 'Số điện thoại là bắt buộc'],
        match: [/^(0[0-9]{9,10})$/, 'Số điện thoại không hợp lệ (phải bắt đầu bằng 0, 10-11 số)']
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // OAuth fields
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true
    },
    // User preferences
    addresses: [{
        name: String,
        phone: String,
        address: { type: String, required: [true, 'Địa chỉ là bắt buộc'] },
        city: { type: String, required: [true, 'Thành phố là bắt buộc'] },
        district: String,
        ward: String,
        isDefault: Boolean
    }],
    // Email verification
    emailVerificationToken: String,
    emailVerificationExpires: Date,
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    // Cart (for guests or logged out)
    cart: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: { type: Number, default: 1 },
        selected: { type: Boolean, default: true }
    }],
    // Wishlist
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    // Refresh tokens
    refreshTokens: [{
        token: String,
        expiresAt: Date,
        createdAt: { type: Date, default: Date.now }
    }],
    // Security
    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date
    },
    // Password reset
    passwordResetToken: String,
    passwordResetExpires: Date,
    // Activity tracking
    lastLogin: Date,
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for faster queries (email is auto-indexed via unique: true)
userSchema.index({ 'addresses.city': 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { id: this._id, role: this.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function() {
    const token = jwt.sign(
        { id: this._id, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
    
    // Store refresh token
    this.refreshTokens.push({
        token,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });
    
    // Keep only last 5 refresh tokens
    if (this.refreshTokens.length > 5) {
        this.refreshTokens = this.refreshTokens.slice(-5);
    }
    
    return token;
};

// Check if account is locked
userSchema.methods.isLocked = function() {
    return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = async function() {
    // Reset if lock has expired
    if (this.lockUntil && this.lockUntil < Date.now()) {
        await this.updateOne({
            $set: { loginAttempts: 1 },
            $unset: { lockUntil: 1 }
        });
        return;
    }
    
    const updates = { $inc: { loginAttempts: 1 } };
    
    // Lock account after 5 failed attempts for 1 hour
    if (this.loginAttempts + 1 >= 5) {
        updates.$set = { lockUntil: Date.now() + 60 * 60 * 1000 };
    }
    
    await this.updateOne(updates);
};

// Remove sensitive data when converting to JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    delete user.refreshTokens;
    delete user.passwordResetToken;
    delete user.loginAttempts;
    delete user.lockUntil;
    return user;
};

module.exports = mongoose.model('User', userSchema);
