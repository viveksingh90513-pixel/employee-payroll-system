# 💼 PayRoll Pro – Enterprise MERN Employee Payroll System

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel)](https://employee-payroll-system-lac.vercel.app)
[![Backend](https://img.shields.io/badge/Backend-Railway-0B0D0E?style=for-the-badge&logo=railway)](https://employee-payroll-system-production-94fd.up.railway.app/api/health)
[![Database](https://img.shields.io/badge/Database-Railway_MySQL-00758F?style=for-the-badge&logo=mysql)](https://railway.app)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**PayRoll Pro** is a production-grade enterprise Human Resource & Payroll Management System (HRMS) built with **React 18 (Vite)**, **Node.js/Express**, and **MySQL**. It features real-time attendance tracking, leave management, automated monthly payroll generation, PDF payslip downloads, CSV data exporting, DDoS rate limiting, and persistent dark mode.

---

## 🌐 Live Production Application

- **Live Web App (Vercel)**: 👉 [https://employee-payroll-system-lac.vercel.app](https://employee-payroll-system-lac.vercel.app)
- **Live Backend API (Railway)**: 👉 [https://employee-payroll-system-production-94fd.up.railway.app/api](https://employee-payroll-system-production-94fd.up.railway.app/api)
- **Live API Health Check**: 👉 [https://employee-payroll-system-production-94fd.up.railway.app/api/health](https://employee-payroll-system-production-94fd.up.railway.app/api/health)

---

## 🔑 Demo Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| 👑 **Administrator** | `admin@payrollpro.com` | `Admin@123` | Full System Control, User Creation, Reports |
| 👔 **HR Manager** | `hr1@payrollpro.com` | `Hr@12345` | Employee Directory, Attendance, Payroll |
| 👨‍💼 **Employee** | `emp1@payrollpro.com` | `Emp@12345` | Personal Dashboard, Payslips, Leave Application |

---

## ✨ Enterprise Features

- 👥 **Workforce Management**: Complete CRUD employee management with designations, departments, join dates, and salary structures.
- 💰 **Automated Payroll Engine**: Compute gross pay, allowances (HRA, DA, Special, TA), deductions (PF, ESI, Income Tax, PT), and net pay.
- 📄 **PDF Payslip Generation**: Dynamic client/server PDF payslip generation and instant downloading.
- 📊 **CSV Data Exports**: Export complete Employee directories, Payroll records, and Attendance reports to CSV with 1-click.
- 🌙 **Dark Mode Support**: Context-driven theme switcher with `localStorage` persistence and smooth CSS variable transitions.
- 🛡️ **Security Protection**: Rate limiting (`express-rate-limit`) against brute-force & DDoS, bcrypt password hashing, and JWT authorization.
- ⚡ **Optimized Performance**: Code-split React routes via `React.lazy()` and `<Suspense>`, fast Vite build bundles, and idempotent database auto-seeding on bootup.

---

## 🛠️ Architecture & Tech Stack

### **Frontend**
- **Framework**: React 18 (Vite)
- **State & Routing**: React Context API, React Router v6, Axios
- **Styling & UI**: Custom Vanilla CSS Tokens, Dark Mode Switcher, Skeleton Loaders
- **Hosting**: Deployed on **Vercel** with SPA rewrites

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database Driver**: `mysql2/promise` with Connection Pooling & Auto-seeding
- **Security & Limits**: `express-rate-limit`, `helmet`, `cors`, `jsonwebtoken`, `bcryptjs`
- **Hosting**: Deployed on **Railway** with automatic MySQL connection

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/viveksingh90513-pixel/employee-payroll-system.git
cd employee-payroll-system
```

### 2. Configure Backend
```bash
cd server
npm install
npm start
```
*The server will start on `http://localhost:5000` and automatically verify & seed database schema on boot.*

### 3. Configure Frontend
```bash
cd ../client
npm install
npm run dev
```
*The frontend web app will start on `http://localhost:5173`.*

---

## 📄 License
Distributed under the MIT License. Built with ❤️ for enterprise HR & Payroll teams.
