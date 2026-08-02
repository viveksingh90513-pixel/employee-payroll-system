/**
 * PayRoll Pro – Report Controller
 * Handles report generation for payroll, attendance, and departments.
 */

const Report = require('../models/Report');
const { successResponse, errorResponse, getMonthName } = require('../utils/helpers');

const reportController = {
  /**
   * GET /api/reports/payroll
   * Get payroll summary report for a date range.
   */
  getPayrollReport: async (req, res, next) => {
    try {
      const {
        fromMonth = 1, fromYear = new Date().getFullYear(),
        toMonth = 12, toYear = new Date().getFullYear(),
      } = req.query;

      const data = await Report.getPayrollSummary(
        parseInt(fromMonth, 10), parseInt(fromYear, 10),
        parseInt(toMonth, 10), parseInt(toYear, 10)
      );

      // Add month names for display
      const enrichedData = data.map((row) => ({
        ...row,
        monthName: getMonthName(row.month),
        period: `${getMonthName(row.month)} ${row.year}`,
      }));

      return successResponse(res, enrichedData, 'Payroll report generated.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/attendance
   * Get attendance summary report for a month.
   */
  getAttendanceReport: async (req, res, next) => {
    try {
      const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
      const data = await Report.getAttendanceSummary(parseInt(month, 10), parseInt(year, 10));

      return successResponse(res, {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        monthName: getMonthName(parseInt(month, 10)),
        records: data,
      }, 'Attendance report generated.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/department
   * Get department-wise payroll report.
   */
  getDepartmentReport: async (req, res, next) => {
    try {
      const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } = req.query;
      const data = await Report.getDepartmentWisePayroll(parseInt(month, 10), parseInt(year, 10));

      return successResponse(res, {
        month: parseInt(month, 10),
        year: parseInt(year, 10),
        monthName: getMonthName(parseInt(month, 10)),
        departments: data,
      }, 'Department report generated.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/leave
   * Get leave summary report for a year.
   */
  getLeaveReport: async (req, res, next) => {
    try {
      const { year = new Date().getFullYear() } = req.query;
      const data = await Report.getLeaveSummary(parseInt(year, 10));

      return successResponse(res, {
        year: parseInt(year, 10),
        records: data,
      }, 'Leave report generated.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/reports/payroll-trend
   * Get payroll trend for the last N months.
   */
  getPayrollTrend: async (req, res, next) => {
    try {
      const { months = 6 } = req.query;
      const data = await Report.getPayrollTrend(parseInt(months, 10));

      const enrichedData = data.map((row) => ({
        ...row,
        monthName: getMonthName(row.month),
        period: `${getMonthName(row.month).substring(0, 3)} ${row.year}`,
      }));

      return successResponse(res, enrichedData, 'Payroll trend data retrieved.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = reportController;
