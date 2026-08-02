/**
 * PayRoll Pro – Salary Controller
 * Handles salary structure management.
 */

const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const { successResponse, errorResponse } = require('../utils/helpers');

const salaryController = {
  /**
   * GET /api/salary/:employeeId
   * Get current salary structure for an employee.
   */
  getByEmployee: async (req, res, next) => {
    try {
      const { employeeId } = req.params;

      // If employee role, verify they're accessing their own salary
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee || employee.id !== parseInt(employeeId, 10)) {
          return errorResponse(res, 'Access denied.', 403);
        }
      }

      const salary = await Salary.getCurrentStructure(parseInt(employeeId, 10));

      if (!salary) {
        return errorResponse(res, 'Salary structure not found for this employee.', 404);
      }

      return successResponse(res, salary, 'Salary structure retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/salary/:employeeId/history
   * Get salary structure history for an employee.
   */
  getHistory: async (req, res, next) => {
    try {
      const { employeeId } = req.params;
      const history = await Salary.getHistory(parseInt(employeeId, 10));
      return successResponse(res, history, 'Salary history retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/salary
   * Create or update salary structure for an employee.
   */
  create: async (req, res, next) => {
    try {
      const {
        employeeId, basicSalary, hra, da, ta,
        medicalAllowance, specialAllowance,
        pfDeduction, esiDeduction, taxDeduction,
        professionalTax, otherDeductions, effectiveFrom,
      } = req.body;

      // Verify employee exists
      const employee = await Employee.findById(parseInt(employeeId, 10));
      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      const salary = await Salary.create({
        employeeId: parseInt(employeeId, 10),
        basicSalary: parseFloat(basicSalary),
        hra: parseFloat(hra) || 0,
        da: parseFloat(da) || 0,
        ta: parseFloat(ta) || 0,
        medicalAllowance: parseFloat(medicalAllowance) || 0,
        specialAllowance: parseFloat(specialAllowance) || 0,
        pfDeduction: parseFloat(pfDeduction) || 0,
        esiDeduction: parseFloat(esiDeduction) || 0,
        taxDeduction: parseFloat(taxDeduction) || 0,
        professionalTax: parseFloat(professionalTax) || 0,
        otherDeductions: parseFloat(otherDeductions) || 0,
        effectiveFrom,
      });

      return successResponse(res, salary, 'Salary structure created successfully.', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/salary/:id
   * Update an existing salary structure.
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;

      const existingSalary = await Salary.findById(parseInt(id, 10));
      if (!existingSalary) {
        return errorResponse(res, 'Salary structure not found.', 404);
      }

      const {
        basicSalary, hra, da, ta,
        medicalAllowance, specialAllowance,
        pfDeduction, esiDeduction, taxDeduction,
        professionalTax, otherDeductions,
      } = req.body;

      const updated = await Salary.update(parseInt(id, 10), {
        basicSalary: parseFloat(basicSalary),
        hra: parseFloat(hra) || 0,
        da: parseFloat(da) || 0,
        ta: parseFloat(ta) || 0,
        medicalAllowance: parseFloat(medicalAllowance) || 0,
        specialAllowance: parseFloat(specialAllowance) || 0,
        pfDeduction: parseFloat(pfDeduction) || 0,
        esiDeduction: parseFloat(esiDeduction) || 0,
        taxDeduction: parseFloat(taxDeduction) || 0,
        professionalTax: parseFloat(professionalTax) || 0,
        otherDeductions: parseFloat(otherDeductions) || 0,
      });

      if (!updated) {
        return errorResponse(res, 'Failed to update salary structure.', 500);
      }

      const updatedSalary = await Salary.findById(parseInt(id, 10));
      return successResponse(res, updatedSalary, 'Salary structure updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/salary/all/current
   * Get all employees with their current salary structures.
   */
  getAllCurrent: async (req, res, next) => {
    try {
      const structures = await Salary.getAllCurrentStructures();
      return successResponse(res, structures, 'All salary structures retrieved.');
    } catch (error) {
      next(error);
    }
  },
};

module.exports = salaryController;
