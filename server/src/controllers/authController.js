/**
 * Auth Controller
 */

const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto');
const emailService = require('../services/emailService');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Email verification URL — uses custom scheme so React Native app handles it
const getVerificationUrl = (token) =>
    `techvision://verify-email?token=${token}`;

// Password reset URL
const getResetUrl = (token) =>
    `techvision://reset-password?token=${token}`;

// Generate tokens
const generateTokens = (user) => {
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    return { token, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register new user with email verification
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { email, password, name, phone, address, city, district, ward } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !address || !city) {
        throw new AppError('Vui lòng điền đầy đủ: họ tên, email, mật khẩu, SĐT, địa chỉ, thành phố!', 400);
    }

    // Validate phone format
    if (!/^0[0-9]{9,10}$/.test(phone)) {
        throw new AppError('Số điện thoại không hợp lệ! Phải bắt đầu bằng 0 và có 10-11 số.', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new AppError('Email đã được sử dụng!', 400);
    }

    // Create user
    const user = await User.create({
        email,
        password,
        name,
        phone,
        addresses: [{
            address,
            city,
            district: district || '',
            ward: ward || '',
            isDefault: true
        }],
        isEmailVerified: false
    });

    // Generate email verification token (expires in 24h)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);
    await user.save();

    // Send verification email
    const verifyUrl = getVerificationUrl(verificationToken);
    const emailResult = await emailService.sendVerificationEmail({
        to: email,
        name,
        verifyUrl
    });

    res.status(201).json({
        status: 'success',
        message: emailResult.sent
            ? 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.'
            : 'Đăng ký thành công! (Không gửi được email xác minh, vui lòng liên hệ hỗ trợ)',
        data: {
            user,
            token,
            refreshToken,
            emailSent: emailResult.sent
        }
    });
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
        throw new AppError('Email hoặc mật khẩu không đúng!', 401);
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
        throw new AppError('Vui lòng xác minh email trước khi đăng nhập! Kiểm tra hộp thư email của bạn.', 403);
    }

    // Check if account is locked
    if (user.isLocked()) {
        throw new AppError('Tài khoản đã bị khóa tạm thời. Vui lòng thử lại sau 1 giờ!', 423);
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
        await user.incLoginAttempts();
        throw new AppError('Email hoặc mật khẩu không đúng!', 401);
    }

    // Reset login attempts
    await User.findByIdAndUpdate(user._id, {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 }
    });

    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);
    await user.save();

    res.json({
        status: 'success',
        message: 'Đăng nhập thành công!',
        data: {
            user,
            token,
            refreshToken
        }
    });
});

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
exports.googleAuth = asyncHandler(async (req, res) => {
    const { token: googleToken } = req.body;

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Check if user exists with this Google account
    let user = await User.findOne({ googleId });
    
    if (user) {
        // Update last login
        user.lastLogin = new Date();
        user.loginCount += 1;
    } else {
        // Check if email exists
        user = await User.findOne({ email });
        
        if (user) {
            // Link Google account to existing user
            user.googleId = googleId;
            user.avatar = user.avatar || picture;
        } else {
            // Create new user
            user = await User.create({
                email,
                name,
                avatar: picture,
                googleId
            });
        }
    }

    const { token, refreshToken } = generateTokens(user);
    await user.save();

    res.json({
        status: 'success',
        message: 'Đăng nhập Google thành công!',
        data: {
            user,
            token,
            refreshToken
        }
    });
});

// @route   POST /api/auth/facebook
// @desc    Login/Register with Facebook
// @access  Public
exports.facebookAuth = asyncHandler(async (req, res) => {
    const { accessToken, userID } = req.body;

    // Verify Facebook token
    const fbResponse = await fetch(
        `https://graph.facebook.com/v18.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );
    
    if (!fbResponse.ok) {
        throw new AppError('Xác thực Facebook thất bại!', 401);
    }

    const fbData = await fbResponse.json();
    const { id: facebookId, name, email, picture } = fbData;

    // Check if user exists
    let user = await User.findOne({ facebookId });
    
    if (user) {
        user.lastLogin = new Date();
        user.loginCount += 1;
    } else {
        user = await User.findOne({ email });
        
        if (user) {
            user.facebookId = facebookId;
            user.avatar = user.avatar || picture?.data?.url;
        } else {
            user = await User.create({
                email: email || `${facebookId}@facebook.local`,
                name,
                avatar: picture?.data?.url,
                facebookId
            });
        }
    }

    const { token, refreshToken } = generateTokens(user);
    await user.save();

    res.json({
        status: 'success',
        message: 'Đăng nhập Facebook thành công!',
        data: {
            user,
            token,
            refreshToken
        }
    });
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
exports.refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        throw new AppError('Refresh token là bắt buộc!', 400);
    }

    // Verify refresh token
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id);
    
    if (!user) {
        throw new AppError('Người dùng không tồn tại!', 401);
    }

    // Check if refresh token is valid
    const isValidToken = user.refreshTokens.some(
        t => t.token === refreshToken && t.expiresAt > new Date()
    );

    if (!isValidToken) {
        throw new AppError('Refresh token không hợp lệ hoặc đã hết hạn!', 401);
    }

    // Remove old refresh token
    user.refreshTokens = user.refreshTokens.filter(t => t.token !== refreshToken);

    // Generate new tokens
    const { token, refreshToken: newRefreshToken } = generateTokens(user);
    await user.save();

    res.json({
        status: 'success',
        data: {
            token,
            refreshToken: newRefreshToken
        }
    });
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
exports.logout = asyncHandler(async (req, res) => {
    const { refreshToken } = req.body;

    if (refreshToken) {
        // Remove specific refresh token
        await User.findByIdAndUpdate(req.user._id, {
            $pull: { refreshTokens: { token: refreshToken } }
        });
    }

    res.json({
        status: 'success',
        message: 'Đăng xuất thành công!'
    });
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    if (!user) {
        return res.json({
            status: 'success',
            message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.'
        });
    }

    // Generate reset token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    await user.save();

    const resetUrl = getResetUrl(resetToken);
    await emailService.sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl
    });

    res.json({
        status: 'success',
        message: 'Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.',
        // Remove this in production!
        data: process.env.NODE_ENV === 'development' ? { resetToken } : undefined
    });
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with token
// @access  Public
exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    // Hash token
    const crypto = require('crypto');
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    // Find user with token
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Token không hợp lệ hoặc đã hết hạn!', 400);
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    // Invalidate all refresh tokens
    user.refreshTokens = [];

    await user.save();

    res.json({
        status: 'success',
        message: 'Đặt lại mật khẩu thành công!'
    });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .populate('wishlist', 'name price images thumbnail')
        .populate('cart.product', 'name price images stock');

    res.json({
        status: 'success',
        data: { user }
    });
});

// @route   GET /api/auth/verify-email
// @desc    Verify email address
// @access  Public
exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (!token) {
        throw new AppError('Token xác minh là bắt buộc!', 400);
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new AppError('Link xác minh không hợp lệ hoặc đã hết hạn!', 400);
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
        status: 'success',
        message: 'Xác minh email thành công!'
    });
});

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification
// @access  Private
exports.resendVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
        return res.json({
            status: 'success',
            message: 'Email đã được xác minh trước đó.'
        });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    const verifyUrl = getVerificationUrl(verificationToken);
    const result = await emailService.sendVerificationEmail({
        to: user.email,
        name: user.name,
        verifyUrl
    });

    res.json({
        status: 'success',
        message: result.sent ? 'Đã gửi lại email xác minh!' : 'Gửi email thất bại, vui lòng thử lại sau.'
    });
});
