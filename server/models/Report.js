/**
 * PayRoll Pro – Report Model (Data Access Layer)
 * Handles aggregated queries for reports and analytics.
 */

const { pool } = require('../config/db');

const Report = {
  /**
   * Get payroll summary report for a date range.
   * @param {number} fromMonth
   * @param {number} fromYear
   * @param {number} toMonth
   * @param {number} toYear
   * @returns {Promise<Array>}
   */
  getPayrollSummary: async (fromMonth, fromYear, toMonth, toYear) => {
    const [rows] = await pool.query(
      `SELECT p.month, p.year,
              COUNT(*) as employee_count,
              SUM(p.total_earnings) as total_earnings,
              SUM(p.total_deductions) as total_deductions,
              SUM(p.gross_pay) as total_gross,
              SUM(p.net_pay) as total_net,
              COUNT(CASE WHEN p.status = 'paid' THEN 1 END) as paid_count,
              COUNT(CASE WHEN p.status = 'generated' THEN 1 END) as unpaid_count
       FROM payrolls p
       WHERE (p.year * 12 + p.month) BETWEEN (? * 12 + ?) AND (? * 12 + ?)
       GROUP BY p.year, p.month
       ORDER BY p.year ASC, p.month ASC`,
      [fromYear, fromMonth, toYear, toMonth]
    );
    return rows;
  },

  /**
   * Get attendance summary report for a date range.
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Array>}
   */
  getAttendanceSummary: async (month, year) => {
    const [rows] = await pool.query(
      `SELECT e.emp_code, e.first_name, e.last_name, e.designation,
              d.name as department_name,
              COUNT(CASE WHEN a.status = 'present' THEN 1 END) as present_days,
              COUNT(CASE WHEN a.status = 'absent' THEN 1 END) as absent_days,
              COUNT(CASE WHEN a.status = 'half-day' THEN 1 END) as half_days,
              COUNT(CASE WHEN a.status = 'late' THEN 1 END) as late_days,
              COUNT(CASE WHEN a.status = 'on-leave' THEN 1 END) as leave_days,
              COUNT(a.id) as total_records,
              COALESCE(SUM(a.hours_worked), 0) as total_hours
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN attendance a ON e.id = a.employee_id 
         AND MONTH(a.date) = ? AND YEAR(a.date) = ?
       WHERE u.is_active = 1
       GROUP BY e.id, e.emp_code, e.first_name, e.last_name, e.designation, d.name
       ORDER BY e.first_name ASC`,
      [month, year]
    );
    return rows;
  },

  /**
   * Get department-wise payroll report.
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Array>}
   */
  getDepartmentWisePayroll: async (month, year) => {
    const [rows] = await pool.query(
      `SELECT d.name as department,
              COUNT(p.id) as employee_count,
              COALESCE(SUM(p.total_earnings), 0) as total_earnings,
              COALESCE(SUM(p.total_deductions), 0) as total_deductions,
              COALESCE(SUM(p.net_pay), 0) as total_net_pay,
              COALESCE(AVG(p.net_pay), 0) as avg_net_pay
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       LEFT JOIN payrolls p ON e.id = p.employee_id AND p.month = ? AND p.year = ?
       WHERE d.is_active = 1
       GROUP BY d.id, d.name
       ORDER BY total_net_pay DESC`,
      [month, year]
    );
    return rows;
  },

  /**
   * Get overall payroll trend for the last N months.
   * @param {number} months
   * @returns {Promise<Array>}
   */
  getPayrollTrend: async (months = 12) => {
    const [rows] = await pool.query(
      `SELECT p.month, p.year,
              SUM(p.net_pay) as total_payout,
              SUM(p.gross_pay) as total_gross,
              COUNT(*) as employee_count
       FROM payrolls p
       WHERE (p.year * 12 + p.month) >= (YEAR(CURDATE()) * 12 + MONTH(CURDATE()) - ?)
       GROUP BY p.year, p.month
       ORDER BY p.year ASC, p.month ASC`,
      [months]
    );
    return rows;
  },

  /**
   * Get employee-wise payroll details for a specific month.
   * @param {number} month
   * @param {number} year
   * @returns {Promise<Array>}
   */
  getEmployeeWisePayroll: async (month, year) => {
    const [rows] = await pool.query(
      `SELECT p.*, e.emp_code, e.first_name, e.last_name, e.designation,
              d.name as department_name
       FROM payrolls p
       JOIN employees e ON p.employee_id = e.id
       LEFT JOIN departments d ON e.department_id = d.id
       WHERE p.month = ? AND p.year = ?
       ORDER BY e.first_name ASC`,
      [month, year]
    );
    return rows;
  },

  /**
   * Get leave summary report for a year.
   * @param {number} year
   * @returns {Promise<Array>}
   */
  getLeaveSummary: async (year) => {
    const [rows] = await pool.query(
      `SELECT e.emp_code, e.first_name, e.last_name, d.name as department_name,
              COUNT(CASE WHEN l.leave_type = 'casual' AND l.status = 'approved' THEN 1 END) as casual_taken,
              COUNT(CASE WHEN l.leave_type = 'sick' AND l.status = 'approved' THEN 1 END) as sick_taken,
              COUNT(CASE WHEN l.leave_type = 'earned' AND l.status = 'approved' THEN 1 END) as earned_taken,
              COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.days ELSE 0 END), 0) as total_leaves_taken,
              COUNT(CASE WHEN l.status = 'pending' THEN 1 END) as pending_requests,
              COUNT(CASE WHEN l.status = 'rejected' THEN 1 END) as rejected_requests
       FROM employees e
       JOIN users u ON e.user_id = u.id
       LEFT JOIN departments d ON e.department_id = d.id
       LEFT JOIN leaves l ON e.id = l.employee_id AND YEAR(l.start_date) = ?
       WHERE u.is_active = 1
       GROUP BY e.id, e.emp_code, e.first_name, e.last_name, d.name
       ORDER BY total_leaves_taken DESC`,
      [year]
    );
    return rows;
  },

  /**
   * Get dashboard overview stats.
   * @returns {Promise<Object>}
   */
  getDashboardStats: async () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Total active employees
    const [empCount] = await pool.query(
      'SELECT COUNT(*) as total FROM employees e JOIN users u ON e.user_id = u.id WHERE u.is_active = 1'
    );

    // Total departments
    const [deptCount] = await pool.query(
      'SELECT COUNT(*) as total FROM departments WHERE is_active = 1'
    );

    // Current month payroll total
    const [payrollTotal] = await pool.query(
      `SELECT COALESCE(SUM(net_pay), 0) as total, COUNT(*) as count
       FROM payrolls WHERE month = ? AND year = ?`,
      [currentMonth, currentYear]
    );

    // Pending leave requests
    const [pendingLeaves] = await pool.query(
      "SELECT COUNT(*) as total FROM leaves WHERE status = 'pending'"
    );

    // Today's attendance
    const today = new Date().toISOString().split('T')[0];
    const [todayAttendance] = await pool.query(
      `SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) as present,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) as absent,
        COUNT(*) as total
       FROM attendance WHERE date = ?`,
      [today]
    );

    // New employees this month
    const [newEmps] = await pool.query(
      `SELECT COUNT(*) as total FROM employees 
       WHERE MONTH(date_of_joining) = ? AND YEAR(date_of_joining) = ?`,
      [currentMonth, currentYear]
    );

    return {
      totalEmployees: empCount[0].total,
      totalDepartments: deptCount[0].total,
      monthlyPayroll: payrollTotal[0].total,
      payrollProcessed: payrollTotal[0].count,
      pendingLeaves: pendingLeaves[0].total,
      todayPresent: todayAttendance[0].present,
      todayAbsent: todayAttendance[0].absent,
      todayTotal: todayAttendance[0].total,
      newEmployeesThisMonth: newEmps[0].total,
    };
  },
};

module.exports = Report;
