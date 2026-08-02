/**
 * PayRoll Pro – Dashboard Controller
 * Provides analytics data for role-specific dashboards.
 */

const Report = require('../models/Report');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Payroll = require('../models/Payroll');
const Department = require('../models/Department');
const Salary = require('../models/Salary');
const { successResponse, errorResponse } = require('../utils/helpers');

const dashboardController = {
  /**
   * GET /api/dashboard/stats
   * Get overview stats for the dashboard (Admin/HR).
   */
  getStats: async (req, res, next) => {
    try {
      const stats = await Report.getDashboardStats();
      return successResponse(res, stats, 'Dashboard stats retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/charts
   * Get chart data for the dashboard.
   */
  getCharts: async (req, res, next) => {
    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Payroll trend (last 6 months)
      const payrollTrend = await Payroll.getMonthlyTrend(6);

      // Attendance distribution (current month)
      const attendanceDistribution = await Attendance.getDistribution(currentMonth, currentYear);

      // Department-wise employee count
      const departmentDistribution = await Department.findAll();
      const deptData = departmentDistribution.map((d) => ({
        name: d.name,
        employees: d.employee_count || 0,
      }));

      // Recent leave requests
      const recentLeaves = await Leave.getRecent(5);

      // Average salary by department
      const salaryByDept = await Salary.getAverageByDepartment();

      return successResponse(res, {
        payrollTrend: payrollTrend.map((t) => ({
          month: t.month,
          year: t.year,
          label: `${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][t.month - 1]} ${t.year}`,
          totalPayout: parseFloat(t.total_payout),
          employeeCount: t.employee_count,
        })),
        attendanceDistribution: attendanceDistribution.map((a) => ({
          name: a.status.charAt(0).toUpperCase() + a.status.slice(1).replace('-', ' '),
          value: a.count,
        })),
        departmentDistribution: deptData,
        recentLeaves: recentLeaves.map((l) => ({
          id: l.id,
          employee: `${l.first_name} ${l.last_name}`,
          empCode: l.emp_code,
          type: l.leave_type,
          days: l.days,
          status: l.status,
          date: l.start_date,
        })),
        salaryByDepartment: salaryByDept,
      }, 'Chart data retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/employee
   * Get employee-specific dashboard data.
   */
  getEmployeeDashboard: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Employee profile not found.', 404);
      }

      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Attendance summary for current month
      const attendanceSummary = await Attendance.getSummary(employee.id, currentMonth, currentYear);

      // Leave balance
      const leaveBalance = await Leave.getBalance(employee.id, currentYear);

      // Current salary
      const salary = await Salary.getCurrentStructure(employee.id);

      // Recent payroll history
      const payrollHistory = await Payroll.getEmployeeHistory(employee.id);

      // Recent leaves
      const recentLeaves = await Leave.findAll({
        employeeId: employee.id,
        page: 1,
        limit: 5,
      });

      return successResponse(res, {
        employee: {
          id: employee.id,
          empCode: employee.emp_code,
          name: `${employee.first_name} ${employee.last_name}`,
          designation: employee.designation,
          department: employee.department_name,
          dateOfJoining: employee.date_of_joining,
          profilePhoto: employee.profile_photo,
        },
        attendanceSummary,
        leaveBalance,
        salary: salary ? {
          grossSalary: salary.gross_salary,
          netSalary: salary.net_salary,
          basicSalary: salary.basic_salary,
        } : null,
        recentPayrolls: payrollHistory.slice(0, 6),
        recentLeaves: recentLeaves.leaves,
      }, 'Employee dashboard data retrieved.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
