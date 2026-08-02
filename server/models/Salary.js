/**
 * PayRoll Pro – Salary Model (Data Access Layer)
 * Handles all database operations for the salary_structures table.
 */

const { pool } = require('../config/db');

const Salary = {
  /**
   * Get the current salary structure for an employee.
   * @param {number} employeeId
   * @returns {Promise<Object|null>}
   */
  getCurrentStructure: async (employeeId) => {
    const [rows] = await pool.query(
      `SELECT ss.*, e.first_name, e.last_name, e.emp_code, e.designation
       FROM salary_structures ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.employee_id = ? AND ss.is_current = 1
       ORDER BY ss.effective_from DESC
       LIMIT 1`,
      [employeeId]
    );
    return rows[0] || null;
  },

  /**
   * Get salary structure history for an employee.
   * @param {number} employeeId
   * @returns {Promise<Array>}
   */
  getHistory: async (employeeId) => {
    const [rows] = await pool.query(
      `SELECT * FROM salary_structures
       WHERE employee_id = ?
       ORDER BY effective_from DESC`,
      [employeeId]
    );
    return rows;
  },

  /**
   * Create a new salary structure for an employee.
   * Deactivates any existing current structure first.
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  create: async (data) => {
    const {
      employeeId, basicSalary, hra, da, ta,
      medicalAllowance, specialAllowance,
      pfDeduction, esiDeduction, taxDeduction,
      professionalTax, otherDeductions, effectiveFrom,
    } = data;

    // Deactivate any existing current salary structure
    await pool.query(
      `UPDATE salary_structures SET is_current = 0, effective_to = ?
       WHERE employee_id = ? AND is_current = 1`,
      [effectiveFrom, employeeId]
    );

    const [result] = await pool.query(
      `INSERT INTO salary_structures (
        employee_id, basic_salary, hra, da, ta,
        medical_allowance, special_allowance,
        pf_deduction, esi_deduction, tax_deduction,
        professional_tax, other_deductions, effective_from, is_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        employeeId, basicSalary, hra || 0, da || 0, ta || 0,
        medicalAllowance || 0, specialAllowance || 0,
        pfDeduction || 0, esiDeduction || 0, taxDeduction || 0,
        professionalTax || 0, otherDeductions || 0, effectiveFrom,
      ]
    );

    return { id: result.insertId, ...data };
  },

  /**
   * Update an existing salary structure.
   * @param {number} id
   * @param {Object} data
   * @returns {Promise<boolean>}
   */
  update: async (id, data) => {
    const {
      basicSalary, hra, da, ta,
      medicalAllowance, specialAllowance,
      pfDeduction, esiDeduction, taxDeduction,
      professionalTax, otherDeductions,
    } = data;

    const [result] = await pool.query(
      `UPDATE salary_structures SET
        basic_salary = ?, hra = ?, da = ?, ta = ?,
        medical_allowance = ?, special_allowance = ?,
        pf_deduction = ?, esi_deduction = ?, tax_deduction = ?,
        professional_tax = ?, other_deductions = ?
       WHERE id = ?`,
      [
        basicSalary, hra || 0, da || 0, ta || 0,
        medicalAllowance || 0, specialAllowance || 0,
        pfDeduction || 0, esiDeduction || 0, taxDeduction || 0,
        professionalTax || 0, otherDeductions || 0, id,
      ]
    );

    return result.affectedRows > 0;
  },

  /**
   * Find a salary structure by ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT ss.*, e.first_name, e.last_name, e.emp_code
       FROM salary_structures ss
       JOIN employees e ON ss.employee_id = e.id
       WHERE ss.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Get all employees with their current salary (for payroll generation).
   * @param {Array<number>} employeeIds - Optional filter by specific employee IDs
   * @returns {Promise<Array>}
   */
  getAllCurrentStructures: async (employeeIds = null) => {
    let query = `
      SELECT ss.*, e.id as emp_id, e.first_name, e.last_name, e.emp_code, 
             e.designation, d.name as department_name
      FROM salary_structures ss
      JOIN employees e ON ss.employee_id = e.id
      JOIN users u ON e.user_id = u.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE ss.is_current = 1 AND u.is_active = 1
    `;
    const params = [];

    if (employeeIds && employeeIds.length > 0) {
      query += ` AND ss.employee_id IN (${employeeIds.map(() => '?').join(',')})`;
      params.push(...employeeIds);
    }

    query += ' ORDER BY e.first_name ASC';

    const [rows] = await pool.query(query, params);
    return rows;
  },

  /**
   * Get average salary by department (for reports).
   * @returns {Promise<Array>}
   */
  getAverageByDepartment: async () => {
    const [rows] = await pool.query(
      `SELECT d.name as department, 
              ROUND(AVG(ss.net_salary), 2) as avg_salary,
              COUNT(ss.id) as employee_count
       FROM salary_structures ss
       JOIN employees e ON ss.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE ss.is_current = 1
       GROUP BY d.id, d.name
       ORDER BY avg_salary DESC`
    );
    return rows;
  },
};

module.exports = Salary;
