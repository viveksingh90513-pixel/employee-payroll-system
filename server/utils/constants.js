/**
 * PayRoll Pro – Application Constants
 * Centralized constants used across the application.
 */

// User roles
const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
};

// Attendance statuses
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half-day',
  LATE: 'late',
  ON_LEAVE: 'on-leave',
};

// Leave types
const LEAVE_TYPES = {
  CASUAL: 'casual',
  SICK: 'sick',
  EARNED: 'earned',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  UNPAID: 'unpaid',
};

// Leave statuses
const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Payroll statuses
const PAYROLL_STATUS = {
  GENERATED: 'generated',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// Employment types
const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERN: 'intern',
};

// Default leave quotas (annual)
const LEAVE_QUOTAS = {
  casual: 12,
  sick: 12,
  earned: 15,
  maternity: 180,
  paternity: 15,
  unpaid: 999,
};

// Month names for display
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Pagination defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  ATTENDANCE_STATUS,
  LEAVE_TYPES,
  LEAVE_STATUS,
  PAYROLL_STATUS,
  EMPLOYMENT_TYPES,
  LEAVE_QUOTAS,
  MONTH_NAMES,
  PAGINATION,
};
