import { Row, Col } from 'react-bootstrap';
import { 
  HiOutlineClipboardCheck, 
  HiOutlineCalendar, 
  HiOutlineCash,
  HiOutlineClock
} from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import StatsCard from '../../components/common/StatsCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, formatDate, getMonthName } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const EmployeeDashboard = () => {
  const { data: dashboard, loading } = useFetch('/dashboard/employee');

  if (loading) return <LoadingSpinner />;

  const { employee, attendanceSummary, leaveBalance, salary, recentPayrolls, recentLeaves } = dashboard || {};
  const currentMonth = new Date().getMonth() + 1;
  const currentMonthName = getMonthName(currentMonth);

  return (
    <div>
      <PageHeader 
        title={`Welcome back, ${employee?.name || 'Employee'}`}
        subtitle={`${employee?.designation || 'Staff'} • ${employee?.department || 'General'}`}
      />

      {/* Stats Row */}
      <Row className="dashboard-grid dashboard-grid-4 mb-4">
        <StatsCard
          title={`Attendance (${currentMonthName})`}
          value={`${attendanceSummary?.present || 0} / ${attendanceSummary?.total_working_days || 0}`}
          icon={<HiOutlineClipboardCheck />}
          color="success"
          trendLabel="days present"
          delay={0}
        />
        <StatsCard
          title="Leaves Available"
          value={
            (leaveBalance?.casual?.remaining || 0) + 
            (leaveBalance?.sick?.remaining || 0) + 
            (leaveBalance?.earned?.remaining || 0)
          }
          icon={<HiOutlineCalendar />}
          color="warning"
          trendLabel="Total paid leaves"
          delay={0.1}
        />
        <StatsCard
          title="Gross Salary"
          value={salary?.grossSalary ? formatCurrency(salary.grossSalary) : '₹0'}
          icon={<HiOutlineCash />}
          color="primary"
          delay={0.2}
        />
        <StatsCard
          title="Net Salary (Est)"
          value={salary?.netSalary ? formatCurrency(salary.netSalary) : '₹0'}
          icon={<HiOutlineCash />}
          color="violet"
          delay={0.3}
        />
      </Row>

      <Row>
        {/* Recent Payslips */}
        <Col lg={6} className="mb-4 mb-lg-0">
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="chart-container-title">Recent Payslips</h3>
                <p className="chart-container-subtitle mb-0">Your latest payroll history</p>
              </div>
              <a href="/payroll" className="btn btn-sm btn-outline-primary">View All</a>
            </div>

            {(!recentPayrolls || recentPayrolls.length === 0) ? (
              <div className="text-center text-muted py-5">No payroll records found</div>
            ) : (
              <ul className="activity-list">
                {recentPayrolls.map((payroll, idx) => (
                  <li key={idx} className="activity-item py-3">
                    <div className="activity-avatar bg-gradient-success">
                      <HiOutlineCash size={20} />
                    </div>
                    <div className="activity-info">
                      <div className="activity-name font-weight-bold">
                        {getMonthName(payroll.month)} {payroll.year}
                      </div>
                      <div className="activity-detail mt-1">
                        Gross: {formatCurrency(payroll.gross_pay)} • Net: {formatCurrency(payroll.net_pay)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`badge bg-${STATUS_COLORS[payroll.status]}-light text-${STATUS_COLORS[payroll.status]} d-block mb-1`}>
                        {payroll.status}
                      </span>
                      {payroll.status === 'paid' && (
                        <a href={`/api/payroll/${payroll.id}/payslip`} className="text-xs font-semibold text-primary-600" target="_blank" rel="noreferrer">
                          Download PDF
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>

        {/* Recent Leave Requests */}
        <Col lg={6}>
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h3 className="chart-container-title">Leave History</h3>
                <p className="chart-container-subtitle mb-0">Your recent leave requests</p>
              </div>
              <a href="/leaves/apply" className="btn btn-sm btn-primary">Apply Leave</a>
            </div>

            {(!recentLeaves || recentLeaves.length === 0) ? (
              <div className="text-center text-muted py-5">No leave history found</div>
            ) : (
              <ul className="activity-list">
                {recentLeaves.map((leave, idx) => (
                  <li key={idx} className="activity-item py-3">
                    <div className={`activity-avatar bg-${STATUS_COLORS[leave.status]}`}>
                      <HiOutlineClock size={20} />
                    </div>
                    <div className="activity-info">
                      <div className="activity-name font-weight-bold text-capitalize">
                        {leave.leave_type} Leave
                      </div>
                      <div className="activity-detail mt-1">
                        {formatDate(leave.start_date)} to {formatDate(leave.end_date)} ({leave.days} days)
                      </div>
                    </div>
                    <span className={`badge bg-${STATUS_COLORS[leave.status]}-light text-${STATUS_COLORS[leave.status]}`}>
                      {leave.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;
