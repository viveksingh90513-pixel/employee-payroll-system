/**
 * PayRoll Pro – Frontend Utility Constants
 * Centralized enums, routes, and configuration values.
 */

// User Roles
export const ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  EMPLOYEE: 'employee',
};

// Route paths
export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/',
  EMPLOYEES: '/employees',
  ADD_EMPLOYEE: '/employees/add',
  EDIT_EMPLOYEE: '/employees/edit',
  VIEW_EMPLOYEE: '/employees/view',
  DEPARTMENTS: '/departments',
  ATTENDANCE: '/attendance',
  MARK_ATTENDANCE: '/attendance/mark',
  LEAVES: '/leaves',
  APPLY_LEAVE: '/leaves/apply',
  SALARY: '/salary',
  PAYROLL: '/payroll',
  GENERATE_PAYROLL: '/payroll/generate',
  VIEW_PAYSLIP: '/payroll/payslip',
  REPORTS: '/reports',
  PROFILE: '/profile',
};

// Leave types for dropdowns
export const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave' },
  { value: 'sick', label: 'Sick Leave' },
  { value: 'earned', label: 'Earned Leave' },
  { value: 'maternity', label: 'Maternity Leave' },
  { value: 'paternity', label: 'Paternity Leave' },
  { value: 'unpaid', label: 'Unpaid Leave' },
];

// Attendance statuses
export const ATTENDANCE_STATUSES = [
  { value: 'present', label: 'Present', color: '#10b981' },
  { value: 'absent', label: 'Absent', color: '#ef4444' },
  { value: 'half-day', label: 'Half Day', color: '#f59e0b' },
  { value: 'late', label: 'Late', color: '#f97316' },
  { value: 'on-leave', label: 'On Leave', color: '#6366f1' },
];

// Employment types for dropdowns
export const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
];

// Gender options
export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

// Month options for dropdowns
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

// Status badge colors
export const STATUS_COLORS = {
  active: 'success',
  inactive: 'danger',
  pending: 'warning',
  approved: 'success',
  rejected: 'danger',
  cancelled: 'secondary',
  present: 'success',
  absent: 'danger',
  'half-day': 'warning',
  late: 'warning',
  'on-leave': 'info',
  generated: 'info',
  paid: 'success',
};
