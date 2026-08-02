/**
 * PayRoll Pro – Department Controller
 * Handles CRUD operations for department management.
 */

const Department = require('../models/Department');
const { successResponse, errorResponse } = require('../utils/helpers');

const departmentController = {
  /**
   * GET /api/departments
   * List all departments with employee count.
   */
  getAll: async (req, res, next) => {
    try {
      const departments = await Department.findAll();
      return successResponse(res, departments, 'Departments retrieved successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/departments/active
   * Get active departments for dropdowns.
   */
  getActive: async (req, res, next) => {
    try {
      const departments = await Department.findActive();
      return successResponse(res, departments, 'Active departments retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/departments/:id
   * Get a single department by ID.
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const department = await Department.findById(parseInt(id, 10));

      if (!department) {
        return errorResponse(res, 'Department not found.', 404);
      }

      return successResponse(res, department, 'Department details retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/departments
   * Create a new department.
   */
  create: async (req, res, next) => {
    try {
      const { name, description, headId } = req.body;

      // Check if department name already exists
      const existing = await Department.findByName(name);
      if (existing) {
        return errorResponse(res, 'A department with this name already exists.', 409);
      }

      const department = await Department.create({
        name,
        description: description || null,
        headId: headId ? parseInt(headId, 10) : null,
      });

      return successResponse(res, department, 'Department created successfully.', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/departments/:id
   * Update a department.
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, headId, isActive } = req.body;

      const department = await Department.findById(parseInt(id, 10));
      if (!department) {
        return errorResponse(res, 'Department not found.', 404);
      }

      // If name is being changed, check for duplicates
      if (name && name !== department.name) {
        const existing = await Department.findByName(name);
        if (existing) {
          return errorResponse(res, 'A department with this name already exists.', 409);
        }
      }

      const updated = await Department.update(parseInt(id, 10), {
        name,
        description,
        headId: headId !== undefined ? (headId ? parseInt(headId, 10) : null) : undefined,
        isActive,
      });

      if (!updated) {
        return errorResponse(res, 'No changes were made.', 400);
      }

      const updatedDept = await Department.findById(parseInt(id, 10));
      return successResponse(res, updatedDept, 'Department updated successfully.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/departments/:id
   * Delete a department (only if no employees assigned).
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await Department.delete(parseInt(id, 10));

      if (!result.success) {
        return errorResponse(res, result.message, 400);
      }

      return successResponse(res, null, result.message);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = departmentController;
