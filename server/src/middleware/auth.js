/**
 * Authentication Middleware
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorHandler');

// Protect routes - require authentication
const protect = async (req, res, next) => {
    try {
        let token;

        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return next(new AppError('Bạn cần đăng nhập để truy cập trang này!', 401));
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const user = await User.findById(decoded.id);
        if (!user) {
            return next(new AppError('Tài khoản không tồn tại!', 401));
        }

        // Check if user is active
        if (!user.isActive) {
            return next(new AppError('Tài khoản đã bị vô hiệu hóa!', 401));
        }

        // Grant access to protected route
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Token không hợp lệ!', 401));
        }
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Token đã hết hạn! Vui lòng đăng nhập lại.', 401));
        }
        next(error);
    }
};

// Grant access to specific roles
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('Bạn không có quyền thực hiện hành động này!', 403));
        }
        next();
    };
};

// Optional authentication - don't fail if not logged in
const optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                if (user && user.isActive) {
                    req.user = user;
                }
            }
        }
        
        next();
    } catch (error) {
        // Don't fail, just continue without user
        next();
    }
};

// Admin only middleware
const adminOnly = [protect, restrictTo('admin')];

// Staff and admin
const staffOnly = [protect, restrictTo('admin', 'staff')];

// Alias for protect
const auth = protect;

// Re-export asyncHandler
const { asyncHandler } = require('./errorHandler');

module.exports = { protect, auth, restrictTo, optionalAuth, adminOnly, staffOnly, asyncHandler };
