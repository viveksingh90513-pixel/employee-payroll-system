/**
 * PayRoll Pro – Employee Model (Data Access Layer)
 * Handles all database operations for the employees table.
 */

const { pool } = require('../config/db');

const Employee = {
  /**
   * Find all employees with department name (paginated + searchable).
   * @param {Object} options - { page, limit, search, departmentId, status }
   * @returns {Promise<{ employees: Array, total: number }>}
   */
  findAll: async ({ page = 1, limit = 10, search = '', departmentId = null, status = null } = {}) => {
    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    const params = [];

    // Search filter (matches first name, last name, emp_code, email, designation)
    if (search) {
      whereConditions.push(
        '(e.first_name LIKE ? OR e.last_name LIKE ? OR e.emp_code LIKE ? OR u.email LIKE ? OR e.designation LIKE ?)'
      );
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Department filter
    if (departmentId) {
      whereConditions.push('e.department_id = ?');
      params.push(departmentId);
    }

    // Active/inactive filter
    if (status !== null) {
      whereConditions.push('u.is_active = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM employees e 
       JOIN users u ON e.user_id = u.id 
       WHERE ${whereClause}`,
      params
    );

    // Get paginated results
    const [employees] = await pool.query(
      `SELECT e.*, u.email, u.role, u.is_active, d.name as department_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE ${whereClause}
       ORDER BY e.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      employees,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  },

  /**
   * Find a single employee by ID with full details.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT e.*, u.email, u.role, u.is_active, u.last_login, d.name as department_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Find an employee by their emp_code (e.g., EMP005).
   * @param {string} empCode
   * @returns {Promise<Object|null>}
   */
  findByEmpCode: async (empCode) => {
    const [rows] = await pool.query(
      `SELECT e.*, u.email, u.role, u.is_active, d.name as department_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.emp_code = ?`,
      [empCode]
    );
    return rows[0] || null;
  },

  /**
   * Find an employee by their user_id (used for profile).
   * @param {number} userId
   * @returns {Promise<Object|null>}
   */
  findByUserId: async (userId) => {
    const [rows] = await pool.query(
      `SELECT e.*, u.email, u.role, u.is_active, d.name as department_name
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE e.user_id = ?`,
      [userId]
    );
    return rows[0] || null;
  },

  /**
   * Create a new employee record.
   * @param {Object} employeeData
   * @returns {Promise<Object>} The created employee with insertId
   */
  create: async (employeeData) => {
    const {
      userId, empCode, firstName, lastName, phone, dob, gender,
      address, city, state, zipCode, departmentId, designation,
      dateOfJoining, employmentType, profilePhoto,
      emergencyContactName, emergencyContactPhone,
      bankName, bankAccountNo, ifscCode, panNumber,
    } = employeeData;

    const [result] = await pool.query(
      `INSERT INTO employees (
        user_id, emp_code, first_name, last_name, phone, dob, gender,
        address, city, state, zip_code, department_id, designation,
        date_of_joining, employment_type, profile_photo,
        emergency_contact_name, emergency_contact_phone,
        bank_name, bank_account_no, ifsc_code, pan_number
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, empCode, firstName, lastName, phone, dob, gender,
        address, city, state, zipCode, departmentId, designation,
        dateOfJoining, employmentType || 'full-time', profilePhoto,
        emergencyContactName, emergencyContactPhone,
        bankName, bankAccountNo, ifscCode, panNumber,
      ]
    );

    return { id: result.insertId, ...employeeData };
  },

  /**
   * Update an existing employee's details.
   * @param {number} id
   * @param {Object} updates
   * @returns {Promise<boolean>}
   */
  update: async (id, updates) => {
    const allowedFields = {
      first_name: updates.firstName,
      last_name: updates.lastName,
      phone: updates.phone,
      dob: updates.dob,
      gender: updates.gender,
      address: updates.address,
      city: updates.city,
      state: updates.state,
      zip_code: updates.zipCode,
      department_id: updates.departmentId,
      designation: updates.designation,
      date_of_joining: updates.dateOfJoining,
      date_of_leaving: updates.dateOfLeaving,
      employment_type: updates.employmentType,
      profile_photo: updates.profilePhoto,
      emergency_contact_name: updates.emergencyContactName,
      emergency_contact_phone: updates.emergencyContactPhone,
      bank_name: updates.bankName,
      bank_account_no: updates.bankAccountNo,
      ifsc_code: updates.ifscCode,
      pan_number: updates.panNumber,
    };

    // Filter out undefined values
    const fieldsToUpdate = {};
    for (const [key, value] of Object.entries(allowedFields)) {
      if (value !== undefined) {
        fieldsToUpdate[key] = value;
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return false;
    }

    const setClause = Object.keys(fieldsToUpdate).map((key) => `${key} = ?`).join(', ');
    const values = [...Object.values(fieldsToUpdate), id];

    const [result] = await pool.query(
      `UPDATE employees SET ${setClause} WHERE id = ?`,
      values
    );

    return result.affectedRows > 0;
  },

  /**
   * Delete an employee by ID (also deletes associated user via CASCADE).
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    // Get the user_id before deleting the employee
    const [employee] = await pool.query(
      'SELECT user_id FROM employees WHERE id = ?',
      [id]
    );

    if (employee.length === 0) return false;

    // Delete the user (employee will be cascade-deleted)
    const [result] = await pool.query(
      'DELETE FROM users WHERE id = ?',
      [employee[0].user_id]
    );

    return result.affectedRows > 0;
  },

  /**
   * Count total active employees.
   * @returns {Promise<number>}
   */
  count: async () => {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as total FROM employees e JOIN users u ON e.user_id = u.id WHERE u.is_active = 1'
    );
    return rows[0].total;
  },

  /**
   * Generate the next employee code (e.g., EMP014).
   * @returns {Promise<string>}
   */
  generateEmpCode: async () => {
    const [rows] = await pool.query(
      'SELECT emp_code FROM employees ORDER BY id DESC LIMIT 1'
    );

    if (rows.length === 0) {
      return 'EMP001';
    }

    const lastCode = rows[0].emp_code;
    const lastNumber = parseInt(lastCode.replace('EMP', ''), 10);
    const nextNumber = lastNumber + 1;
    return `EMP${String(nextNumber).padStart(3, '0')}`;
  },

  /**
   * Get all employees (minimal data) for dropdowns.
   * @returns {Promise<Array>}
   */
  findAllMinimal: async () => {
    const [rows] = await pool.query(
      `SELECT e.id, e.emp_code, e.first_name, e.last_name, e.designation, d.name as department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       JOIN users u ON e.user_id = u.id
       WHERE u.is_active = 1
       ORDER BY e.first_name ASC`
    );
    return rows;
  },
};

module.exports = Employee;
