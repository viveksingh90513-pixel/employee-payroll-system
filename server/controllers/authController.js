/**
 * PayRoll Pro – Auth Controller
 * Handles user authentication: login, forgot password, reset password.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { successResponse, errorResponse } = require('../utils/helpers');
const { sendPasswordResetEmail } = require('../utils/sendEmail');

const authController = {
  /**
   * POST /api/auth/login
   * Authenticate user with email and password, return JWT token.
   */
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return errorResponse(res, 'Invalid email or password.', 401);
      }

      // Check if account is active
      if (!user.is_active) {
        return errorResponse(res, 'Your account has been deactivated. Please contact the administrator.', 403);
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse(res, 'Invalid email or password.', 401);
      }

      // Get employee details for the token payload
      const employee = await Employee.findByUserId(user.id);
      const isFirstLogin = user.is_first_login === 1;

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
          isFirstLogin,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      // Update last login timestamp
      await User.updateLastLogin(user.id);

      return successResponse(res, {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          isFirstLogin,
          employeeId: employee ? employee.id : null,
          firstName: employee ? employee.first_name : 'Admin',
          lastName: employee ? employee.last_name : '',
          empCode: employee ? employee.emp_code : null,
          phone: employee ? employee.phone : null,
          profilePhoto: employee ? employee.profile_photo : null,
          designation: employee ? employee.designation : user.role,
          department: employee ? employee.department_name : null,
        },
      }, 'Login successful.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/change-password
   * First login or voluntary password change endpoint.
   */
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!newPassword || newPassword.length < 8) {
        return errorResponse(res, 'New password must be at least 8 characters long.', 400);
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found.', 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse(res, 'Current password is incorrect.', 400);
      }

      // Hash the new password with bcrypt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password and clear is_first_login
      await User.updatePassword(user.id, passwordHash);

      return successResponse(res, { isFirstLogin: false }, 'Password updated successfully. You can now access your dashboard.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/forgot-password-otp
   * Generate and send a 6-digit OTP to the user's email address.
   */
  forgotPasswordOTP: async (req, res, next) => {
    try {
      const { email } = req.body;

      if (!email) {
        return errorResponse(res, 'Email address is required.', 400);
      }

      const user = await User.findByEmail(email);
      if (!user) {
        // Return success message to avoid account enumeration
        return successResponse(res, null, 'If this email is registered, an OTP has been sent to it.');
      }

      // Generate 6-digit numeric OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

      await User.setOTP(user.id, otp, expiry);

      const employee = await Employee.findByUserId(user.id);
      const name = employee ? `${employee.first_name} ${employee.last_name}` : 'Employee';

      // Send OTP via email
      await sendPasswordResetEmail(user.email, name, `Your OTP code is: ${otp}`);

      return successResponse(res, { otpSent: true, otp }, 'If this email is registered, an OTP has been sent to it.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/reset-password-otp
   * Verify 6-digit OTP and reset user password.
   */
  resetPasswordOTP: async (req, res, next) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return errorResponse(res, 'Email, OTP, and new password are required.', 400);
      }

      if (newPassword.length < 8) {
        return errorResponse(res, 'New password must be at least 8 characters long.', 400);
      }

      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(newPassword, salt);

      const success = await User.resetPasswordWithOTP(email, otp, newPasswordHash);
      if (!success) {
        return errorResponse(res, 'Invalid or expired OTP. Please request a new OTP.', 400);
      }

      return successResponse(res, null, 'Password reset successful. You can now login with your new password.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/forgot-password
   * Send a password reset link to the user's email.
   */
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists for security
        return successResponse(res, null, 'If this email is registered, you will receive a password reset link.');
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      // Save token to database
      await User.setResetToken(user.id, resetToken, resetTokenExpiry);

      // Get employee name for email
      const employee = await Employee.findByUserId(user.id);
      const name = employee ? `${employee.first_name} ${employee.last_name}` : 'User';

      // Send reset email
      await sendPasswordResetEmail(user.email, name, resetToken);

      return successResponse(res, null, 'If this email is registered, you will receive a password reset link.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/reset-password
   * Reset password using the reset token.
   */
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword } = req.body;

      // Find user by valid reset token
      const user = await User.findByResetToken(token);
      if (!user) {
        return errorResponse(res, 'Invalid or expired reset token. Please request a new password reset.', 400);
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      await User.updatePassword(user.id, passwordHash);

      return successResponse(res, null, 'Password has been reset successfully. You can now login with your new password.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/auth/me
   * Get the currently authenticated user's profile.
   */
  getMe: async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found.', 404);
      }

      const employee = await Employee.findByUserId(user.id);

      return successResponse(res, {
        id: user.id,
        email: user.email,
        role: user.role,
        isFirstLogin: user.is_first_login === 1,
        employeeId: employee ? employee.id : null,
        firstName: employee ? employee.first_name : 'Admin',
        lastName: employee ? employee.last_name : '',
        empCode: employee ? employee.emp_code : null,
        phone: employee ? employee.phone : null,
        profilePhoto: employee ? employee.profile_photo : null,
        designation: employee ? employee.designation : user.role,
        department: employee ? employee.department_name : null,
      }, 'User profile retrieved.');
    } catch (error) {
      next(error);
    }
  },
  /**
   * POST /api/auth/create-hr
   * Create HR account (Admin only). Default password: Admin@123.
   */
  createHR: async (req, res, next) => {
    try {
      const { email, firstName, lastName, phone } = req.body;

      if (!email || !firstName || !lastName) {
        return errorResponse(res, 'Email, first name, and last name are required.', 400);
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 'An account with this email already exists.', 409);
      }

      const tempPassword = 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      const user = await User.create({ email, passwordHash, role: 'hr', isFirstLogin: 1 });
      const empCode = await Employee.generateEmpCode();
      const employee = await Employee.create({
        userId: user.id,
        empCode,
        firstName,
        lastName,
        phone: phone || null,
        designation: 'HR Manager',
        dateOfJoining: new Date().toISOString().split('T')[0],
        employmentType: 'full-time',
      });

      return successResponse(res, {
        user: { id: user.id, email: user.email, role: 'hr' },
        employee,
        tempPassword,
      }, 'HR account created successfully.', 201);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = authController;
