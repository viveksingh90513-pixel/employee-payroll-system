# 💼 PayRoll Pro – Employee Payroll Management System

[![Node.js](https://img.shields.io/badge/Backend-Node.js_v18+-green?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![React](https://img.shields.io/badge/Frontend-React_18-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-00758F?style=for-the-badge&logo=mysql)](https://www.mysql.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**PayRoll Pro** is a modern, full-stack enterprise Employee & Payroll Management System designed to streamline human resource management, automated payroll generation, leave requests, attendance tracking, and downloadable PDF payslips.

---

## 🔑 Default Credentials

> **Admin Account**
> - **Email:** `viveksingh90513@gmail.com`
> - **Password:** `VIVE@2004`
> - **Role:** Administrator (Full Access)

---

## ✨ Features

- 👥 **Employee Management**: Create, edit, search, and manage detailed employee records (personal data, bank details, designation, department).
- 💰 **Automated Payroll Processing**: Calculate basic pay, allowances (HRA, DA, Special), deductions (PF, ESI, Tax), net salary, and generate monthly payslips.
- 📄 **PDF Payslip Generation**: Auto-generate downloadable and printable PDF payslips with official company formatting.
- 📅 **Attendance Tracking**: Monitor daily check-ins, check-outs, working hours, and status (Present, Absent, Half-Day, Late).
- 🏖️ **Leave Management System**: Submit leave applications (Casual, Sick, Earned), track leave balances, and approve/reject leave requests.
- 📊 **Interactive Dashboard**: Real-time stats on total staff, monthly payroll expenditure, pending leave approvals, and recent activities.
- 🔒 **Authentication & RBAC**: Secure JWT-based authentication with Role-Based Access Control (Admin, HR, Employee).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 18 (Vite)
- **State & Router:** React Router v6, Axios
- **Styling:** CSS3, Modern Dark/Light Theme UI
- **Icons:** React Icons

### **Backend**
- **Runtime:** Node.js & Express.js
- **Database Driver:** `mysql2/promise` with Connection Pooling
- **Authentication:** JSON Web Tokens (JWT), `bcryptjs`
- **File & PDF Processing:** PDFKit, Multer

---

## 📂 Project Structure

```
Employee Payroll System/
├── client/                     # React Frontend (Vite)
│   ├── src/
│   │   ├── api/                # Axios instance & API client
│   │   ├── components/         # Reusable UI Components & Navigation
│   │   ├── context/            # Authentication State Context
│   │   ├── pages/              # Dashboard, Employees, Payroll, Leaves, Settings
│   │   └── utils/              # Helper functions & constants
│   └── package.json
│
├── server/                     # Express Backend API
│   ├── config/                 # Database connection pool & SSL config
│   ├── controllers/            # Business logic for Auth, Employees, Payroll, Leaves
│   ├── database/               # SQL Schema & Seed scripts
│   ├── middleware/             # Auth, Role Verification, Upload middleware
│   ├── models/                 # MySQL Data Access Layer (User, Employee, Payroll, Leave)
│   ├── routes/                 # Express API Endpoints
│   ├── utils/                  # PDF Generator, Email Service, Helper utilities
│   └── server.js               # Main Express application server
```

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- MySQL Server (Local or Cloud)
- Git

### 1. Clone Repository
```bash
git clone https://github.com/viveksingh90511-cloud/employee-payroll-system.git
cd employee-payroll-system
```

### 2. Configure Backend Environment
Create a `.env` file in the `server/` directory:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=payroll_pro

JWT_SECRET=payrollpro_jwt_secret_key_2026
JWT_EXPIRES_IN=24h

CLIENT_URL=http://localhost:5173
```

### 3. Initialize Database
Import schema and seed data into MySQL:
```bash
mysql -u root -p < server/database/schema.sql
mysql -u root -p < server/database/seed.sql
```

### 4. Install Dependencies & Run
#### **Start Server (Port 5000)**
```bash
cd server
npm install
npm start
```

#### **Start Frontend (Port 5173)**
```bash
cd ../client
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 📡 Key API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token | ❌ |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | ✅ |
| `GET` | `/api/dashboard/stats` | Retrieve overall metrics & charts | ✅ (Admin/HR) |
| `GET` | `/api/employees` | List all employees | ✅ |
| `POST` | `/api/employees` | Create new employee record | ✅ (Admin/HR) |
| `GET` | `/api/payroll` | Fetch monthly payroll records | ✅ |
| `POST` | `/api/payroll/generate` | Process & generate monthly payroll | ✅ (Admin/HR) |
| `GET` | `/api/payroll/download/:id` | Download PDF payslip | ✅ |
| `GET` | `/api/leaves` | List leave requests | ✅ |
| `POST` | `/api/leaves/apply` | Submit leave application | ✅ |

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Developed with ❤️ by **Vivek Kumar Singh**.
