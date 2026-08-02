/**
 * PayRoll Pro – Attendance Controller
 * Handles attendance marking and reporting.
 */

const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');
const { successResponse, errorResponse, calculateHoursWorked } = require('../utils/helpers');

const attendanceController = {
  /**
   * GET /api/attendance
   * Get attendance records with filters.
   */
  getAll: async (req, res, next) => {
    try {
      const { employeeId, date, month, year, status, page = 1, limit = 20 } = req.query;

      // If employee role, restrict to own records
      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      const result = await Attendance.findAll({
        employeeId: empId,
        date,
        month: month ? parseInt(month, 10) : null,
        year: year ? parseInt(year, 10) : null,
        status,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
      });

      return successResponse(res, result, 'Attendance records retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance
   * Mark attendance for a single employee.
   */
  mark: async (req, res, next) => {
    try {
      const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

      // Verify the employee exists
      const employee = await Employee.findById(parseInt(employeeId, 10));
      if (!employee) {
        return errorResponse(res, 'Employee not found.', 404);
      }

      // Calculate hours worked if both check-in and check-out are provided
      const hoursWorked = calculateHoursWorked(checkIn, checkOut);

      const record = await Attendance.markAttendance({
        employeeId: parseInt(employeeId, 10),
        date,
        checkIn: checkIn || null,
        checkOut: checkOut || null,
        status,
        hoursWorked,
        markedBy: req.user.id,
      });

      return successResponse(res, record, 'Attendance marked successfully.', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance/bulk
   * Mark attendance for multiple employees on a date.
   */
  bulkMark: async (req, res, next) => {
    try {
      const { date, records } = req.body;

      // Calculate hours worked for each record
      const enrichedRecords = records.map((record) => ({
        ...record,
        hoursWorked: calculateHoursWorked(record.checkIn, record.checkOut),
      }));

      const processedCount = await Attendance.bulkMark(date, enrichedRecords, req.user.id);

      return successResponse(res, { processedCount, date }, `Attendance marked for ${processedCount} employees.`, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/report
   * Get monthly attendance report for an employee.
   */
  getMonthlyReport: async (req, res, next) => {
    try {
      const { employeeId, month, year } = req.query;

      if (!month || !year) {
        return errorResponse(res, 'Month and year are required.', 400);
      }

      // If employee role, restrict to own records
      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      if (!empId) {
        return errorResponse(res, 'Employee ID is required.', 400);
      }

      const records = await Attendance.getMonthlyReport(empId, parseInt(month, 10), parseInt(year, 10));
      const summary = await Attendance.getSummary(empId, parseInt(month, 10), parseInt(year, 10));

      return successResponse(res, { records, summary }, 'Monthly attendance report retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/summary
   * Get attendance summary for an employee.
   */
  getSummary: async (req, res, next) => {
    try {
      const { employeeId, month, year } = req.query;

      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      const currentMonth = month ? parseInt(month, 10) : new Date().getMonth() + 1;
      const currentYear = year ? parseInt(year, 10) : new Date().getFullYear();

      const summary = await Attendance.getSummary(empId, currentMonth, currentYear);

      return successResponse(res, summary, 'Attendance summary retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/daily-summary
   * Get today's attendance summary across all employees.
   */
  getDailySummary: async (req, res, next) => {
    try {
      const { date } = req.query;
      const targetDate = date || new Date().toISOString().split('T')[0];
      const summary = await Attendance.getDailySummary(targetDate);

      return successResponse(res, { date: targetDate, ...summary }, 'Daily attendance summary retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance/check-in
   * Self check-in with GPS coordinates & shift rule validation.
   */
  checkIn: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Employee profile not found.', 404);
      }

      const { lat, lng, address, shiftName = 'General Shift' } = req.body;
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const checkInTime = `${hours}:${minutes}:${seconds}`;

      // Shift rule: Standard start 09:30 AM
      const checkInMin = now.getHours() * 60 + now.getMinutes();
      const shiftStartMin = 9 * 60 + 30; // 9:30 AM
      const lateMinutes = Math.max(0, checkInMin - shiftStartMin);
      const status = lateMinutes > 0 ? 'late' : 'present';

      const record = await Attendance.checkIn({
        employeeId: employee.id,
        date,
        checkIn: checkInTime,
        checkInLat: lat,
        checkInLng: lng,
        checkInAddress: address,
        shiftName,
        lateMinutes,
        status,
        markedBy: req.user.id,
      });

      return successResponse(res, {
        ...record,
        checkInTime,
        lateMinutes,
        status,
      }, `Check-in recorded at ${checkInTime}. ${lateMinutes > 0 ? `Late by ${lateMinutes} mins.` : 'On time!'}`, 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance/check-out
   * Self check-out with GPS coordinates, early exit & overtime computation.
   */
  checkOut: async (req, res, next) => {
    try {
      const employee = await Employee.findByUserId(req.user.id);
      if (!employee) {
        return errorResponse(res, 'Employee profile not found.', 404);
      }

      const { lat, lng, address } = req.body;
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const checkOutTime = `${hours}:${minutes}:${seconds}`;

      const existingRecord = await Attendance.findByEmployeeAndDate(employee.id, date);
      if (!existingRecord || !existingRecord.check_in) {
        return errorResponse(res, 'No check-in record found for today. Please check in first.', 400);
      }

      const hoursWorked = calculateHoursWorked(existingRecord.check_in, checkOutTime);
      
      // Shift rule: Standard end 06:00 PM (18:00)
      const checkOutMin = now.getHours() * 60 + now.getMinutes();
      const shiftEndMin = 18 * 60; // 6:00 PM
      const earlyExitMinutes = Math.max(0, shiftEndMin - checkOutMin);
      
      // Overtime: Hours worked beyond standard 8.0 hrs shift
      const overtimeHours = hoursWorked > 8.0 ? parseFloat((hoursWorked - 8.0).toFixed(2)) : 0.0;

      await Attendance.checkOut({
        employeeId: employee.id,
        date,
        checkOut: checkOutTime,
        checkOutLat: lat,
        checkOutLng: lng,
        checkOutAddress: address,
        hoursWorked,
        earlyExitMinutes,
        overtimeHours,
        status: existingRecord.status,
      });

      return successResponse(res, {
        checkOutTime,
        hoursWorked,
        earlyExitMinutes,
        overtimeHours,
      }, `Check-out recorded at ${checkOutTime}. Worked ${hoursWorked} hrs.`);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/calendar
   * Monthly calendar data grid.
   */
  getMonthlyCalendar: async (req, res, next) => {
    try {
      const { month, year, employeeId } = req.query;
      const m = month ? parseInt(month, 10) : new Date().getMonth() + 1;
      const y = year ? parseInt(year, 10) : new Date().getFullYear();

      let empId = employeeId ? parseInt(employeeId, 10) : null;
      if (req.user.role === 'employee') {
        const employee = await Employee.findByUserId(req.user.id);
        if (!employee) return errorResponse(res, 'Employee profile not found.', 404);
        empId = employee.id;
      }

      const records = await Attendance.getMonthlyCalendar(m, y, empId);
      return successResponse(res, { month: m, year: y, records }, 'Monthly calendar data retrieved.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/attendance/qr-code
   * Generate QR Code payload token for Kiosk.
   */
  generateQRCode: async (req, res, next) => {
    try {
      const date = new Date().toISOString().split('T')[0];
      const timestamp = Date.now();
      const qrPayload = Buffer.from(JSON.stringify({ date, timestamp, system: 'PayRollPro' })).toString('base64');
      return successResponse(res, { qrPayload, expiresMs: 300000 }, 'QR Code generated.');
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/attendance/qr-scan
   * Process QR code scan to mark attendance.
   */
  scanQRCode: async (req, res, next) => {
    try {
      const { qrPayload, lat, lng } = req.body;
      if (!qrPayload) {
        return errorResponse(res, 'QR Code payload is required.', 400);
      }

      const decoded = JSON.parse(Buffer.from(qrPayload, 'base64').toString('utf8'));
      if (decoded.system !== 'PayRollPro') {
        return errorResponse(res, 'Invalid QR Code payload.', 400);
      }

      // Re-use checkIn controller logic
      req.body = { lat, lng, address: 'QR Code Kiosk Scan' };
      return attendanceController.checkIn(req, res, next);
    } catch (error) {
      return errorResponse(res, 'Invalid or expired QR code.', 400);
    }
  },

  /**
   * POST /api/attendance/biometric
   * Biometric API Integration endpoint for hardware devices (ZKTeco, Hikvision, etc.)
   */
  biometricSync: async (req, res, next) => {
    try {
      const punches = Array.isArray(req.body.punches) ? req.body.punches : [req.body];
      let processed = 0;
      const results = [];

      for (const p of punches) {
        const { empCode, timestamp, punchType, deviceId } = p;
        if (!empCode || !timestamp) continue;

        const employee = await Employee.findByEmpCode(empCode);
        if (!employee) {
          results.push({ empCode, status: 'error', message: 'Employee code not found' });
          continue;
        }

        const dateObj = new Date(timestamp);
        const date = dateObj.toISOString().split('T')[0];
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');
        const seconds = String(dateObj.getSeconds()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}:${seconds}`;

        if (punchType === 'check_out') {
          const existingRecord = await Attendance.findByEmployeeAndDate(employee.id, date);
          const checkInTime = existingRecord?.check_in || '09:00:00';
          const hoursWorked = calculateHoursWorked(checkInTime, timeStr);
          const overtimeHours = hoursWorked > 8.0 ? parseFloat((hoursWorked - 8.0).toFixed(2)) : 0.0;

          await Attendance.checkOut({
            employeeId: employee.id,
            date,
            checkOut: timeStr,
            checkOutAddress: `Biometric Device (${deviceId || 'BIO_GATE'})`,
            hoursWorked,
            overtimeHours,
            status: existingRecord?.status || 'present',
          });
        } else {
          // Default check_in
          const checkInMin = dateObj.getHours() * 60 + dateObj.getMinutes();
          const shiftStartMin = 9 * 60 + 30; // 9:30 AM
          const lateMinutes = Math.max(0, checkInMin - shiftStartMin);
          const status = lateMinutes > 0 ? 'late' : 'present';

          await Attendance.checkIn({
            employeeId: employee.id,
            date,
            checkIn: timeStr,
            checkInAddress: `Biometric Device (${deviceId || 'BIO_GATE'})`,
            shiftName: 'Biometric Auto Shift',
            lateMinutes,
            status,
            markedBy: employee.user_id,
          });
        }

        processed++;
        results.push({ empCode, date, time: timeStr, status: 'success' });
      }

      return successResponse(res, { processedCount: processed, results }, `Processed ${processed} biometric punches.`, 200);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = attendanceController;
