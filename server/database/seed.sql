-- ============================================================
-- PayRoll Pro – Seed Data
-- Default admin, HR users, departments, and sample employees
-- ============================================================

USE payroll_pro;

-- ============================================================
-- Seed Users (passwords are bcrypt hashed version of the plaintext shown)
-- Admin: viveksingh90513@gmail.com / Admin@123
-- HR1:   hr1@payrollpro.com       / Hr@12345
-- HR2:   hr2@payrollpro.com       / Hr@12345
-- Employees: emp1@payrollpro.com through emp20@payrollpro.com / Emp@12345
-- ============================================================
-- Note: These hashes are for bcrypt rounds=10. The application will
-- generate proper hashes at runtime. These are pre-computed for seeding.

INSERT INTO users (email, password_hash, role, is_active) VALUES
-- Password: Admin@123 / VIVE@2004
('admin@payrollpro.com', '$2a$10$lOFBGK8XY3XQWpPvjhkBseiQoKh3ggCjR8FZ3yaGJNmVsi6o/2dv.', 'admin', 1),
('viveksingh90513@gmail.com', '$2a$10$DV.Urr/be9Q17tPBuYIL4eQd8MlxcjSbteExD2KToRbUt2ntq8hYG', 'admin', 1),
-- Password: Hr@12345
('hr1@payrollpro.com', '$2a$10$yCwZiFzZ6yJI5QUYNIuu3u.jE0UxrnCkjEKv03oXHbk6yI/vteM5W', 'hr', 1),
('hr2@payrollpro.com', '$2a$10$yCwZiFzZ6yJI5QUYNIuu3u.jE0UxrnCkjEKv03oXHbk6yI/vteM5W', 'hr', 1),
-- Password: Emp@12345
('emp1@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp2@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp3@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp4@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp5@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp6@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp7@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp8@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp9@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp100@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp11@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp12@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp13@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp14@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp15@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp16@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp17@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp18@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp19@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1),
('emp20@payrollpro.com', '$2a$10$g5dygjXbUblPYKMpt32ri.y4/Ras5fMfwVmtinK.9aqXLNpm3xopK', 'employee', 1);


-- ============================================================
-- Seed Departments
-- ============================================================
INSERT INTO departments (name, description, is_active) VALUES
('Engineering', 'Software development and technical operations', 1),
('Human Resources', 'HR management, recruitment, and employee relations', 1),
('Finance', 'Accounting, financial planning, and payroll', 1),
('Marketing', 'Digital marketing, branding, and communications', 1),
('Sales', 'Business development and client relations', 1),
('Operations', 'Day-to-day operations and process management', 1),
('Design', 'UI/UX design and creative services', 1);

-- ============================================================
-- Seed Employees
-- ============================================================
INSERT INTO employees (user_id, emp_code, first_name, last_name, phone, dob, gender, address, city, state, zip_code, department_id, designation, date_of_joining, employment_type, bank_name, bank_account_no, ifsc_code, pan_number) VALUES
-- Admin user as employee
(1, 'EMP001', 'Vivek Kumar', 'Singh', '9876543210', '1985-06-15', 'male', '12, MG Road, Sector 5', 'Bangalore', 'Karnataka', '560001', 1, 'Chief Technology Officer', '2020-01-15', 'full-time', 'State Bank of India', '1234567890123', 'SBIN0001234', 'ABCPK1234A'),
-- HR users
(2, 'EMP002', 'Priya', 'Sharma', '9876543211', '1990-03-22', 'female', '45, Nehru Street, Anna Nagar', 'Chennai', 'Tamil Nadu', '600040', 2, 'HR Manager', '2021-03-01', 'full-time', 'HDFC Bank', '2345678901234', 'HDFC0002345', 'ABCPS2345B'),
(3, 'EMP003', 'Ankit', 'Verma', '9876543212', '1992-11-08', 'male', '78, Lal Bagh Road', 'Mumbai', 'Maharashtra', '400001', 2, 'HR Executive', '2022-06-15', 'full-time', 'ICICI Bank', '3456789012345', 'ICIC0003456', 'ABCPV3456C'),
-- Engineering employees
(4, 'EMP004', 'Sneha', 'Patel', '9876543213', '1994-07-19', 'female', '23, Jubilee Hills', 'Hyderabad', 'Telangana', '500033', 1, 'Senior Software Engineer', '2022-01-10', 'full-time', 'Axis Bank', '4567890123456', 'UTIB0004567', 'ABCPP4567D'),
(5, 'EMP005', 'Rohit', 'Gupta', '9876543214', '1995-01-30', 'male', '56, Connaught Place', 'New Delhi', 'Delhi', '110001', 1, 'Software Engineer', '2022-07-01', 'full-time', 'Kotak Bank', '5678901234567', 'KKBK0005678', 'ABCPG5678E'),
(6, 'EMP006', 'Kavya', 'Nair', '9876543215', '1996-09-12', 'female', '89, Marine Drive', 'Kochi', 'Kerala', '682001', 1, 'Junior Developer', '2023-01-15', 'full-time', 'Federal Bank', '6789012345678', 'FDRL0006789', 'ABCPN6789F'),
-- Finance employees
(7, 'EMP007', 'Amit', 'Singh', '9876543216', '1988-12-25', 'male', '34, Civil Lines', 'Jaipur', 'Rajasthan', '302001', 3, 'Finance Manager', '2021-04-01', 'full-time', 'Punjab National Bank', '7890123456789', 'PUNB0007890', 'ABCPS7890G'),
(8, 'EMP008', 'Meera', 'Joshi', '9876543217', '1993-04-17', 'female', '67, Park Street', 'Kolkata', 'West Bengal', '700016', 3, 'Accountant', '2022-08-10', 'full-time', 'Bank of Baroda', '8901234567890', 'BARB0008901', 'ABCPJ8901H'),
-- Marketing employees
(9, 'EMP009', 'Vikram', 'Reddy', '9876543218', '1991-08-05', 'male', '12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 4, 'Marketing Lead', '2021-09-01', 'full-time', 'Canara Bank', '9012345678901', 'CNRB0009012', 'ABCPR9012I'),
-- Sales employee
(10, 'EMP010', 'Divya', 'Menon', '9876543219', '1994-02-28', 'female', '45, MG Road', 'Pune', 'Maharashtra', '411001', 5, 'Sales Executive', '2023-02-01', 'full-time', 'Union Bank', '0123456789012', 'UBIN0000123', 'ABCPM0123J'),
-- Design employees
(11, 'EMP011', 'Arjun', 'Desai', '9876543220', '1995-05-14', 'male', '78, FC Road', 'Pune', 'Maharashtra', '411004', 7, 'UI/UX Designer', '2022-11-01', 'full-time', 'IndusInd Bank', '1122334455667', 'INDB0001122', 'ABCPD1122K'),
-- Operations employee
(12, 'EMP012', 'Neha', 'Agarwal', '9876543221', '1993-10-03', 'female', '90, Lajpat Nagar', 'New Delhi', 'Delhi', '110024', 6, 'Operations Coordinator', '2023-03-15', 'full-time', 'Yes Bank', '2233445566778', 'YESB0002233', 'ABCPA2233L'),
-- Intern
(13, 'EMP013', 'Karthik', 'Iyer', '9876543222', '1999-06-20', 'male', '33, Adyar', 'Chennai', 'Tamil Nadu', '600020', 1, 'Software Intern', '2024-01-08', 'intern', 'Indian Bank', '3344556677889', 'IDIB0003344', 'ABCPI3344M');

-- Update department heads
UPDATE departments SET head_id = 1 WHERE name = 'Engineering';
UPDATE departments SET head_id = 2 WHERE name = 'Human Resources';
UPDATE departments SET head_id = 7 WHERE name = 'Finance';
UPDATE departments SET head_id = 9 WHERE name = 'Marketing';
UPDATE departments SET head_id = 10 WHERE name = 'Sales';
UPDATE departments SET head_id = 12 WHERE name = 'Operations';
UPDATE departments SET head_id = 11 WHERE name = 'Design';

-- ============================================================
-- Seed Salary Structures
-- ============================================================
INSERT INTO salary_structures (employee_id, basic_salary, hra, da, ta, medical_allowance, special_allowance, pf_deduction, esi_deduction, tax_deduction, professional_tax, other_deductions, effective_from, is_current) VALUES
(1,  120000, 48000, 12000, 5000, 3000, 12000, 14400, 0, 20000, 200, 0, '2020-01-15', 1),
(2,  80000,  32000, 8000,  3000, 2000, 8000,  9600,  0, 12000, 200, 0, '2021-03-01', 1),
(3,  45000,  18000, 4500,  2000, 1500, 4000,  5400,  833, 5000, 200, 0, '2022-06-15', 1),
(4,  75000,  30000, 7500,  3000, 2000, 7500,  9000,  0, 10000, 200, 0, '2022-01-10', 1),
(5,  55000,  22000, 5500,  2000, 1500, 5000,  6600,  0, 6000,  200, 0, '2022-07-01', 1),
(6,  35000,  14000, 3500,  1500, 1000, 3000,  4200,  648, 2000, 200, 0, '2023-01-15', 1),
(7,  90000,  36000, 9000,  3000, 2500, 9500,  10800, 0, 15000, 200, 0, '2021-04-01', 1),
(8,  50000,  20000, 5000,  2000, 1500, 5000,  6000,  0, 5500,  200, 0, '2022-08-10', 1),
(9,  70000,  28000, 7000,  2500, 2000, 7000,  8400,  0, 9000,  200, 0, '2021-09-01', 1),
(10, 40000,  16000, 4000,  1500, 1000, 3500,  4800,  740, 3000, 200, 0, '2023-02-01', 1),
(11, 60000,  24000, 6000,  2000, 1500, 6000,  7200,  0, 7000,  200, 0, '2022-11-01', 1),
(12, 42000,  16800, 4200,  1500, 1200, 3800,  5040,  0, 3500,  200, 0, '2023-03-15', 1),
(13, 20000,  8000,  2000,  1000, 500,  1500,  2400,  385, 0,    0,   0, '2024-01-08', 1);

-- ============================================================
-- Seed Attendance (last 5 working days as sample)
-- ============================================================
INSERT INTO attendance (employee_id, date, check_in, check_out, status, hours_worked, marked_by) VALUES
-- Day 1
(1,  '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(2,  '2026-07-14', '09:15:00', '18:00:00', 'present', 8.75, 2),
(3,  '2026-07-14', '09:30:00', '18:00:00', 'late',    8.50, 2),
(4,  '2026-07-14', '09:00:00', '18:30:00', 'present', 9.50, 2),
(5,  '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(6,  '2026-07-14', NULL,       NULL,       'absent',  0.00, 2),
(7,  '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(8,  '2026-07-14', '09:00:00', '13:00:00', 'half-day', 4.00, 2),
(9,  '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(10, '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(11, '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
(12, '2026-07-14', NULL,       NULL,       'on-leave', 0.00, 2),
(13, '2026-07-14', '09:00:00', '18:00:00', 'present', 9.00, 2),
-- Day 2
(1,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(2,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(3,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(4,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(5,  '2026-07-15', NULL,       NULL,       'absent',  0.00, 2),
(6,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(7,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(8,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(9,  '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(10, '2026-07-15', '09:30:00', '18:00:00', 'late',    8.50, 2),
(11, '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2),
(12, '2026-07-15', NULL,       NULL,       'on-leave', 0.00, 2),
(13, '2026-07-15', '09:00:00', '18:00:00', 'present', 9.00, 2);

-- ============================================================
-- Seed Leave Requests
-- ============================================================
INSERT INTO leaves (employee_id, leave_type, start_date, end_date, days, reason, status, approved_by, admin_remarks, action_on) VALUES
(12, 'casual',   '2026-07-14', '2026-07-15', 2, 'Family function',                      'approved', 2, 'Approved. Enjoy!', '2026-07-12 10:30:00'),
(6,  'sick',     '2026-07-14', '2026-07-14', 1, 'Feeling unwell, need rest',              'approved', 2, 'Take care',        '2026-07-13 15:00:00'),
(5,  'casual',   '2026-07-15', '2026-07-15', 1, 'Personal work',                          'approved', 3, NULL,               '2026-07-14 09:00:00'),
(4,  'earned',   '2026-07-21', '2026-07-25', 5, 'Annual vacation trip',                   'pending',  NULL, NULL, NULL),
(8,  'sick',     '2026-07-22', '2026-07-23', 2, 'Doctor appointment and follow-up',        'pending',  NULL, NULL, NULL),
(9,  'casual',   '2026-07-28', '2026-07-28', 1, 'Bank work',                               'pending',  NULL, NULL, NULL),
(13, 'unpaid',   '2026-06-15', '2026-06-17', 3, 'College exam preparation',                'approved', 2, 'Approved for exams', '2026-06-13 11:00:00'),
(10, 'maternity','2026-05-01', '2026-10-28', 180, 'Maternity leave as per company policy', 'rejected', 2, 'Please reapply with medical certificate', '2026-04-28 14:00:00');

-- ============================================================
-- Seed Payroll for June 2026
-- ============================================================
INSERT INTO payrolls (employee_id, month, year, working_days, present_days, leave_days, absent_days, basic_pay, hra, da, ta, medical_allowance, special_allowance, total_earnings, pf_deduction, esi_deduction, tax_deduction, professional_tax, other_deductions, loss_of_pay, total_deductions, gross_pay, net_pay, status, generated_by) VALUES
(1,  6, 2026, 22, 22, 0, 0, 120000, 48000, 12000, 5000, 3000, 12000, 200000, 14400, 0,   20000, 200, 0, 0, 34600, 200000, 165400, 'paid', 1),
(2,  6, 2026, 22, 21, 1, 0, 80000,  32000, 8000,  3000, 2000, 8000,  133000, 9600,  0,   12000, 200, 0, 0, 21800, 133000, 111200, 'paid', 1),
(3,  6, 2026, 22, 22, 0, 0, 45000,  18000, 4500,  2000, 1500, 4000,  75000,  5400,  833, 5000,  200, 0, 0, 11433, 75000,  63567,  'paid', 1),
(4,  6, 2026, 22, 22, 0, 0, 75000,  30000, 7500,  3000, 2000, 7500,  125000, 9000,  0,   10000, 200, 0, 0, 19200, 125000, 105800, 'paid', 1),
(5,  6, 2026, 22, 20, 1, 1, 55000,  22000, 5500,  2000, 1500, 5000,  91000,  6600,  0,   6000,  200, 0, 4136, 16936, 91000, 74064, 'paid', 1),
(6,  6, 2026, 22, 21, 0, 1, 35000,  14000, 3500,  1500, 1000, 3000,  58000,  4200,  648, 2000,  200, 0, 2636, 9684,  58000, 48316, 'paid', 1),
(7,  6, 2026, 22, 22, 0, 0, 90000,  36000, 9000,  3000, 2500, 9500,  150000, 10800, 0,   15000, 200, 0, 0, 26000, 150000, 124000, 'paid', 1),
(8,  6, 2026, 22, 22, 0, 0, 50000,  20000, 5000,  2000, 1500, 5000,  83500,  6000,  0,   5500,  200, 0, 0, 11700, 83500,  71800,  'paid', 1),
(9,  6, 2026, 22, 22, 0, 0, 70000,  28000, 7000,  2500, 2000, 7000,  116500, 8400,  0,   9000,  200, 0, 0, 17600, 116500, 98900,  'paid', 1),
(10, 6, 2026, 22, 22, 0, 0, 40000,  16000, 4000,  1500, 1000, 3500,  66000,  4800,  740, 3000,  200, 0, 0, 8740,  66000,  57260,  'paid', 1);
