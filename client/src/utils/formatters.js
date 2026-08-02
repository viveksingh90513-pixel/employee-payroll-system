/**
 * PayRoll Pro – Formatters
 * Utility functions for formatting values in the UI.
 */

/**
 * Format a number as Indian Rupee currency.
 * @param {number} amount
 * @returns {string} e.g., "₹1,25,000"
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format a date string for display.
 * @param {string} date - ISO date string
 * @param {string} format - 'short', 'long', 'full'
 * @returns {string}
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  const d = new Date(date);

  const options = {
    short: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' },
  };

  return d.toLocaleDateString('en-IN', options[format] || options.short);
};

/**
 * Format a time string (HH:MM:SS → hh:mm AM/PM).
 * @param {string} time
 * @returns {string}
 */
export const formatTime = (time) => {
  if (!time) return '-';
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Get month name from month number.
 * @param {number} month - 1-12
 * @returns {string}
 */
export const getMonthName = (month) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return months[month - 1] || '';
};

/**
 * Get short month name.
 * @param {number} month - 1-12
 * @returns {string}
 */
export const getShortMonthName = (month) => {
  return getMonthName(month).substring(0, 3);
};

/**
 * Capitalize the first letter of a string.
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/-/g, ' ');
};

/**
 * Truncate a string to a specified length.
 * @param {string} str
 * @param {number} maxLength
 * @returns {string}
 */
export const truncate = (str, maxLength = 30) => {
  if (!str || str.length <= maxLength) return str || '';
  return str.substring(0, maxLength) + '...';
};

/**
 * Get initials from a name (first + last).
 * @param {string} firstName
 * @param {string} lastName
 * @returns {string}
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() : '';
  const last = lastName ? lastName.charAt(0).toUpperCase() : '';
  return `${first}${last}`;
};

/**
 * Format large numbers with K, L, Cr suffixes (Indian format).
 * @param {number} num
 * @returns {string}
 */
export const formatCompactNumber = (num) => {
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};
