/**
 * PayRoll Pro – App Component
 * Root component with React Router v6 setup and role-based route guards.
 */

import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Layouts
import DashboardLayout from './layouts/DashboardLayout';
import AuthLayout from './layouts/AuthLayout';

// Loading component
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy Loaded Pages
const Login = lazy(() => import('./pages/auth/Login'));
const ForgotPasswordOTP = lazy(() => import('./pages/auth/ForgotPasswordOTP'));
const ChangePassword = lazy(() => import('./pages/auth/ChangePassword'));

const AdminDashboard = lazy(() => import('./pages/dashboard/AdminDashboard'));
const EmployeeDashboard = lazy(() => import('./pages/dashboard/EmployeeDashboard'));

const EmployeeList = lazy(() => import('./pages/employees/EmployeeList'));
const AddEmployee = lazy(() => import('./pages/employees/AddEmployee'));
const EditEmployee = lazy(() => import('./pages/employees/EditEmployee'));
const ViewEmployee = lazy(() => import('./pages/employees/ViewEmployee'));

const DepartmentList = lazy(() => import('./pages/departments/DepartmentList'));

const AttendanceList = lazy(() => import('./pages/attendance/AttendanceList'));
const MarkAttendance = lazy(() => import('./pages/attendance/MarkAttendance'));

const LeaveList = lazy(() => import('./pages/leaves/LeaveList'));
const ApplyLeave = lazy(() => import('./pages/leaves/ApplyLeave'));

const SalaryStructure = lazy(() => import('./pages/salary/SalaryStructure'));

const PayrollList = lazy(() => import('./pages/payroll/PayrollList'));
const GeneratePayroll = lazy(() => import('./pages/payroll/GeneratePayroll'));
const ViewPayslip = lazy(() => import('./pages/payroll/ViewPayslip'));

const Reports = lazy(() => import('./pages/reports/Reports'));

const Profile = lazy(() => import('./pages/profile/Profile'));

const NotFound = lazy(() => import('./pages/NotFound'));

/**
 * Protected Route wrapper – redirects to login if not authenticated.
 * Enforces change-password redirection if isFirstLogin == true.
 * Optionally restricts by role.
 */
const ProtectedRoute = ({ children, roles, allowFirstLogin = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // First-time login forced change password removed per user requirement

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Public Route wrapper – redirects to dashboard if already authenticated.
 */
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingSpinner fullPage />;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Dashboard redirect based on user role.
 */
const DashboardRedirect = () => {
  const { user } = useAuth();

  if (user?.role === 'employee') {
    return <EmployeeDashboard />;
  }

  return <AdminDashboard />;
};

const App = () => {
  return (
    <Suspense fallback={<LoadingSpinner fullPage />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <AuthLayout><Login /></AuthLayout>
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <AuthLayout><ForgotPasswordOTP /></AuthLayout>
          </PublicRoute>
        } />

        {/* Forced Password Change Route for First Login */}
        <Route path="/change-password" element={
          <ProtectedRoute allowFirstLogin={true}>
            <AuthLayout><ChangePassword /></AuthLayout>
          </ProtectedRoute>
        } />

        {/* Protected Routes – Wrapped in DashboardLayout */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          {/* Dashboard */}
          <Route path="/" element={<DashboardRedirect />} />

          {/* Employees (Admin/HR) */}
          <Route path="/employees" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <EmployeeList />
            </ProtectedRoute>
          } />
          <Route path="/employees/add" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <AddEmployee />
            </ProtectedRoute>
          } />
          <Route path="/employees/edit/:id" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <EditEmployee />
            </ProtectedRoute>
          } />
          <Route path="/employees/view/:id" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <ViewEmployee />
            </ProtectedRoute>
          } />

          {/* Departments (Admin/HR) */}
          <Route path="/departments" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <DepartmentList />
            </ProtectedRoute>
          } />

          {/* Attendance */}
          <Route path="/attendance" element={<AttendanceList />} />
          <Route path="/attendance/mark" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <MarkAttendance />
            </ProtectedRoute>
          } />

          {/* Leaves */}
          <Route path="/leaves" element={<LeaveList />} />
          <Route path="/leaves/apply" element={<ApplyLeave />} />

          {/* Salary (Admin/HR) */}
          <Route path="/salary" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <SalaryStructure />
            </ProtectedRoute>
          } />

          {/* Payroll */}
          <Route path="/payroll" element={<PayrollList />} />
          <Route path="/payroll/generate" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <GeneratePayroll />
            </ProtectedRoute>
          } />
          <Route path="/payroll/payslip/:id" element={<ViewPayslip />} />

          {/* Reports (Admin/HR) */}
          <Route path="/reports" element={
            <ProtectedRoute roles={['admin', 'hr']}>
              <Reports />
            </ProtectedRoute>
          } />

          {/* Profile (All) */}
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
