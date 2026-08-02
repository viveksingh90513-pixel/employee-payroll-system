/**
 * PayRoll Pro – Auth Routes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validate');

// Public routes (no authentication required)
router.post('/login', validateLogin, authController.login);
router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);
router.post('/reset-password', validateResetPassword, authController.resetPassword);
router.post('/forgot-password-otp', authController.forgotPasswordOTP);
router.post('/reset-password-otp', authController.resetPasswordOTP);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.post('/change-password', authenticate, authController.changePassword);
router.post('/create-hr', authenticate, authorize('admin'), authController.createHR);

module.exports = router;
