/**
 * PayRoll Pro – Salary Routes
 */

const express = require('express');
const router = express.Router();
const salaryController = require('../controllers/salaryController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateSalary, validateId } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/salary/all/current – All current structures (Admin/HR)
router.get('/all/current', authorize('admin', 'hr'), salaryController.getAllCurrent);

// GET /api/salary/:employeeId – Current salary for an employee
router.get('/:employeeId', salaryController.getByEmployee);

// GET /api/salary/:employeeId/history – Salary history (Admin/HR)
router.get('/:employeeId/history', authorize('admin', 'hr'), salaryController.getHistory);

// POST /api/salary – Create salary structure (Admin/HR)
router.post('/', authorize('admin', 'hr'), validateSalary, salaryController.create);

// PUT /api/salary/:id – Update salary structure (Admin/HR)
router.put('/:id', authorize('admin', 'hr'), validateId, salaryController.update);

module.exports = router;
