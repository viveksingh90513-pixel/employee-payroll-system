/**
 * PayRoll Pro – Payroll Routes
 */

const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validatePayrollGeneration, validateId } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/payroll/monthly-total – Monthly totals (Admin/HR)
router.get('/monthly-total', authorize('admin', 'hr'), payrollController.getMonthlyTotal);

// GET /api/payroll – List payroll records (all roles, scoped)
router.get('/', payrollController.getAll);

// GET /api/payroll/:id – Single payroll details
router.get('/:id', validateId, payrollController.getById);

// POST /api/payroll/generate – Generate payroll (Admin/HR)
router.post('/generate', authorize('admin', 'hr'), validatePayrollGeneration, payrollController.generate);

// PUT /api/payroll/:id/status – Update payroll status (Admin/HR)
router.put('/:id/status', authorize('admin', 'hr'), validateId, payrollController.updateStatus);

// PUT /api/payroll/:id/pay – Mark as paid (Admin)
router.put('/:id/pay', authorize('admin'), validateId, payrollController.markAsPaid);

// GET /api/payroll/:id/payslip – Download payslip PDF
router.get('/:id/payslip', validateId, payrollController.downloadPayslip);

// POST /api/payroll/:id/send-payslip – Send payslip via email (Admin/HR)
router.post('/:id/send-payslip', authorize('admin', 'hr'), validateId, payrollController.sendPayslipEmail);

module.exports = router;
