/**
 * PayRoll Pro – Attendance Model (Data Access Layer)
 * Handles all database operations for the attendance table.
 */

const { pool } = require('../config/db');

const Attendance = {
  /**
   * Find attendance records with filters (paginated).
   * @param {Object} options - { employeeId, date, month, year, status, page, limit }
   * @returns {Promise<{ records: Array, total: number }>}
   */
  findAll: async ({ employeeId, date, month, year, status, page = 1, limit = 20 } = {}) => {
    const offset = (page - 1) * limit;
    let whereConditions = ['1=1'];
    const params = [];

    if (employeeId) {
      whereConditions.push('a.employee_id = ?');
      params.push(employeeId);
    }
    if (date) {
      whereConditions.push('a.date = ?');
      params.push(date);
    }
    if (month && year) {
      whereConditions.push('MONTH(a.date) = ? AND YEAR(a.date) = ?');
      params.push(month, year);
    }
    if (status) {
      whereConditions.push('a.status = ?');
      params.push(status);
    }

    const whereClause = whereConditions.join(' AND ');

    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM attendance a WHERE ${whereClause}`,
      params
    );

    const [records] = await pool.query(
      `SELECT a.*, e.first_name, e.last_name, e.emp_code, d.name as department_name
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE ${whereClause}
       ORDER BY a.date DESC, e.first_name ASC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return {
      records,
      total: countResult[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult[0].total / limit),
    };
  },

  /**
   * Find attendance for a specific employee on a specific date.
   * @param {number} employeeId
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<Object|null>}
   */
  findByEmployeeAndDate: async (employeeId, date) => {
    const [rows] = await pool.query(
      'SELECT * FROM attendance WHERE employee_id = ? AND date = ?',
      [employeeId, date]
    );
    return rows[0] || null;
  },

  /**
   * Mark attendance for a single employee.
   * Uses INSERT ... ON DUPLICATE KEY UPDATE for upsert behavior.
   * @param {Object} data - { employeeId, date, checkIn, checkOut, status, hoursWorked, markedBy }
   * @returns {Promise<Object>}
   */
  markAttendance: async ({ employeeId, date, checkIn, checkOut, status, hoursWorked, markedBy }) => {
    const [result] = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         check_in = VALUES(check_in),
         check_out = VALUES(check_out),
         status = VALUES(status),
         hours_worked = VALUES(hours_worked),
         marked_by = VALUES(marked_by)`,
      [employeeId, date, checkIn || null, checkOut || null, status, hoursWorked || 0, markedBy]
    );

    return { id: result.insertId, employeeId, date, status };
  },

  /**
   * Bulk mark attendance for multiple employees on a date.
   * @param {string} date - YYYY-MM-DD
   * @param {Array} records - [{ employeeId, checkIn, checkOut, status, hoursWorked }]
   * @param {number} markedBy - User ID who marked attendance
   * @returns {Promise<number>} Number of records processed
   */
  bulkMark: async (date, records, markedBy) => {
    let processedCount = 0;

    for (const record of records) {
      await Attendance.markAttendance({
        employeeId: record.employeeId,
        date,
        checkIn: record.checkIn || null,
        checkOut: record.checkOut || null,
        status: record.status,
        hoursWorked: record.hoursWorked || 0,
        markedBy,
      });
      processedCount++;
    }

    return processedCount;
  },

  /**
   * Get monthly attendance report for an employee.
   * @param {number} employeeId
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Array>}
   */
  getMonthlyReport: async (employeeId, month, year) => {
    const [rows] = await pool.query(
      `SELECT * FROM attendance 
       WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?
       ORDER BY date ASC`,
      [employeeId, month, year]
    );
    return rows;
  },

  /**
   * Get attendance summary for an employee in a month.
   * @param {number} employeeId
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Object>} Summary with present, absent, half_day, late, on_leave counts
   */
  getSummary: async (employeeId, month, year) => {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'on-leave' THEN 1 END) as on_leave,
        COUNT(*) as total_records,
        COALESCE(SUM(hours_worked), 0) as total_hours
       FROM attendance
       WHERE employee_id = ? AND MONTH(date) = ? AND YEAR(date) = ?`,
      [employeeId, month, year]
    );
    return rows[0];
  },

  /**
   * Get overall attendance summary for all employees on a date.
   * @param {string} date - YYYY-MM-DD
   * @returns {Promise<Object>}
   */
  getDailySummary: async (date) => {
    const [rows] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(CASE WHEN status = 'half-day' THEN 1 END) as half_day,
        COUNT(CASE WHEN status = 'late' THEN 1 END) as late,
        COUNT(CASE WHEN status = 'on-leave' THEN 1 END) as on_leave,
        COUNT(*) as total
       FROM attendance
       WHERE date = ?`,
      [date]
    );
    return rows[0];
  },

  /**
   * Get attendance status distribution for dashboard charts.
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Array>}
   */
  /**
   * Self check-in with GPS location & late calculation.
   */
  checkIn: async ({ employeeId, date, checkIn, checkInLat, checkInLng, checkInAddress, shiftName, lateMinutes, status, markedBy }) => {
    const [result] = await pool.query(
      `INSERT INTO attendance (employee_id, date, check_in, check_in_lat, check_in_lng, check_in_address, shift_name, late_minutes, status, marked_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         check_in = VALUES(check_in),
         check_in_lat = VALUES(check_in_lat),
         check_in_lng = VALUES(check_in_lng),
         check_in_address = VALUES(check_in_address),
         shift_name = VALUES(shift_name),
         late_minutes = VALUES(late_minutes),
         status = VALUES(status),
         marked_by = VALUES(marked_by)`,
      [employeeId, date, checkIn, checkInLat || null, checkInLng || null, checkInAddress || null, shiftName || 'General Shift', lateMinutes || 0, status || 'present', markedBy || employeeId]
    );
    return { id: result.insertId, employeeId, date, status };
  },

  /**
   * Self check-out with GPS location, early exit & overtime calculation.
   */
  checkOut: async ({ employeeId, date, checkOut, checkOutLat, checkOutLng, checkOutAddress, hoursWorked, earlyExitMinutes, overtimeHours, status }) => {
    const [result] = await pool.query(
      `UPDATE attendance SET 
         check_out = ?,
         check_out_lat = ?,
         check_out_lng = ?,
         check_out_address = ?,
         hours_worked = ?,
         early_exit_minutes = ?,
         overtime_hours = ?
       WHERE employee_id = ? AND date = ?`,
      [checkOut, checkOutLat || null, checkOutLng || null, checkOutAddress || null, hoursWorked || 0, earlyExitMinutes || 0, overtimeHours || 0, employeeId, date]
    );
    return result.affectedRows > 0;
  },

  /**
   * Get month calendar grid data for an employee or all employees.
   */
  getMonthlyCalendar: async (month, year, employeeId = null) => {
    let whereConditions = ['MONTH(a.date) = ? AND YEAR(a.date) = ?'];
    const params = [month, year];

    if (employeeId) {
      whereConditions.push('a.employee_id = ?');
      params.push(employeeId);
    }

    const [rows] = await pool.query(
      `SELECT a.*, e.first_name, e.last_name, e.emp_code
       FROM attendance a
       JOIN employees e ON a.employee_id = e.id
       WHERE ${whereConditions.join(' AND ')}
       ORDER BY a.date ASC`,
      params
    );
    return rows;
  },
};

module.exports = Attendance;
