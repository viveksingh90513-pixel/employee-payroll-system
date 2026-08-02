/**
 * PayRoll Pro – Employee Controller
 * Handles CRUD operations for employee management.
 */

const bcrypt = require('bcryptjs');
const Employee = require('../models/Employee');
const User = require('../models/User');
const Salary = require('../models/Salary');
const { successResponse, errorResponse, generateTempPassword } = require('../utils/helpers');
const { sendWelcomeEmail } = require('../utils/sendEmail');
const { deleteUploadedFile } = require('../middleware/upload');

const employeeController = {
  /**
   * GET /api/employees
   * List all employees with pagination, search, and filters.
   */
  getAll: async (req, res, next) => {
    try {
      const { page = 1, limit = 10, search, departmentId, status } = req.query;
      const result = await Employee.findAll({
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        search,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        status: status !== undefined ? parseInt(status, 10) : null,
      });

      return successResponse(res, result, 'Employees retrieved successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/employees/all
   * Get minimal employee list for dropdowns.
   */
  getAllMinimal: async (req, res, next) => {
    try {
      const employees = await Employee.findAllMinimal();
      return successResponse(res, employees, 'Employee list retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/employees/:id
   * Get a single employee by ID with full details.
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(parseInt(id, 10));

      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      // Get current salary structure
      const salary = await Salary.getCurrentStructure(employee.id);

      return successResponse(res, { ...employee, salary }, 'Employee details retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/employees
   * Create a new employee (creates user account + employee record).
   */
  create: async (req, res, next) => {
    try {
      const {
        email, firstName, lastName, phone, dob, gender,
        address, city, state, zipCode, departmentId, designation,
        dateOfJoining, employmentType, password, empCode: customEmpCode,
        emergencyContactName, emergencyContactPhone,
        bankName, bankAccountNo, ifscCode, panNumber,
        // Salary structure
        basicSalary, hra, da, ta, medicalAllowance, specialAllowance,
        pfDeduction, esiDeduction, taxDeduction, professionalTax, otherDeductions,
      } = req.body;

      // Check if email already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return errorResponse(res, 'An account with this email already exists.', 409);
      }

      // Check if custom empCode already exists if provided
      if (customEmpCode) {
        const existingEmp = await Employee.findByEmpCode(customEmpCode);
        if (existingEmp) {
          return errorResponse(res, 'Employee ID (Code) already exists. Please use a unique Employee ID.', 409);
        }
      }

      // Use provided password or default to Admin@123
      const tempPassword = password && password.trim().length > 0 ? password.trim() : 'Admin@123';
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      // Create user account with is_first_login = 1
      const user = await User.create({ email, passwordHash, role: 'employee', isFirstLogin: 1 });

      // Generate employee code if not manually provided
      const empCode = customEmpCode || await Employee.generateEmpCode();

      // Handle profile photo from multer
      const profilePhoto = req.file ? req.file.filename : null;

      // Create employee record
      const employee = await Employee.create({
        userId: user.id,
        empCode,
        firstName,
        lastName,
        phone: phone || null,
        dob: dob || null,
        gender: gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        zipCode: zipCode || null,
        departmentId: departmentId ? parseInt(departmentId, 10) : null,
        designation: designation || null,
        dateOfJoining: dateOfJoining || new Date().toISOString().split('T')[0],
        employmentType: employmentType || 'full-time',
        profilePhoto,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        bankName: bankName || null,
        bankAccountNo: bankAccountNo || null,
        ifscCode: ifscCode || null,
        panNumber: panNumber || null,
      });

      // Create salary structure if basic salary is provided
      if (basicSalary) {
        await Salary.create({
          employeeId: employee.id,
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
          effectiveFrom: dateOfJoining || new Date().toISOString().split('T')[0],
        });
      }

      // Try sending welcome email
      try {
        await sendWelcomeEmail(email, `${firstName} ${lastName}`, tempPassword);
      } catch (e) {
        console.warn('Welcome email not sent:', e.message);
      }

      return successResponse(res, {
        employee: { ...employee, email, empCode },
        tempPassword,
        email,
        empCode,
        firstName,
        lastName,
      }, 'Employee created successfully.', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/employees/:id/reset-password
   * Admin resets an employee's password to a new temporary password and sets is_first_login = 1.
   */
  resetPassword: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { customPassword } = req.body;

      const employee = await Employee.findById(parseInt(id, 10));
      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      const tempPassword = customPassword && customPassword.trim().length > 0
        ? customPassword.trim()
        : generateTempPassword();

      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(tempPassword, salt);

      await User.resetEmployeePassword(employee.user_id, passwordHash);

      // Optionally attempt sending email
      try {
        await sendWelcomeEmail(employee.email, `${employee.first_name} ${employee.last_name}`, tempPassword);
      } catch (e) {
        console.warn('Reset password email failed:', e.message);
      }

      return successResponse(res, {
        tempPassword,
        email: employee.email,
        empCode: employee.emp_code,
        firstName: employee.first_name,
        lastName: employee.last_name,
      }, 'Employee password reset successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/employees/:id/send-credentials
   * Admin triggers email containing employee credentials.
   */
  sendCredentialsEmail: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { tempPassword } = req.body;

      const employee = await Employee.findById(parseInt(id, 10));
      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      if (!tempPassword) {
        return errorResponse(res, 'Temporary password is required to send credentials email.', 400);
      }

      await sendWelcomeEmail(employee.email, `${employee.first_name} ${employee.last_name}`, tempPassword);

      return successResponse(res, null, `Credentials sent successfully to ${employee.email}`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/employees/:id
   * Update an existing employee's details.
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(parseInt(id, 10));

      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      // Handle profile photo update
      let profilePhoto = undefined;
      if (req.file) {
        // Delete old photo if it exists
        if (employee.profile_photo) {
          deleteUploadedFile(employee.profile_photo);
        }
        profilePhoto = req.file.filename;
      }

      const updates = { ...req.body, profilePhoto };
      const updated = await Employee.update(parseInt(id, 10), updates);

      if (!updated) {
        return errorResponse(res, 'No changes were made.', 400);
      }

      // Fetch updated employee
      const updatedEmployee = await Employee.findById(parseInt(id, 10));

      return successResponse(res, updatedEmployee, 'Employee updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/employees/:id
   * Delete an employee and their user account.
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(parseInt(id, 10));

      // Check if target user is an Admin
      const user = await User.findById(employee.user_id);
      if (user && user.role === 'admin') {
        return errorResponse(res, 'Admin accounts cannot be deleted.', 403);
      }

      // Delete profile photo file
      if (employee.profile_photo) {
        deleteUploadedFile(employee.profile_photo);
      }

      const deleted = await Employee.delete(parseInt(id, 10));

      if (!deleted) {
        return errorResponse(res, 'Failed to delete employee.', 500);
      }

      return successResponse(res, null, 'Employee deleted successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/employees/:id/status
   * Toggle employee active status.
   */
  toggleStatus: async (req, res, next) => {
    try {
      const { id } = req.params;
      const employee = await Employee.findById(parseInt(id, 10));

      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      const newStatus = !employee.is_active;
      await User.updateStatus(employee.user_id, newStatus);

      return successResponse(res, { isActive: newStatus },
        `Employee ${newStatus ? 'activated' : 'deactivated'} successfully.`
      );
    } catch (error) {
      next(error);
    }
  },
};

module.exports = employeeController;
