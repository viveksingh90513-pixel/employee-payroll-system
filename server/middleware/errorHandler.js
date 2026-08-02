/**
 * PayRoll Pro – Global Error Handler Middleware
 * Catches all errors passed via next(error) and returns structured JSON responses.
 * Must be registered as the LAST middleware in Express.
 */

/**
 * Centralized error handling middleware.
 * Handles different error types with appropriate status codes.
 *
 * @param {Error} err - The error object
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const errorHandler = (err, req, res, next) => {
  // Log the error for debugging (full stack in development)
  console.error(`❌ Error [${req.method} ${req.path}]:`, {
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  switch (true) {
    // MySQL duplicate entry error
    case err.code === 'ER_DUP_ENTRY':
      statusCode = 409;
      message = 'A record with this value already exists.';
      break;

    // MySQL foreign key constraint error
    case err.code === 'ER_ROW_IS_REFERENCED_2':
    case err.code === 'ER_NO_REFERENCED_ROW_2':
      statusCode = 400;
      message = 'Cannot perform this operation due to related records.';
      break;

    // MySQL connection error
    case err.code === 'ECONNREFUSED':
      statusCode = 503;
      message = 'Database connection failed. Please try again later.';
      break;

    // JSON parse error
    case err.type === 'entity.parse.failed':
      statusCode = 400;
      message = 'Invalid JSON in request body.';
      break;

    // Multer file upload errors
    case err.code === 'LIMIT_FILE_SIZE':
      statusCode = 400;
      message = 'File size exceeds the maximum limit of 2MB.';
      break;

    case err.code === 'LIMIT_UNEXPECTED_FILE':
      statusCode = 400;
      message = 'Unexpected file field. Please check the upload field name.';
      break;

    // Express-validator errors (validation failure)
    case err.name === 'ValidationError':
      statusCode = 422;
      break;

    // JWT errors (should be caught by auth middleware, but just in case)
    case err.name === 'JsonWebTokenError':
      statusCode = 401;
      message = 'Invalid authentication token.';
      break;

    case err.name === 'TokenExpiredError':
      statusCode = 401;
      message = 'Authentication token has expired.';
      break;

    default:
      break;
  }

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    message,
    // Include error details only in development mode
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        name: err.name,
        code: err.code,
        stack: err.stack,
      },
    }),
  });
};

module.exports = errorHandler;
