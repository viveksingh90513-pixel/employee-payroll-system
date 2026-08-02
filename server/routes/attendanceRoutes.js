/**
 * PayRoll Pro – Attendance Routes
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateAttendance, validateBulkAttendance } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/attendance/calendar – Monthly calendar view
router.get('/calendar', attendanceController.getMonthlyCalendar);

// POST /api/attendance/check-in – Self check-in with GPS location
router.post('/check-in', attendanceController.checkIn);

// POST /api/attendance/check-out – Self check-out with GPS location & overtime
router.post('/check-out', attendanceController.checkOut);

// GET /api/attendance/qr-code – Generate kiosk QR code token
router.get('/qr-code', attendanceController.generateQRCode);

// POST /api/attendance/qr-scan – Scan QR code for check-in
router.post('/qr-scan', attendanceController.scanQRCode);

// POST /api/attendance/biometric – Biometric device API integration
router.post('/biometric', attendanceController.biometricSync);

// GET /api/attendance – List records (all roles, scoped by role)
router.get('/', attendanceController.getAll);

// GET /api/attendance/report – Monthly report
router.get('/report', attendanceController.getMonthlyReport);

// GET /api/attendance/summary – Employee summary
router.get('/summary', attendanceController.getSummary);

// GET /api/attendance/daily-summary – Today's summary (Admin/HR)
router.get('/daily-summary', authorize('admin', 'hr'), attendanceController.getDailySummary);

// POST /api/attendance – Mark single attendance (Admin/HR)
router.post('/', authorize('admin', 'hr'), validateAttendance, attendanceController.mark);

// POST /api/attendance/bulk – Mark bulk attendance (Admin/HR)
router.post('/bulk', authorize('admin', 'hr'), validateBulkAttendance, attendanceController.bulkMark);

module.exports = router;
