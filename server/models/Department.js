/**
 * PayRoll Pro – Department Model (Data Access Layer)
 * Handles all database operations for the departments table.
 */

const { pool } = require('../config/db');

const Department = {
  /**
   * Find all departments with employee count and head info.
   * @returns {Promise<Array>}
   */
  findAll: async () => {
    const [rows] = await pool.query(
      `SELECT d.*, 
              CONCAT(e.first_name, ' ', e.last_name) as head_name,
              e.emp_code as head_emp_code,
              (SELECT COUNT(*) FROM employees emp WHERE emp.department_id = d.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.head_id = e.id
       ORDER BY d.name ASC`
    );
    return rows;
  },

  /**
   * Find active departments (for dropdowns).
   * @returns {Promise<Array>}
   */
  findActive: async () => {
    const [rows] = await pool.query(
      'SELECT id, name FROM departments WHERE is_active = 1 ORDER BY name ASC'
    );
    return rows;
  },

  /**
   * Find a department by ID with details.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT d.*, 
              CONCAT(e.first_name, ' ', e.last_name) as head_name,
              (SELECT COUNT(*) FROM employees emp WHERE emp.department_id = d.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.head_id = e.id
       WHERE d.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find a department by name (for uniqueness check).
   * @param {string} name
   * @returns {Promise<Object|null>}
   */
  findByName: async (name) => {
    const [rows] = await pool.query(
      'SELECT id, name FROM departments WHERE name = ?',
      [name]
    );
    return rows[0] || null;
  },

  /**
   * Create a new department.
   * @param {Object} data - { name, description, headId }
   * @returns {Promise<Object>}
   */
  create: async ({ name, description, headId }) => {
    const [result] = await pool.query(
      'INSERT INTO departments (name, description, head_id) VALUES (?, ?, ?)',
      [name, description || null, headId || null]
    );
    return { id: result.insertId, name, description, headId };
  },

  /**
   * Update a department.
   * @param {number} id
   * @param {Object} data - { name, description, headId, isActive }
   * @returns {Promise<boolean>}
   */
  update: async (id, { name, description, headId, isActive }) => {
    const fields = [];
    const values = [];

    if (name !== undefined) {
      fields.push('name = ?');
      values.push(name);
    }
    if (description !== undefined) {
      fields.push('description = ?');
      values.push(description);
    }
    if (headId !== undefined) {
      fields.push('head_id = ?');
      values.push(headId);
    }
    if (isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(isActive ? 1 : 0);
    }

    if (fields.length === 0) return false;

    values.push(id);
    const [result] = await pool.query(
      `UPDATE departments SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete a department (only if no employees are assigned).
   * @param {number} id
   * @returns {Promise<{ success: boolean, message: string }>}
   */
  delete: async (id) => {
    // Check if any employees belong to this department
    const [employees] = await pool.query(
      'SELECT COUNT(*) as count FROM employees WHERE department_id = ?',
      [id]
    );

    if (employees[0].count > 0) {
      return {
        success: false,
        message: `Cannot delete department. ${employees[0].count} employee(s) are assigned to it.`,
      };
    }

    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    return {
      success: result.affectedRows > 0,
      message: result.affectedRows > 0 ? 'Department deleted successfully.' : 'Department not found.',
    };
  },

  /**
   * Count total active departments.
   * @returns {Promise<number>}
   */
  count: async () => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM departments WHERE is_active = 1'
    );
    return rows[0].total;
  },

  /**
   * Get employee count per department (for charts).
   * @returns {Promise<Array>}
   */
  getEmployeeDistribution: async () => {
    const [rows] = await pool.query(
      `SELECT d.name, COUNT(e.id) as employee_count
       FROM departments d
       LEFT JOIN employees e ON d.department_id = e.department_id
       WHERE d.is_active = 1
       GROUP BY d.id, d.name
       ORDER BY employee_count DESC`
    );
    return rows;
  },
};

module.exports = Department;
