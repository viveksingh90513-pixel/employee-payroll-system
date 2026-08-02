/**
 * PayRoll Pro – Department Routes
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateDepartment, validateId } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/departments/active – Active departments for dropdowns (any user)
router.get('/active', departmentController.getActive);

// GET /api/departments – List all with counts (Admin/HR)
router.get('/', authorize('admin', 'hr'), departmentController.getAll);

// GET /api/departments/:id – Single department (Admin/HR)
router.get('/:id', authorize('admin', 'hr'), validateId, departmentController.getById);

// POST /api/departments – Create (Admin only)
router.post('/', authorize('admin'), validateDepartment, departmentController.create);

// PUT /api/departments/:id – Update (Admin only)
router.put('/:id', authorize('admin'), validateId, departmentController.update);

// DELETE /api/departments/:id – Delete (Admin only)
router.delete('/:id', authorize('admin'), validateId, departmentController.delete);

module.exports = router;
