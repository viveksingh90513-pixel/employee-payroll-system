/**
 * PayRoll Pro – User Model (Data Access Layer)
 * Handles all database operations for the users table.
 * Used for authentication, password management, and user status.
 */

const { pool } = require('../config/db');

const User = {
  /**
   * Find a user by email address.
   * @param {string} email
   * @returns {Promise<Object|null>}
   */
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role, is_active, is_first_login, last_login, created_at FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  /**
   * Find a user by ID.
   * @param {number} id
   * @returns {Promise<Object|null>}
   */
  findById: async (id) => {
    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role, is_active, is_first_login, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  /**
   * Create a new user account.
   * @param {Object} userData - { email, passwordHash, role, isFirstLogin }
   * @returns {Promise<Object>} The created user with insertId
   */
  create: async ({ email, passwordHash, role = 'employee', isFirstLogin = 0 }) => {
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, role, is_first_login) VALUES (?, ?, ?, ?)',
      [email, passwordHash, role, isFirstLogin ? 1 : 0]
    );
    return { id: result.insertId, email, role, isFirstLogin: isFirstLogin ? 1 : 0 };
  },

  /**
   * Update a user's password hash and clear reset/first login status.
   * @param {number} id
   * @param {string} passwordHash
   * @returns {Promise<boolean>}
   */
  updatePassword: async (id, passwordHash) => {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ?, is_first_login = 0, reset_token = NULL, reset_token_expiry = NULL, otp = NULL, otp_expiry = NULL WHERE id = ?',
      [passwordHash, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update is_first_login status for a user.
   * @param {number} id
   * @param {boolean} isFirstLogin
   * @returns {Promise<boolean>}
   */
  updateFirstLoginStatus: async (id, isFirstLogin) => {
    const [result] = await pool.query(
      'UPDATE users SET is_first_login = ? WHERE id = ?',
      [isFirstLogin ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Store a 6-digit OTP for password recovery with expiry.
   * @param {number} id
   * @param {string} otp
   * @param {Date} expiry
   * @returns {Promise<boolean>}
   */
  setOTP: async (id, otp, expiry) => {
    const [result] = await pool.query(
      'UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?',
      [otp, expiry, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Reset user password using OTP verification.
   * @param {string} email
   * @param {string} otp
   * @param {string} newPasswordHash
   * @returns {Promise<boolean>}
   */
  resetPasswordWithOTP: async (email, otp, newPasswordHash) => {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ?, is_first_login = 0, otp = NULL, otp_expiry = NULL WHERE email = ? AND otp = ? AND otp_expiry > NOW()',
      [newPasswordHash, email, otp]
    );
    return result.affectedRows > 0;
  },

  /**
   * Admin resets employee password, setting a new temporary password and resetting is_first_login = 1.
   * @param {number} id
   * @param {string} newPasswordHash
   * @returns {Promise<boolean>}
   */
  resetEmployeePassword: async (id, newPasswordHash) => {
    const [result] = await pool.query(
      'UPDATE users SET password_hash = ?, is_first_login = 0, reset_token = NULL, reset_token_expiry = NULL, otp = NULL, otp_expiry = NULL WHERE id = ?',
      [newPasswordHash, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update the user's active status (enable/disable account).
   * @param {number} id
   * @param {boolean} isActive
   * @returns {Promise<boolean>}
   */
  updateStatus: async (id, isActive) => {
    const [result] = await pool.query(
      'UPDATE users SET is_active = ? WHERE id = ?',
      [isActive ? 1 : 0, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Update last login timestamp.
   * @param {number} id
   * @returns {Promise<void>}
   */
  updateLastLogin: async (id) => {
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  },

  /**
   * Store a password reset token with expiry.
   * @param {number} id
   * @param {string} token
   * @param {Date} expiry
   * @returns {Promise<boolean>}
   */
  setResetToken: async (id, token, expiry) => {
    const [result] = await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [token, expiry, id]
    );
    return result.affectedRows > 0;
  },

  /**
   * Find a user by a valid (non-expired) reset token.
   * @param {string} token
   * @returns {Promise<Object|null>}
   */
  findByResetToken: async (token) => {
    const [rows] = await pool.query(
      'SELECT id, email, role FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()',
      [token]
    );
    return rows[0] || null;
  },

  /**
   * Delete a user account.
   * @param {number} id
   * @returns {Promise<boolean>}
   */
  delete: async (id) => {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  /**
   * Count all active users by role.
   * @returns {Promise<Array>} Array of { role, count }
   */
  countByRole: async () => {
    const [rows] = await pool.query(
      'SELECT role, COUNT(*) as count FROM users WHERE is_active = 1 GROUP BY role'
    );
    return rows;
  },
};

module.exports = User;
