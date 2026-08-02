/**
 * PayRoll Pro – Leave Routes
 */

const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authenticate = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { validateLeave, validateLeaveStatus, validateId } = require('../middleware/validate');

// All routes require authentication
router.use(authenticate);

// GET /api/leaves/balance – Get leave balance (all roles)
router.get('/balance', leaveController.getBalance);

// GET /api/leaves/pending-count – Pending count (Admin/HR)
router.get('/pending-count', authorize('admin', 'hr'), leaveController.getPendingCount);

// GET /api/leaves – List leave requests (all roles, scoped)
router.get('/', leaveController.getAll);

// GET /api/leaves/:id – Single leave details
router.get('/:id', validateId, leaveController.getById);

// POST /api/leaves – Apply for leave (any authenticated user)
router.post('/', validateLeave, leaveController.apply);

// PUT /api/leaves/:id/status – Approve/reject (Admin/HR)
router.put('/:id/status', authorize('admin', 'hr'), validateLeaveStatus, leaveController.updateStatus);

// PUT /api/leaves/:id/cancel – Cancel leave (employee)
router.put('/:id/cancel', validateId, leaveController.cancel);

module.exports = router;
