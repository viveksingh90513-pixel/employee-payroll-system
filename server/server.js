/**
 * PayRoll Pro – Express Server Entry Point
 * Configures middleware, mounts routes, and starts the HTTP server.
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

const rateLimit = require('express-rate-limit');

const { initializeDatabase, testConnection } = require('./config/db');
const { verifyEmailConnection } = require('./config/email');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const salaryRoutes = require('./routes/salaryRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRoutes = require('./routes/profileRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Rate limiting middleware
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Please try again after 15 minutes.' }
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);
app.use('/api/auth/reset-password', authLimiter);
app.use('/api/', apiLimiter);

// CORS – Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
  allowedOrigins.push(process.env.CLIENT_URL.replace(/\/$/, ''));
}

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(null, true); // Fallback allow all in dev environment
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Request logging (dev: colored output, prod: combined format)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Parse JSON request bodies (limit 10MB for file upload metadata)
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files as static assets
const uploadsDir = path.join(__dirname, process.env.UPLOAD_DIR || 'uploads');
try { if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true }); } catch (e) { /* read-only fs */ }
app.use('/uploads', express.static(uploadsDir));

// Serve generated payslip PDFs
const payslipsDir = path.join(__dirname, 'payslips');
try { if (!fs.existsSync(payslipsDir)) fs.mkdirSync(payslipsDir, { recursive: true }); } catch (e) { /* read-only fs */ }
app.use('/payslips', express.static(payslipsDir));

// ============================================================
// API Routes
// ============================================================

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/salary', salaryRoutes);
app.use('/api/payroll', payrollRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRoutes);

// Root & Welcome endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: '🚀 PayRoll Pro REST API Server is online and operational!',
    documentation: 'All API endpoints are mounted under /api/*',
    health: '/api/health',
    frontend: process.env.CLIENT_URL || 'http://localhost:5173'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'PayRoll Pro API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ============================================================
// Global Error Handler (must be last middleware)
// ============================================================
app.use(errorHandler);

// ============================================================
// Server Startup
// ============================================================

const startServer = async () => {
  try {
    console.log('\n🚀 Starting PayRoll Pro Server...\n');

    // Step 1: Initialize database (create DB + tables if needed)
    await initializeDatabase();

    // Step 2: Test connection pool
    await testConnection();

    // Step 3: Verify email configuration (non-blocking)
    await verifyEmailConnection();

    // Step 4: Start the HTTP server
    app.listen(PORT, () => {
      console.log(`\n${'═'.repeat(50)}`);
      console.log(`  💼 PayRoll Pro Server`);
      console.log(`  📡 Port: ${PORT}`);
      console.log(`  🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  🔗 API: http://localhost:${PORT}/api`);
      console.log(`  ❤️  Health: http://localhost:${PORT}/api/health`);
      console.log(`${'═'.repeat(50)}\n`);
    });
  } catch (error) {
    console.error('\n❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

startServer();

module.exports = app;
