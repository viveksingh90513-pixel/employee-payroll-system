/**
 * PayRoll Pro – Helper Utilities
 * Reusable utility functions used across the application.
 */

const { MONTH_NAMES } = require('./constants');

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount
 * @returns {string} Formatted currency string (e.g., "₹1,25,000.00")
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date string to DD-MMM-YYYY (e.g., "15-Jul-2026").
 * @param {string|Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Get the month name from a month number.
 * @param {number} month - 1-12
 * @returns {string}
 */
const getMonthName = (month) => {
  return MONTH_NAMES[month - 1] || '';
};

/**
 * Calculate the number of working days in a month (excluding Sundays).
 * @param {number} month - 1-12
 * @param {number} year
 * @returns {number}
 */
const getWorkingDays = (month, year) => {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    // Count all days except Sundays (0)
    if (dayOfWeek !== 0) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * Calculate hours worked between check-in and check-out times.
 * @param {string} checkIn - HH:MM:SS format
 * @param {string} checkOut - HH:MM:SS format
 * @returns {number} Hours worked (decimal)
 */
const calculateHoursWorked = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;

  const [inH, inM] = checkIn.split(':').map(Number);
  const [outH, outM] = checkOut.split(':').map(Number);

  const totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
  return Math.max(0, parseFloat((totalMinutes / 60).toFixed(2)));
};

/**
 * Calculate the number of days between two dates (inclusive).
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @returns {number}
 */
const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Generate a random password for new employee accounts.
 * @param {number} length
 * @returns {string}
 */
const generateTempPassword = (length = 10) => {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '@$!%*?&#';
  const all = uppercase + lowercase + numbers + special;

  // Ensure at least one of each type
  let password = '';
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
};

/**
 * Sanitize a filename for safe file system storage.
 * @param {string} filename
 * @returns {string}
 */
const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-zA-Z0-9.-_]/g, '_');
};

/**
 * Create a standardized API success response.
 * @param {Object} res - Express response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Create a standardized API error response.
 * @param {Object} res - Express response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
const errorResponse = (res, message = 'Something went wrong', statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  formatCurrency,
  formatDate,
  getMonthName,
  getWorkingDays,
  calculateHoursWorked,
  calculateDaysBetween,
  generateTempPassword,
  sanitizeFilename,
  successResponse,
  errorResponse,
};
