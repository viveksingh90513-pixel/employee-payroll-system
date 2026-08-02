/**
 * PayRoll Pro – Multer File Upload Middleware
 * Configures file upload handling for profile photos.
 * Supports JPEG and PNG formats with a 2MB size limit.
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const uploadDir = path.join(process.env.VERCEL ? '/tmp' : path.join(__dirname, '..'), process.env.UPLOAD_DIR || 'uploads');
try { if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }); } catch (e) { /* read-only fs */ }

/**
 * Multer disk storage configuration.
 * Files are saved with a unique timestamp-based filename.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: profile_<userId>_<timestamp>.<ext>
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `profile_${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter to accept only JPEG and PNG images.
 * @param {import('express').Request} req
 * @param {Express.Multer.File} file
 * @param {multer.FileFilterCallback} cb
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  const allowedExtensions = ['.jpeg', '.jpg', '.png'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Only JPEG and PNG image files are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

/**
 * Configured Multer instance for single profile photo uploads.
 * Field name: 'profilePhoto'
 * Max file size: 2MB (configurable via .env MAX_FILE_SIZE)
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 2 * 1024 * 1024, // 2MB default
    files: 1,
  },
});

/**
 * Middleware to handle profile photo upload errors gracefully.
 * Wraps the multer upload to catch and format errors.
 * @param {string} fieldName - The form field name for the file
 * @returns {import('express').RequestHandler}
 */
const handleUpload = (fieldName = 'profilePhoto') => {
  return (req, res, next) => {
    const uploadSingle = upload.single(fieldName);

    uploadSingle(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          // Handle Multer-specific errors
          const messages = {
            LIMIT_FILE_SIZE: 'File size exceeds the maximum limit of 2MB.',
            LIMIT_FILE_COUNT: 'Only one file can be uploaded at a time.',
            LIMIT_UNEXPECTED_FILE: `Unexpected field name. Use '${fieldName}' as the field name.`,
          };
          return res.status(400).json({
            success: false,
            message: messages[err.code] || 'File upload error.',
          });
        }

        if (err.code === 'INVALID_FILE_TYPE') {
          return res.status(400).json({
            success: false,
            message: err.message,
          });
        }

        return res.status(500).json({
          success: false,
          message: 'An error occurred during file upload.',
        });
      }

      next();
    });
  };
};

/**
 * Utility to delete a previously uploaded file.
 * Used when updating profile photos or deleting employees.
 * @param {string} filename - The filename to delete from uploads directory
 */
const deleteUploadedFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

module.exports = { upload, handleUpload, deleteUploadedFile };
