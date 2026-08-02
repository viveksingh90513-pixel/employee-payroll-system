/**
 * PayRoll Pro – Leave Controller
 * Handles leave applications, approvals, and balance queries.
 */

const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { successResponse, errorResponse, calculateDaysBetween } = require('../utils/helpers');
const { sendLeaveStatusEmail } = require('../utils/sendEmail');

const leaveController = {
  /**
   * GET /api/leaves
   * Get leave requests with filters.
   */
  getAll: async (req, res, next) => {
    try {
      const { employeeId, status, leaveType, page = 1, limit = 10 } = req.query;

      // Employees can only see their own leaves
      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      const result = await Leave.findAll({
        employeeId: empId,
        status,
        leaveType,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return successResponse(res, result, 'Leave requests retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/leaves/:id
   * Get a single leave request by ID.
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const leave = await Leave.findById(parseInt(id, 10));

      if (!leave) {
        return errorResponse(res, 'Leave request not found.', 404);
      }

      // Employees can only view their own leaves
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee || leave.employee_id !== employee.id) {
          return errorResponse(res, 'Access denied.', 403);
        }
      }

      return successResponse(res, leave, 'Leave request details retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/leaves
   * Apply for a leave (employee submits request).
   */
  apply: async (req, res, next) => {
    try {
      const { leaveType, startDate, endDate, reason } = req.body;

      // Get the employee ID for the current user
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Employee profile not found.', 404);
      }

      // Calculate the number of days
      const days = calculateDaysBetween(startDate, endDate);

      // Check leave balance
      const currentYear = new Date(startDate).getFullYear();
      const balance = await Leave.getBalance(employee.id, currentYear);
      const leaveBalance = balance[leaveType];

      if (leaveBalance && leaveType !== 'unpaid' && days > leaveBalance.remaining) {
        return errorResponse(res,
          `Insufficient ${leaveType} leave balance. Available: ${leaveBalance.remaining} days, Requested: ${days} days.`,
          400
        );
      }

      const leave = await Leave.create({
        employeeId: employee.id,
        leaveType,
        startDate,
        endDate,
        days,
        reason,
      });

      return successResponse(res, leave, 'Leave request submitted successfully.', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/leaves/:id/status
   * Approve or reject a leave request (Admin/HR only).
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status, adminRemarks } = req.body;

      const leave = await Leave.findById(parseInt(id, 10));
      if (!leave) {
        return errorResponse(res, 'Leave request not found.', 404);
      }

      if (leave.status !== 'pending') {
        return errorResponse(res, `Cannot update a leave that is already ${leave.status}.`, 400);
      }

      const updated = await Leave.updateStatus(
        parseInt(id, 10),
        status,
        req.user.id,
        adminRemarks || null
      );

      if (!updated) {
        return errorResponse(res, 'Failed to update leave status.', 500);
      }

      // Send email notification to the employee
      await sendLeaveStatusEmail(
        leave.employee_email,
        `${leave.first_name} ${leave.last_name}`,
        leave.leave_type,
        leave.start_date,
        leave.end_date,
        status,
        adminRemarks
      );

      return successResponse(res, { id: parseInt(id, 10), status }, `Leave request ${status} successfully.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/leaves/:id/cancel
   * Cancel a pending leave request (by the employee).
   */
  cancel: async (req, res, next) => {
    try {
      const { id } = req.params;

      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Employee profile not found.', 404);
      }

      const cancelled = await Leave.cancel(parseInt(id, 10), employee.id);

      if (!cancelled) {
        return errorResponse(res, 'Cannot cancel this leave. It may have already been processed.', 400);
      }

      return successResponse(res, null, 'Leave request cancelled successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/leaves/balance
   * Get leave balance for the current employee or a specific employee.
   */
  getBalance: async (req, res, next) => {
    try {
      const { employeeId, year } = req.query;
      const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();

      let empId;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      } else {
        empId = employeeId ? parseInt(employeeId, 10) : null;
        if (!empId) return errorResponse(res, 'Employee ID is required.', 400);
      }

      const balance = await Leave.getBalance(empId, currentYear);

      return successResponse(res, { year: currentYear, balance }, 'Leave balance retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/leaves/pending-count
   * Get the count of pending leave requests (Admin/HR).
   */
  getPendingCount: async (req, res, next) => {
    try {
      const count = await Leave.getPendingCount();
      return successResponse(res, { count }, 'Pending leave count retrieved.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = leaveController;
