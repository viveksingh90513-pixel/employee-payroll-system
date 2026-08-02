/**
 * PayRoll Pro – Employee Routes
 */

const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { handleUpload } = require('../middleware/upload');
const { validateEmployee, validateEmployeeUpdate, validateId } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/employees/all – Minimal list for dropdowns (any authenticated user)
router.get('/all', employeeController.getAllMinimal);

// GET /api/employees – List with pagination (Admin/HR)
router.get('/', authorize('admin', 'hr'), employeeController.getAll);

// GET /api/employees/:id – Single employee details (Admin/HR)
router.get('/:id', authorize('admin', 'hr'), validateId, employeeController.getById);

// POST /api/employees – Create employee (Admin/HR)
router.post('/', authorize('admin', 'hr'), handleUpload('profilePhoto'), validateEmployee, employeeController.create);

// PUT /api/employees/:id – Update employee (Admin/HR)
router.put('/:id', authorize('admin', 'hr'), handleUpload('profilePhoto'), validateEmployeeUpdate, employeeController.update);

// DELETE /api/employees/:id – Delete employee (Admin only)
router.delete('/:id', authorize('admin'), validateId, employeeController.delete);

// PATCH /api/employees/:id/status – Toggle active status (Admin only)
router.patch('/:id/status', authorize('admin'), validateId, employeeController.toggleStatus);

// POST /api/employees/:id/reset-password – Reset employee password (Admin/HR)
router.post('/:id/reset-password', authorize('admin', 'hr'), validateId, employeeController.resetPassword);

// POST /api/employees/:id/send-credentials – Send credentials email (Admin/HR)
router.post('/:id/send-credentials', authorize('admin', 'hr'), validateId, employeeController.sendCredentialsEmail);

module.exports = router;
