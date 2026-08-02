-- ============================================================
-- PayRoll Pro – Database Schema
-- Employee Payroll Management System
-- ============================================================

CREATE DATABASE IF NOT EXISTS payroll_pro;
USE payroll_pro;

-- ============================================================
-- 1. Users Table – Authentication & Role Management
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'hr', 'employee') NOT NULL DEFAULT 'employee',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    is_first_login TINYINT(1) NOT NULL DEFAULT 0,
    otp VARCHAR(10) DEFAULT NULL,
    otp_expiry DATETIME DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expiry DATETIME DEFAULT NULL,
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. Departments Table – Department Master Data
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    head_id INT DEFAULT NULL,
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_departments_name (name),
    INDEX idx_departments_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. Employees Table – Employee Master Data
-- ============================================================
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    emp_code VARCHAR(20) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    dob DATE DEFAULT NULL,
    gender ENUM('male', 'female', 'other') DEFAULT NULL,
    address TEXT DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    zip_code VARCHAR(20) DEFAULT NULL,
    department_id INT DEFAULT NULL,
    designation VARCHAR(100) DEFAULT NULL,
    date_of_joining DATE NOT NULL,
    date_of_leaving DATE DEFAULT NULL,
    employment_type ENUM('full-time', 'part-time', 'contract', 'intern') NOT NULL DEFAULT 'full-time',
    profile_photo VARCHAR(255) DEFAULT NULL,
    emergency_contact_name VARCHAR(100) DEFAULT NULL,
    emergency_contact_phone VARCHAR(20) DEFAULT NULL,
    bank_name VARCHAR(100) DEFAULT NULL,
    bank_account_no VARCHAR(50) DEFAULT NULL,
    ifsc_code VARCHAR(20) DEFAULT NULL,
    pan_number VARCHAR(20) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,

    INDEX idx_employees_emp_code (emp_code),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_name (first_name, last_name),
    INDEX idx_employees_joining (date_of_joining)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key for department head after employees table exists (idempotent)
SET @fk_exist := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA = DATABASE() AND CONSTRAINT_NAME = 'fk_department_head');
SET @fk_sql := IF(@fk_exist = 0, 'ALTER TABLE departments ADD CONSTRAINT fk_department_head FOREIGN KEY (head_id) REFERENCES employees(id) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt_fk FROM @fk_sql;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;

-- ============================================================
-- 4. Attendance Table – Daily Attendance Records
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME DEFAULT NULL,
    check_out TIME DEFAULT NULL,
    status ENUM('present', 'absent', 'half-day', 'late', 'on-leave') NOT NULL DEFAULT 'present',
    hours_worked DECIMAL(4,2) DEFAULT 0.00,
    check_in_lat DECIMAL(10,8) DEFAULT NULL,
    check_in_lng DECIMAL(11,8) DEFAULT NULL,
    check_in_address VARCHAR(255) DEFAULT NULL,
    check_out_lat DECIMAL(10,8) DEFAULT NULL,
    check_out_lng DECIMAL(11,8) DEFAULT NULL,
    check_out_address VARCHAR(255) DEFAULT NULL,
    late_minutes INT DEFAULT 0,
    early_exit_minutes INT DEFAULT 0,
    overtime_hours DECIMAL(5,2) DEFAULT 0.00,
    shift_name VARCHAR(50) DEFAULT 'General Shift',
    notes TEXT DEFAULT NULL,
    marked_by INT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE KEY uk_attendance_employee_date (employee_id, date),
    INDEX idx_attendance_date (date),
    INDEX idx_attendance_status (status),
    INDEX idx_attendance_employee_month (employee_id, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. Leaves Table – Leave Requests & Approvals
-- ============================================================
CREATE TABLE IF NOT EXISTS leaves (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    leave_type ENUM('casual', 'sick', 'earned', 'maternity', 'paternity', 'unpaid') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days DECIMAL(4,1) NOT NULL,
    reason TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    approved_by INT DEFAULT NULL,
    admin_remarks TEXT DEFAULT NULL,
    applied_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    action_on DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,

    INDEX idx_leaves_employee (employee_id),
    INDEX idx_leaves_status (status),
    INDEX idx_leaves_dates (start_date, end_date),
    INDEX idx_leaves_type (leave_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. Salary Structures Table – Salary Component Breakdown
-- ============================================================
CREATE TABLE IF NOT EXISTS salary_structures (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    basic_salary DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    hra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    da DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ta DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pf_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    esi_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    professional_tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    gross_salary DECIMAL(12,2) GENERATED ALWAYS AS (
        basic_salary + hra + da + ta + medical_allowance + special_allowance
    ) STORED,
    total_deductions DECIMAL(12,2) GENERATED ALWAYS AS (
        pf_deduction + esi_deduction + tax_deduction + professional_tax + other_deductions
    ) STORED,
    net_salary DECIMAL(12,2) GENERATED ALWAYS AS (
        (basic_salary + hra + da + ta + medical_allowance + special_allowance) -
        (pf_deduction + esi_deduction + tax_deduction + professional_tax + other_deductions)
    ) STORED,
    effective_from DATE NOT NULL,
    effective_to DATE DEFAULT NULL,
    is_current TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,

    INDEX idx_salary_employee (employee_id),
    INDEX idx_salary_current (is_current),
    INDEX idx_salary_effective (effective_from, effective_to)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. Payrolls Table – Monthly Payroll Records
-- ============================================================
CREATE TABLE IF NOT EXISTS payrolls (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    month INT NOT NULL,
    year INT NOT NULL,
    working_days INT NOT NULL DEFAULT 0,
    present_days INT NOT NULL DEFAULT 0,
    leave_days INT NOT NULL DEFAULT 0,
    absent_days INT NOT NULL DEFAULT 0,
    basic_pay DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    hra DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    da DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    ta DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    medical_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    special_allowance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    pf_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    esi_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_deduction DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    professional_tax DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    other_deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    loss_of_pay DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_deductions DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    gross_pay DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    net_pay DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status ENUM('generated', 'paid', 'cancelled') NOT NULL DEFAULT 'generated',
    generated_by INT DEFAULT NULL,
    paid_on DATE DEFAULT NULL,
    payment_mode ENUM('bank_transfer', 'cheque', 'cash') DEFAULT 'bank_transfer',
    transaction_ref VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,

    UNIQUE KEY uk_payroll_employee_month (employee_id, month, year),
    INDEX idx_payroll_month_year (month, year),
    INDEX idx_payroll_status (status),
    INDEX idx_payroll_employee (employee_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. Payslips Table – Generated Payslip PDF Records
-- ============================================================
CREATE TABLE IF NOT EXISTS payslips (
    id INT AUTO_INCREMENT PRIMARY KEY,
    payroll_id INT NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (payroll_id) REFERENCES payrolls(id) ON DELETE CASCADE,

    INDEX idx_payslips_payroll (payroll_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
