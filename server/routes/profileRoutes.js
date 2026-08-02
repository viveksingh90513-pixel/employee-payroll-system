/**
 * PayRoll Pro – Profile Routes
 */

const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const authenticate = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');
const { validateProfileUpdate, validatePasswordChange } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/profile – Get current user's profile
router.get('/', profileController.getProfile);

// PUT /api/profile – Update profile (limited fields)
router.put('/', validateProfileUpdate, profileController.updateProfile);

// PUT /api/profile/password – Change password
router.put('/password', validatePasswordChange, profileController.changePassword);

// POST /api/profile/photo – Upload profile photo
router.post('/photo', handleUpload('profilePhoto'), profileController.uploadPhoto);

module.exports = router;
