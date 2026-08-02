/**
 * PayRoll Pro – Leave Model (Data Access Layer)
 * Handles all database operations for the leaves table.
 */

const { pool } = require('../config/db');

const Leave = {
  /**
   * Find all leave requests with filters (paginated).
   * @param {Object} options - { employeeId, status, leaveType, page, limit }
   * @returns {Promise<{ leaves: Array, total: number }>}
   */
  findAll: async ({ employeeId, status, leaveType, page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    const params = [];

    if (employeeId) {
      whereConditions.push('l.employee_id = ?');
      params.push(employeeId);
    }
    if (status) {
      whereConditions.push('l.status = ?');
      params.push(status);
    }
    if (leaveType) {
      whereConditions.push('l.leave_type = ?');
      params.push(leaveType);
    }

    const whereClause = whereConditions.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM leaves l WHERE ${whereClause}`,
      params
    );

    const [leaves] = await pool.query(
      `SELECT l.*, 
              e.first_name, e.last_name, e.emp_code, 
              d.name as department_name,
              CONCAT(approver_emp.first_name, ' ', approver_emp.last_name) as approved_by_name
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN users approver_u ON l.approved_by = approver_u.id
       LEFT JOIN employees approver_emp ON approver_u.id = approver_emp.user_id
       WHERE ${whereClause}
       ORDER BY l.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      leaves,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  },

  /**
   * Find a leave request by ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT l.*, 
              e.first_name, e.last_name, e.emp_code,
              u.email as employee_email,
              d.name as department_name
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE l.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new leave request.
   * @param {Object} data - { employeeId, leaveType, startDate, endDate, days, reason }
   * @returns {Promise<Object>}
   */
  create: async ({ employeeId, leaveType, startDate, endDate, days, reason }) => {
    const [result] = await pool.query(
      `INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [employeeId, leaveType, startDate, endDate, days, reason]
    );
    return { id: result.insertId, employeeId, leaveType, startDate, endDate, days, status: 'pending' };
  },

  /**
   * Update leave status (approve/reject).
   * @param {number} id
   * @param {string} status - 'approved' or 'rejected'
   * @param {number} approvedBy - User ID
   * @param {string} adminRemarks
   * @returns {Promise<boolean>}
   */
  updateStatus: async (id, status, approvedBy, adminRemarks = null) => {
    const [result] = await pool.query(
      `UPDATE leaves SET status = ?, approved_by = ?, admin_remarks = ?, action_on = NOW()
       WHERE id = ? AND status = 'pending'`,
      [status, approvedBy, adminRemarks, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Cancel a leave request (by the employee).
   * @param {number} id
   * @param {number} employeeId - Verify ownership
   * @returns {Promise<boolean>}
   */
  cancel: async (id, employeeId) => {
    const [result] = await pool.query(
      `UPDATE leaves SET status = 'cancelled' WHERE id = ? AND employee_id = ? AND status = 'pending'`,
      [id, employeeId]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get leave balance for an employee in the current year.
   * Returns approved leaves by type with a default annual quota.
   * @param {number} employeeId
   * @param {number} year
   * @returns {Promise<Object>}
   */
  getBalance: async (employeeId, year) => {
    // Default annual leave quotas (configurable per company policy)
    const quotas = {
      casual: 12,
      sick: 12,
      earned: 15,
      maternity: 180,
      paternity: 15,
      unpaid: 999, // Unlimited but tracked
    };

    const [usedLeaves] = await pool.query(
      `SELECT leave_type, COALESCE(SUM(days), 0) as used
       FROM leaves
       WHERE employee_id = ? AND YEAR(start_date) = ? AND status = 'approved'
       GROUP BY leave_type`,
      [employeeId, year]
    );

    const balance = {};
    for (const [type, quota] of Object.entries(quotas)) {
      const used = usedLeaves.find((l) => l.leave_type === type);
      balance[type] = {
        total: quota,
        used: used ? parseFloat(used.used) : 0,
        remaining: quota - (used ? parseFloat(used.used) : 0),
      };
    }

    return balance;
  },

  /**
   * Get count of pending leave requests.
   * @returns {Promise<number>}
   */
  getPendingCount: async () => {
    const [rows] = await pool.query(
      "SELECT COUNT(*) as count FROM leaves WHERE status = 'pending'"
    );
    return rows[0].count;
  },

  /**
   * Get approved leaves for an employee in a specific month (for payroll).
   * @param {number} employeeId
   * @param {number} month
   * @param {number} year
   * @returns {Promise<number>} Total leave days
   */
  getApprovedLeaveDays: async (employeeId, month, year) => {
    const [rows] = await pool.query(
      `SELECT COALESCE(SUM(days), 0) as total_days
       FROM leaves
       WHERE employee_id = ? 
         AND status = 'approved'
         AND ((MONTH(start_date) = ? AND YEAR(start_date) = ?) 
              OR (MONTH(end_date) = ? AND YEAR(end_date) = ?))`,
      [employeeId, month, year, month, year]
    );
    return parseFloat(rows[0].total_days);
  },

  /**
   * Get recent leave requests for dashboard.
   * @param {number} limit
   * @returns {Promise<Array>}
   */
  getRecent: async (limit = 5) => {
    const [rows] = await pool.query(
      `SELECT l.*, e.first_name, e.last_name, e.emp_code
       FROM leaves l
       JOIN employees e ON l.employee_id = e.id
       ORDER BY l.created_at DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  },
};

module.exports = Leave;
