/**
 * PayRoll Pro – Profile Controller
 * Handles user profile viewing, updating, password changes, and photo uploads.
 */

const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/helpers');
const { deleteUploadedFile } = require('../middleware/upload');

const profileController = {
  /**
   * GET /api/profile
   * Get the current user's profile details.
   */
  getProfile: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Profile not found.', 404);
      }

      return successResponse(res, employee, 'Profile retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/profile
   * Update the current user's profile (limited fields).
   */
  updateProfile: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Profile not found.', 404);
      }

      // Employees can only update limited personal fields
      const allowedUpdates = {
        phone: req.body.phone,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        emergencyContactName: req.body.emergencyContactName,
        emergencyContactPhone: req.body.emergencyContactPhone,
      };

      const updated = await Employee.update(employee.id, allowedUpdates);

      if (!updated) {
        return errorResponse(res, 'No changes were made.', 400);
      }

      const updatedProfile = await Employee.findByUserId(req.user.id);
      return successResponse(res, updatedProfile, 'Profile updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/profile/password
   * Change the current user's password.
   */
  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get current user with password hash
      const user = await User.findById(req.user.id);
      if (!user) {
        return errorResponse(res, 'User not found.', 404);
      }

      // Verify current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isPasswordValid) {
        return errorResponse(res, 'Current password is incorrect.', 400);
      }

      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(newPassword, salt);

      // Update password
      await User.updatePassword(user.id, passwordHash);

      return successResponse(res, null, 'Password changed successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/profile/photo
   * Upload or update profile photo.
   */
  uploadPhoto: async (req, res, next) => {
    try {
      if (!req.file) {
        return errorResponse(res, 'No photo file provided.', 400);
      }

      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Profile not found.', 404);
      }

      // Delete old photo if exists
      if (employee.profile_photo) {
        deleteUploadedFile(employee.profile_photo);
      }

      // Update profile photo
      await Employee.update(employee.id, { profilePhoto: req.file.filename });

      return successResponse(res, {
        profilePhoto: req.file.filename,
      }, 'Profile photo updated successfully.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = profileController;
