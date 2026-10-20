/**
 * OAuth Routes
 * Handles Google and Facebook OAuth redirects
 */

const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/errorHandler');

// Google OAuth
const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'https://techvision-api.onrender.com/api/auth/google/callback'
);

// Generate tokens for user
const generateTokens = (user) => {
    const token = user.generateAuthToken();
    const refreshToken = user.generateRefreshToken();
    return { token, refreshToken };
};

// ==================== OAUTH AVAILABILITY ====================
// OAuth được bật khi có đủ credentials trong env vars.
// Chưa cấu hình thì trả về thông báo rõ ràng thay vì lỗi 404/500.
const googleOAuthEnabled = () =>
    Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

const facebookOAuthEnabled = () =>
    Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);

const oauthNotConfigured = (provider) => ({
    status: 'error',
    message: `${provider} chưa được cấu hình. Vui lòng đăng nhập bằng email/mật khẩu.`
});

// ==================== GOOGLE OAUTH ====================

// Step 1: Redirect to Google consent screen
// GET /api/auth/google
router.get('/google', (req, res) => {
    if (!googleOAuthEnabled()) {
        return res.status(503).json(oauthNotConfigured('Đăng nhập Google'));
    }

    const scopes = [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');

    const authUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent'
    });

    res.redirect(authUrl);
});

// Step 2: Google redirects back with code
// GET /api/auth/google/callback
router.get('/google/callback', asyncHandler(async (req, res) => {
    if (!googleOAuthEnabled()) {
        return res.status(503).json(oauthNotConfigured('Đăng nhập Google'));
    }

    const { code, error } = req.query;

    if (error) {
        console.error('Google OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://techvision-api.onrender.com'}?auth=error&message=google_denied`);
    }

    if (!code) {
        throw new AppError('Missing authorization code', 400);
    }

    // Exchange code for tokens
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);

    // Get user info
    const googleAuth = googleOAuth2Api();
    const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    // Find or create user
    let user = await User.findOne({ googleId });
    
    if (!user) {
        user = await User.findOne({ email });
        if (user) {
            user.googleId = googleId;
            user.avatar = user.avatar || picture;
        } else {
            user = await User.create({
                email,
                name,
                avatar: picture,
                googleId,
                isEmailVerified: true // Google verifies email
            });
        }
    }

    user.lastLogin = new Date();
    user.loginCount += 1;

    const { token, refreshToken } = generateTokens(user);
    await user.save();

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'https://techvision-api.onrender.com'}/auth-callback`);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    redirectUrl.searchParams.set('user', JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
    }));

    res.redirect(redirectUrl.toString());
}));

// ==================== FACEBOOK OAUTH ====================

// Step 1: Redirect to Facebook consent screen
// GET /api/auth/facebook
router.get('/facebook', (req, res) => {
    if (!facebookOAuthEnabled()) {
        return res.status(503).json(oauthNotConfigured('Đăng nhập Facebook'));
    }

    const redirectUri = `${process.env.BASE_URL || 'https://techvision-api.onrender.com'}/api/auth/facebook/callback`;
    const scope = 'email,public_profile';

    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${process.env.FACEBOOK_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;

    res.redirect(authUrl);
});

// Step 2: Facebook redirects back with code
// GET /api/auth/facebook/callback
router.get('/facebook/callback', asyncHandler(async (req, res) => {
    if (!facebookOAuthEnabled()) {
        return res.status(503).json(oauthNotConfigured('Đăng nhập Facebook'));
    }

    const { code, error } = req.query;

    if (error) {
        console.error('Facebook OAuth error:', error);
        return res.redirect(`${process.env.FRONTEND_URL || 'https://techvision-api.onrender.com'}?auth=error&message=facebook_denied`);
    }

    if (!code) {
        throw new AppError('Missing authorization code', 400);
    }

    // Exchange code for access token
    const redirectUri = `${process.env.BASE_URL || 'https://techvision-api.onrender.com'}/api/auth/facebook/callback`;
    const tokenRes = await fetch(
        `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${process.env.FACEBOOK_APP_ID}&client_secret=${process.env.FACEBOOK_APP_SECRET}&redirect_uri=${encodeURIComponent(redirectUri)}&code=${code}`
    );
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
        throw new AppError('Failed to get Facebook access token', 400);
    }

    // Get user info
    const userRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tokenData.access_token}`
    );
    const fbUser = await userRes.json();

    const { id: facebookId, name, email, picture } = fbUser;

    // Find or create user
    let user = await User.findOne({ facebookId });
    
    if (!user) {
        user = await User.findOne({ email: email || `${facebookId}@facebook.local` });
        if (user) {
            user.facebookId = facebookId;
            user.avatar = user.avatar || picture?.data?.url;
        } else {
            user = await User.create({
                email: email || `${facebookId}@facebook.local`,
                name,
                avatar: picture?.data?.url,
                facebookId,
                isEmailVerified: true // Facebook verifies email
            });
        }
    }

    user.lastLogin = new Date();
    user.loginCount += 1;

    const { token, refreshToken } = generateTokens(user);
    await user.save();

    // Redirect to frontend with tokens
    const redirectUrl = new URL(`${process.env.FRONTEND_URL || 'https://techvision-api.onrender.com'}/auth-callback`);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('refreshToken', refreshToken);
    redirectUrl.searchParams.set('user', JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role
    }));

    res.redirect(redirectUrl.toString());
}));

module.exports = router;
