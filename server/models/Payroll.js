/**
 * PayRoll Pro – Payroll Model (Data Access Layer)
 * Handles all database operations for the payrolls and payslips tables.
 */

const { pool } = require('../config/db');

const Payroll = {
  /**
   * Find all payroll records with filters (paginated).
   * @param {Object} options - { employeeId, month, year, status, page, limit }
   * @returns {Promise<{ payrolls: Array, total: number }>}
   */
  findAll: async ({ employeeId, month, year, status, page = 1, limit = 10 } = {}) => {
    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    const params = [];

    if (employeeId) {
      whereConditions.push('p.employee_id = ?');
      params.push(employeeId);
    }
    if (month) {
      whereConditions.push('p.month = ?');
      params.push(month);
    }
    if (year) {
      whereConditions.push('p.year = ?');
      params.push(year);
    }
    if (status) {
      whereConditions.push('p.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM payrolls p WHERE ${whereClause}`,
      params
    );

    const [payrolls] = await pool.query(
      `SELECT p.*, e.first_name, e.last_name, e.emp_code, e.designation,
              d.name as department_name,
              ps.id as payslip_id, ps.file_path as payslip_path
       FROM payrolls p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN payslips ps ON p.id = ps.payroll_id
       WHERE ${whereClause}
       ORDER BY p.year DESC, p.month DESC, e.first_name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      payrolls,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  },

  /**
   * Find a single payroll record by ID with full details.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT p.*, e.first_name, e.last_name, e.emp_code, e.designation,
              e.bank_name, e.bank_account_no, e.ifsc_code, e.pan_number,
              e.date_of_joining,
              d.name as department_name,
              u.email,
              ps.id as payslip_id, ps.file_path as payslip_path, ps.file_name as payslip_filename
       FROM payrolls p
       JOIN employees e ON p.employee_id = e.id
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN payslips ps ON p.id = ps.payroll_id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Check if payroll already exists for an employee in a month/year.
   * @param {number} employeeId
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Object|null>}
   */
  findExisting: async (employeeId, month, year) => {
    const [rows] = await pool.query(
      'SELECT id, status FROM payrolls WHERE employee_id = ? AND month = ? AND year = ?',
      [employeeId, month, year]
    );
    return rows[0] || null;
  },

  /**
   * Generate a payroll record for an employee.
   * @param {Object} data - Complete payroll data
   * @returns {Promise<Object>}
   */
  generate: async (data) => {
    const {
      employeeId, month, year, workingDays, presentDays, leaveDays, absentDays,
      basicPay, hra, da, ta, medicalAllowance, specialAllowance, totalEarnings,
      pfDeduction, esiDeduction, taxDeduction, professionalTax, otherDeductions,
      lossOfPay, totalDeductions, grossPay, netPay, generatedBy,
    } = data;

    const [result] = await pool.query(
      `INSERT INTO payrolls (
        employee_id, month, year, working_days, present_days, leave_days, absent_days,
        basic_pay, hra, da, ta, medical_allowance, special_allowance, total_earnings,
        pf_deduction, esi_deduction, tax_deduction, professional_tax, other_deductions,
        loss_of_pay, total_deductions, gross_pay, net_pay, status, generated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'generated', ?)
      ON DUPLICATE KEY UPDATE
        working_days = VALUES(working_days), present_days = VALUES(present_days),
        leave_days = VALUES(leave_days), absent_days = VALUES(absent_days),
        basic_pay = VALUES(basic_pay), hra = VALUES(hra), da = VALUES(da),
        ta = VALUES(ta), medical_allowance = VALUES(medical_allowance),
        special_allowance = VALUES(special_allowance), total_earnings = VALUES(total_earnings),
        pf_deduction = VALUES(pf_deduction), esi_deduction = VALUES(esi_deduction),
        tax_deduction = VALUES(tax_deduction), professional_tax = VALUES(professional_tax),
        other_deductions = VALUES(other_deductions), loss_of_pay = VALUES(loss_of_pay),
        total_deductions = VALUES(total_deductions), gross_pay = VALUES(gross_pay),
        net_pay = VALUES(net_pay), generated_by = VALUES(generated_by),
        status = 'generated'`,
      [
        employeeId, month, year, workingDays, presentDays, leaveDays, absentDays,
        basicPay, hra, da, ta, medicalAllowance, specialAllowance, totalEarnings,
        pfDeduction, esiDeduction, taxDeduction, professionalTax, otherDeductions,
        lossOfPay, totalDeductions, grossPay, netPay, generatedBy,
      ]
    );

    return { id: result.insertId || result.affectedRows, ...data };
  },

  /**
   * Update payroll status (mark as paid).
   * @param {number} id
   * @param {string} status
   * @param {Object} paymentDetails - { paidOn, paymentMode, transactionRef }
   * @returns {Promise<boolean>}
   */
  updateStatus: async (id, status, paymentDetails = {}) => {
    const { paidOn, paymentMode, transactionRef } = paymentDetails;
    const [result] = await pool.query(
      `UPDATE payrolls SET status = ?, paid_on = ?, payment_mode = ?, transaction_ref = ?
       WHERE id = ?`,
      [status, paidOn || null, paymentMode || 'bank_transfer', transactionRef || null, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Save a payslip record (after PDF generation).
   * @param {number} payrollId
   * @param {string} filePath
   * @param {string} fileName
   * @returns {Promise<Object>}
   */
  savePayslip: async (payrollId, filePath, fileName) => {
    const [result] = await pool.query(
      `INSERT INTO payslips (payroll_id, file_path, file_name)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE file_path = VALUES(file_path), file_name = VALUES(file_name)`,
      [payrollId, filePath, fileName]
    );
    return { id: result.insertId, payrollId, filePath, fileName };
  },

  /**
   * Get payslip file info by payroll ID.
   * @param {number} payrollId
   * @returns {Promise<Object|null>}
   */
  getPayslip: async (payrollId) => {
    const [rows] = await pool.query(
      'SELECT * FROM payslips WHERE payroll_id = ?',
      [payrollId]
    );
    return rows[0] || null;
  },

  /**
   * Get monthly total payroll amount for a given month/year.
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Object>}
   */
  getMonthlyTotal: async (month, year) => {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(*) as total_employees,
        COALESCE(SUM(gross_pay), 0) as total_gross,
        COALESCE(SUM(total_deductions), 0) as total_deductions,
        COALESCE(SUM(net_pay), 0) as total_net,
        COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_count,
        COUNT(CASE WHEN status = 'generated' THEN 1 END) as pending_count
       FROM payrolls
       WHERE month = ? AND year = ?`,
      [month, year]
    );
    return rows[0];
  },

  /**
   * Get payroll trend for the last N months (for charts).
   * @param {number} months - Number of months to look back
   * @returns {Promise<Array>}
   */
  getMonthlyTrend: async (months = 6) => {
    const [rows] = await pool.query(
      `SELECT month, year, 
              COUNT(*) as employee_count,
              COALESCE(SUM(net_pay), 0) as total_payout,
              COALESCE(SUM(gross_pay), 0) as total_gross
       FROM payrolls
       WHERE (year * 12 + month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - ?)
       GROUP BY year, month
       ORDER BY year ASC, month ASC`,
      [months]
    );
    return rows;
  },

  /**
   * Get payroll records for an employee (history).
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getEmployeeHistory: async (employeeId) => {
    const [rows] = await pool.query(
      `SELECT p.*, ps.file_path as payslip_path, ps.file_name as payslip_filename
       FROM payrolls p
       LEFT JOIN payslips ps ON p.id = ps.payroll_id
       WHERE p.employee_id = ?
       ORDER BY p.year DESC, p.month DESC`,
      [employeeId]
    );
    return rows;
  },
};

module.exports = Payroll;
