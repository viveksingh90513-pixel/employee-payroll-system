/**
 * PayRoll Pro – Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');

// All routes require authentication
router.use(authenticate);

// GET /api/dashboard/stats – Overview stats (Admin/HR)
router.get('/stats', authorize('admin', 'hr'), dashboardController.getStats);

// GET /api/dashboard/charts – Chart data (Admin/HR)
router.get('/charts', authorize('admin', 'hr'), dashboardController.getCharts);

// GET /api/dashboard/employee – Employee-specific dashboard
router.get('/employee', authorize('employee'), dashboardController.getEmployeeDashboard);

module.exports = router;
