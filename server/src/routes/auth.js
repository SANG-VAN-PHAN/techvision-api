/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authController.resendVerification);
router.post('/google', authController.googleAuth);
router.post('/facebook', authController.facebookAuth);
router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', protect, authController.getMe);

module.exports = router;
