/**
 * PayRoll Pro – Payroll Controller
 * Handles payroll generation, management, and payslip PDF generation.
 */

const Payroll = require('../models/Payroll');
const Salary = require('../models/Salary');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Employee = require('../models/Employee');
const { successResponse, errorResponse, getWorkingDays, getMonthName } = require('../utils/helpers');
const { generatePayslip } = require('../utils/generatePayslip');
const { sendPayslipEmail } = require('../utils/sendEmail');
const path = require('path');
const fs = require('fs');

const payrollController = {
  /**
   * GET /api/payroll
   * List payroll records with filters.
   */
  getAll: async (req, res, next) => {
    try {
      const { employeeId, month, year, status, page = 1, limit = 10 } = req.query;

      // Employees can only see their own payroll
      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      const result = await Payroll.findAll({
        employeeId: empId,
        month: month ? parseInt(month, 10) : null,
        year: year ? parseInt(year, 10) : null,
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return successResponse(res, result, 'Payroll records retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/payroll/:id
   * Get a single payroll record by ID.
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payroll = await Payroll.findById(parseInt(id, 10));

      if (!payroll) {
        return errorResponse(res, 'Payroll record not found.', 404);
      }

      // Employees can only view their own payroll
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee || payroll.employee_id !== employee.id) {
          return errorResponse(res, 'Access denied.', 403);
        }
      }

      return successResponse(res, payroll, 'Payroll details retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/payroll/generate
   * Generate payroll for a specific month/year.
   * Calculates salary based on attendance and salary structure.
   */
  generate: async (req, res, next) => {
    try {
      const { month, year, employeeIds } = req.body;

      // Get all employees with current salary structures
      const salaryStructures = await Salary.getAllCurrentStructures(employeeIds);

      if (salaryStructures.length === 0) {
        return errorResponse(res, 'No employees with salary structures found.', 404);
      }

      const workingDays = getWorkingDays(month, year);
      const generatedPayrolls = [];
      const errors = [];

      for (const salary of salaryStructures) {
        try {
          // Get attendance summary for this employee
          const attendanceSummary = await Attendance.getSummary(salary.employee_id, month, year);
          const approvedLeaves = await Leave.getApprovedLeaveDays(salary.employee_id, month, year);

          // Calculate attendance-based values
          const presentDays = (attendanceSummary.present || 0) + (attendanceSummary.late || 0);
          const halfDays = attendanceSummary.half_day || 0;
          const effectivePresentDays = presentDays + (halfDays * 0.5);
          const leaveDays = attendanceSummary.on_leave || 0;
          const absentDays = Math.max(0, workingDays - effectivePresentDays - leaveDays - approvedLeaves);

          // Calculate proportional pay based on attendance
          const payRatio = workingDays > 0 ? (effectivePresentDays + leaveDays + approvedLeaves) / workingDays : 1;
          const cappedRatio = Math.min(1, payRatio);

          // Calculate earnings (proportional to attendance)
          const basicPay = parseFloat(salary.basic_salary) * cappedRatio;
          const hra = parseFloat(salary.hra) * cappedRatio;
          const da = parseFloat(salary.da) * cappedRatio;
          const ta = parseFloat(salary.ta) * cappedRatio;
          const medicalAllowance = parseFloat(salary.medical_allowance) * cappedRatio;
          const specialAllowance = parseFloat(salary.special_allowance) * cappedRatio;
          const totalEarnings = basicPay + hra + da + ta + medicalAllowance + specialAllowance;

          // Deductions (full deductions applied regardless of attendance)
          const pfDeduction = parseFloat(salary.pf_deduction);
          const esiDeduction = parseFloat(salary.esi_deduction);
          const taxDeduction = parseFloat(salary.tax_deduction);
          const professionalTax = parseFloat(salary.professional_tax);
          const otherDeductions = parseFloat(salary.other_deductions);

          // Loss of pay for absent days
          const perDaySalary = parseFloat(salary.gross_salary) / workingDays;
          const lossOfPay = parseFloat((absentDays * perDaySalary).toFixed(2));

          const totalDeductions = pfDeduction + esiDeduction + taxDeduction + professionalTax + otherDeductions + lossOfPay;
          const grossPay = totalEarnings;
          const netPay = Math.max(0, parseFloat((grossPay - totalDeductions).toFixed(2)));

          // Generate payroll record
          const payroll = await Payroll.generate({
            employeeId: salary.employee_id,
            month,
            year,
            workingDays,
            presentDays: Math.round(effectivePresentDays),
            leaveDays: leaveDays + Math.round(approvedLeaves),
            absentDays: Math.round(absentDays),
            basicPay: parseFloat(basicPay.toFixed(2)),
            hra: parseFloat(hra.toFixed(2)),
            da: parseFloat(da.toFixed(2)),
            ta: parseFloat(ta.toFixed(2)),
            medicalAllowance: parseFloat(medicalAllowance.toFixed(2)),
            specialAllowance: parseFloat(specialAllowance.toFixed(2)),
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            pfDeduction,
            esiDeduction,
            taxDeduction,
            professionalTax,
            otherDeductions,
            lossOfPay,
            totalDeductions: parseFloat(totalDeductions.toFixed(2)),
            grossPay: parseFloat(grossPay.toFixed(2)),
            netPay,
            generatedBy: req.user.id,
          });

          generatedPayrolls.push({
            employeeId: salary.employee_id,
            empCode: salary.emp_code,
            name: `${salary.first_name} ${salary.last_name}`,
            netPay,
            status: 'generated',
          });
        } catch (empError) {
          errors.push({
            employeeId: salary.employee_id,
            empCode: salary.emp_code,
            name: `${salary.first_name} ${salary.last_name}`,
            error: empError.message,
          });
        }
      }

      return successResponse(res, {
        month,
        year,
        monthName: getMonthName(month),
        generated: generatedPayrolls.length,
        failed: errors.length,
        payrolls: generatedPayrolls,
        errors: errors.length > 0 ? errors : undefined,
      }, `Payroll generated for ${generatedPayrolls.length} employees.`, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/payroll/:id/status
   * Update status of payroll record (e.g., 'paid', 'generated').
   */
  updateStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const payroll = await Payroll.findById(parseInt(id, 10));
      if (!payroll) {
        return errorResponse(res, 'Payroll record not found.', 404);
      }

      const today = new Date().toISOString().split('T')[0];
      await Payroll.updateStatus(parseInt(id, 10), status || 'paid', {
        paidOn: status === 'paid' ? today : null,
      });

      return successResponse(res, null, `Payroll marked as ${status || 'paid'} successfully.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/payroll/:id/pay
   * Mark a payroll record as paid.
   */
  markAsPaid: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { paymentMode, transactionRef } = req.body;

      const payroll = await Payroll.findById(parseInt(id, 10));
      if (!payroll) {
        return errorResponse(res, 'Payroll record not found.', 404);
      }

      if (payroll.status === 'paid') {
        return errorResponse(res, 'This payroll has already been marked as paid.', 400);
      }

      const today = new Date().toISOString().split('T')[0];
      await Payroll.updateStatus(parseInt(id, 10), 'paid', {
        paidOn: today,
        paymentMode: paymentMode || 'bank_transfer',
        transactionRef: transactionRef || null,
      });

      return successResponse(res, null, 'Payroll marked as paid successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/payroll/:id/payslip
   * Generate and download payslip PDF.
   */
  downloadPayslip: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payroll = await Payroll.findById(parseInt(id, 10));

      if (!payroll) {
        return errorResponse(res, 'Payroll record not found.', 404);
      }

      // Employees can only download their own payslips
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee || payroll.employee_id !== employee.id) {
          return errorResponse(res, 'Access denied.', 403);
        }
      }

      // Check if payslip PDF already exists
      let payslipInfo = await Payroll.getPayslip(parseInt(id, 10));

      if (!payslipInfo || !fs.existsSync(payslipInfo.file_path)) {
        // Generate the PDF
        const { filePath, fileName } = await generatePayslip(payroll);
        payslipInfo = await Payroll.savePayslip(parseInt(id, 10), filePath, fileName);
        payslipInfo.file_path = filePath;
        payslipInfo.file_name = fileName;
      }

      // Send PDF as download
      const filePath = payslipInfo.file_path;
      if (!fs.existsSync(filePath)) {
        return errorResponse(res, 'Payslip file not found.', 404);
      }

      res.download(filePath, payslipInfo.file_name);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/payroll/:id/send-payslip
   * Send payslip via email to the employee.
   */
  sendPayslipEmail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const payroll = await Payroll.findById(parseInt(id, 10));

      if (!payroll) {
        return errorResponse(res, 'Payroll record not found.', 404);
      }

      // Generate payslip if not exists
      let payslipInfo = await Payroll.getPayslip(parseInt(id, 10));
      if (!payslipInfo || !fs.existsSync(payslipInfo.file_path)) {
        const { filePath, fileName } = await generatePayslip(payroll);
        payslipInfo = await Payroll.savePayslip(parseInt(id, 10), filePath, fileName);
        payslipInfo.file_path = filePath;
      }

      // Send email
      await sendPayslipEmail(
        payroll.email,
        `${payroll.first_name} ${payroll.last_name}`,
        payroll.month,
        payroll.year,
        payroll.net_pay,
        payslipInfo.file_path
      );

      return successResponse(res, null, 'Payslip sent to employee email successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/payroll/monthly-total
   * Get total payroll summary for a month.
   */
  getMonthlyTotal: async (req, res, next) => {
    try {
      const { month, year } = req.query;
      const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
      const y = year ? parseInt(year, 10) : new Date().getFullYear();

      const total = await Payroll.getMonthlyTotal(m, y);
      return successResponse(res, { month: m, year: y, ...total }, 'Monthly payroll total retrieved.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = payrollController;
