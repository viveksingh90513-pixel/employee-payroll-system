/**
 * PayRoll Pro – Input Validation Middleware
 * Express-validator chains for each entity type.
 * Validates and sanitizes all user inputs before they reach controllers.
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check for validation errors and return them as a 422 response.
 * Must be placed AFTER validation chains in the route middleware array.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format errors into a user-friendly structure
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return res.status(422).json({
      success: false,
      message: 'Validation failed. Please check your input.',
      errors: formattedErrors,
    });
  }

  next();
};

// ============================================================
// Auth Validation Rules
// ============================================================

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
  handleValidationErrors,
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  handleValidationErrors,
];

const validateResetPassword = [
  body('token')
    .notEmpty().withMessage('Reset token is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character.'),
  handleValidationErrors,
];

// ============================================================
// Employee Validation Rules
// ============================================================

const validateEmployee = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required.')
    .isEmail().withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters.'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters.'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim(),
  body('dob')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('Date of birth must be a valid date (YYYY-MM-DD).'),
  body('gender')
    .optional({ checkFalsy: true }),
  body('departmentId')
    .optional({ checkFalsy: true }),
  body('designation')
    .optional({ checkFalsy: true }),
  body('dateOfJoining')
    .optional({ checkFalsy: true }),
  body('employmentType')
    .optional({ checkFalsy: true }),
  body('address')
    .optional({ checkFalsy: true }),
  body('city')
    .optional({ checkFalsy: true }),
  body('state')
    .optional({ checkFalsy: true }),
  body('zipCode')
    .optional({ checkFalsy: true }),
  body('panNumber')
    .optional({ checkFalsy: true }),
  handleValidationErrors,
];

const validateEmployeeUpdate = [
  param('id')
    .isInt({ min: 1 }).withMessage('Employee ID must be a positive integer.'),
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('First name must be between 2 and 100 characters.')
    .matches(/^[a-zA-Z\s]+$/).withMessage('First name can only contain letters and spaces.'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('Last name must be between 1 and 100 characters.')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Last name can only contain letters and spaces.'),
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number.'),
  body('departmentId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('Department ID must be a positive integer.'),
  handleValidationErrors,
];

// ============================================================
// Department Validation Rules
// ============================================================

const validateDepartment = [
  body('name')
    .trim()
    .notEmpty().withMessage('Department name is required.')
    .isLength({ min: 2, max: 100 }).withMessage('Department name must be between 2 and 100 characters.'),
  body('description')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters.'),
  body('headId')
    .optional({ values: 'null' })
    .isInt({ min: 1 }).withMessage('Head ID must be a positive integer.'),
  handleValidationErrors,
];

// ============================================================
// Attendance Validation Rules
// ============================================================

const validateAttendance = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required.')
    .isInt({ min: 1 }).withMessage('Employee ID must be a positive integer.'),
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD).'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['present', 'absent', 'half-day', 'late', 'on-leave'])
    .withMessage('Status must be present, absent, half-day, late, or on-leave.'),
  body('checkIn')
    .optional({ values: 'null' })
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Check-in time must be in HH:MM:SS format.'),
  body('checkOut')
    .optional({ values: 'null' })
    .matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
    .withMessage('Check-out time must be in HH:MM:SS format.'),
  handleValidationErrors,
];

const validateBulkAttendance = [
  body('date')
    .notEmpty().withMessage('Date is required.')
    .isISO8601().withMessage('Date must be a valid date (YYYY-MM-DD).'),
  body('records')
    .isArray({ min: 1 }).withMessage('At least one attendance record is required.'),
  body('records.*.employeeId')
    .isInt({ min: 1 }).withMessage('Each record must have a valid employee ID.'),
  body('records.*.status')
    .isIn(['present', 'absent', 'half-day', 'late', 'on-leave'])
    .withMessage('Each record must have a valid status.'),
  handleValidationErrors,
];

// ============================================================
// Leave Validation Rules
// ============================================================

const validateLeave = [
  body('leaveType')
    .notEmpty().withMessage('Leave type is required.')
    .isIn(['casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid'])
    .withMessage('Leave type must be casual, sick, earned, maternity, paternity, or unpaid.'),
  body('startDate')
    .notEmpty().withMessage('Start date is required.')
    .isISO8601().withMessage('Start date must be a valid date (YYYY-MM-DD).'),
  body('endDate')
    .notEmpty().withMessage('End date is required.')
    .isISO8601().withMessage('End date must be a valid date (YYYY-MM-DD).')
    .custom((value, { req }) => {
      if (new Date(value) < new Date(req.body.startDate)) {
        throw new Error('End date must be on or after the start date.');
      }
      return true;
    }),
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason for leave is required.')
    .isLength({ min: 10, max: 500 }).withMessage('Reason must be between 10 and 500 characters.'),
  handleValidationErrors,
];

const validateLeaveStatus = [
  param('id')
    .isInt({ min: 1 }).withMessage('Leave ID must be a positive integer.'),
  body('status')
    .notEmpty().withMessage('Status is required.')
    .isIn(['approved', 'rejected']).withMessage('Status must be approved or rejected.'),
  body('adminRemarks')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 }).withMessage('Remarks must not exceed 500 characters.'),
  handleValidationErrors,
];

// ============================================================
// Salary Structure Validation Rules
// ============================================================

const validateSalary = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required.')
    .isInt({ min: 1 }).withMessage('Employee ID must be a positive integer.'),
  body('basicSalary')
    .notEmpty().withMessage('Basic salary is required.')
    .isFloat({ min: 0 }).withMessage('Basic salary must be a non-negative number.'),
  body('hra')
    .optional().isFloat({ min: 0 }).withMessage('HRA must be a non-negative number.'),
  body('da')
    .optional().isFloat({ min: 0 }).withMessage('DA must be a non-negative number.'),
  body('ta')
    .optional().isFloat({ min: 0 }).withMessage('TA must be a non-negative number.'),
  body('medicalAllowance')
    .optional().isFloat({ min: 0 }).withMessage('Medical allowance must be a non-negative number.'),
  body('specialAllowance')
    .optional().isFloat({ min: 0 }).withMessage('Special allowance must be a non-negative number.'),
  body('pfDeduction')
    .optional().isFloat({ min: 0 }).withMessage('PF deduction must be a non-negative number.'),
  body('esiDeduction')
    .optional().isFloat({ min: 0 }).withMessage('ESI deduction must be a non-negative number.'),
  body('taxDeduction')
    .optional().isFloat({ min: 0 }).withMessage('Tax deduction must be a non-negative number.'),
  body('professionalTax')
    .optional().isFloat({ min: 0 }).withMessage('Professional tax must be a non-negative number.'),
  body('otherDeductions')
    .optional().isFloat({ min: 0 }).withMessage('Other deductions must be a non-negative number.'),
  body('effectiveFrom')
    .notEmpty().withMessage('Effective from date is required.')
    .isISO8601().withMessage('Effective from must be a valid date (YYYY-MM-DD).'),
  handleValidationErrors,
];

// ============================================================
// Payroll Validation Rules
// ============================================================

const validatePayrollGeneration = [
  body('month')
    .notEmpty().withMessage('Month is required.')
    .isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12.'),
  body('year')
    .notEmpty().withMessage('Year is required.')
    .isInt({ min: 2020, max: 2099 }).withMessage('Year must be between 2020 and 2099.'),
  body('employeeIds')
    .optional()
    .isArray().withMessage('Employee IDs must be an array.'),
  body('employeeIds.*')
    .optional()
    .isInt({ min: 1 }).withMessage('Each employee ID must be a positive integer.'),
  handleValidationErrors,
];

// ============================================================
// Profile Validation Rules
// ============================================================

const validateProfileUpdate = [
  body('phone')
    .optional({ values: 'null' })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit Indian mobile number.'),
  body('address')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 500 }).withMessage('Address must not exceed 500 characters.'),
  body('city')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 }).withMessage('City must not exceed 100 characters.'),
  body('state')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 }).withMessage('State must not exceed 100 characters.'),
  body('zipCode')
    .optional({ values: 'null' })
    .trim()
    .matches(/^\d{6}$/).withMessage('Please enter a valid 6-digit PIN code.'),
  body('emergencyContactName')
    .optional({ values: 'null' })
    .trim()
    .isLength({ max: 100 }).withMessage('Emergency contact name must not exceed 100 characters.'),
  body('emergencyContactPhone')
    .optional({ values: 'null' })
    .trim()
    .matches(/^[6-9]\d{9}$/).withMessage('Please enter a valid 10-digit emergency contact number.'),
  handleValidationErrors,
];

const validatePasswordChange = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required.'),
  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters long.')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])/)
    .withMessage('Password must contain at least one uppercase, one lowercase, one number, and one special character.'),
  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match.');
      }
      return true;
    }),
  handleValidationErrors,
];

// ============================================================
// Generic Parameter Validation
// ============================================================

const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID must be a positive integer.'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateEmployee,
  validateEmployeeUpdate,
  validateDepartment,
  validateAttendance,
  validateBulkAttendance,
  validateLeave,
  validateLeaveStatus,
  validateSalary,
  validatePayrollGeneration,
  validateProfileUpdate,
  validatePasswordChange,
  validateId,
};
