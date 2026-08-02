/**
 * PayRoll Pro – Report Routes
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All report routes require authentication and Admin/HR role
router.use(authenticate);
router.use(authorize('admin', 'hr'));

// GET /api/reports/payroll – Payroll summary report
router.get('/payroll', reportController.getPayrollReport);

// GET /api/reports/attendance – Attendance summary report
router.get('/attendance', reportController.getAttendanceReport);

// GET /api/reports/department – Department-wise report
router.get('/department', reportController.getDepartmentReport);

// GET /api/reports/leave – Leave summary report
router.get('/leave', reportController.getLeaveReport);

// GET /api/reports/payroll-trend – Payroll trend data
router.get('/payroll-trend', reportController.getPayrollTrend);

module.exports = router;
