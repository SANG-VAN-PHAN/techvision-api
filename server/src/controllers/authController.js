/**
 * Auth Controller
 */

const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');
const { OAuth2Client } = require('google-auth-library');

// Google OAuth Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate tokens
const generateTokens = (user) => {
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    return { token, refreshToken };
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { email, password, name, phone } = req.body;

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
        phone
    });

    // Generate tokens
    const { token, refreshToken } = generateTokens(user);
    await user.save();

    res.status(201).json({
        status: 'success',
        message: 'Đăng ký thành công!',
        data: {
            user,
            token,
            refreshToken
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

    // TODO: Send email with reset link
    // In production, use nodemailer with SMTP

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
