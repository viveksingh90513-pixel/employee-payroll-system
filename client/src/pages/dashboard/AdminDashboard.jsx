import { useState } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { 
  HiOutlineUsers, 
  HiOutlineOfficeBuilding, 
  HiOutlineCash, 
  HiOutlineDocumentText 
} from 'react-icons/hi';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import useFetch from '../../hooks/useFetch';
import StatsCard from '../../components/common/StatsCard';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCompactNumber, formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const AdminDashboard = () => {
  const { data: stats, loading: statsLoading } = useFetch('/dashboard/stats');
  const { data: charts, loading: chartsLoading } = useFetch('/dashboard/charts');

  if (statsLoading || chartsLoading) {
    return <LoadingSpinner />;
  }

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div>
      <PageHeader 
        title="Dashboard Overview" 
        subtitle="Key metrics and analytics for your organization."
      />

      {/* Stats Row */}
      <Row className="dashboard-grid dashboard-grid-4 mb-4">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={<HiOutlineUsers />}
          color="primary"
          trend={stats?.newEmployeesThisMonth}
          trendLabel="new this month"
          delay={0}
        />
        <StatsCard
          title="Departments"
          value={stats?.totalDepartments || 0}
          icon={<HiOutlineOfficeBuilding />}
          color="violet"
          delay={0.1}
        />
        <StatsCard
          title="Monthly Payroll"
          value={formatCompactNumber(stats?.monthlyPayroll || 0)}
          icon={<HiOutlineCash />}
          color="success"
          trendLabel={`processed: ${stats?.payrollProcessed || 0}`}
          delay={0.2}
        />
        <StatsCard
          title="Pending Leaves"
          value={stats?.pendingLeaves || 0}
          icon={<HiOutlineDocumentText />}
          color="warning"
          delay={0.3}
        />
      </Row>

      <Row className="mb-4">
        {/* Payroll Trend Chart */}
        <Col lg={8} className="mb-4 mb-lg-0">
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <h3 className="chart-container-title">Payroll Trend (6 Months)</h3>
            <p className="chart-container-subtitle">Total payout vs employee count</p>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={charts?.payrollTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis yAxisId="left" tickFormatter={(val) => `₹${val/1000}k`} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={-10} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dx={10} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    formatter={(value, name) => [name === 'totalPayout' ? `₹${value.toLocaleString()}` : value, name === 'totalPayout' ? 'Total Payout' : 'Employees']}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Line yAxisId="left" type="monotone" dataKey="totalPayout" name="Total Payout" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="employeeCount" name="Employees" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Today's Attendance Pie Chart */}
        <Col lg={4}>
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h3 className="chart-container-title">Today's Attendance</h3>
            <p className="chart-container-subtitle">Real-time status</p>
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {(stats?.todayTotal || 0) === 0 ? (
                <div className="text-center text-muted">No attendance marked today</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Present', value: stats.todayPresent },
                        { name: 'Absent/Leave', value: stats.todayAbsent }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Department Distribution */}
        <Col lg={6} className="mb-4 mb-lg-0">
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <h3 className="chart-container-title">Employees by Department</h3>
            <div style={{ height: '300px', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts?.departmentDistribution || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#4b5563', fontWeight: 500 }} width={100} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="employees" name="Employees" radius={[0, 4, 4, 0]}>
                    {(charts?.departmentDistribution || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Col>

        {/* Recent Leave Requests */}
        <Col lg={6}>
          <div className="chart-container h-100 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h3 className="chart-container-title">Recent Leave Requests</h3>
                <p className="chart-container-subtitle mb-0">Needs attention</p>
              </div>
              <a href="/leaves" className="btn btn-sm btn-outline-primary">View All</a>
            </div>
            
            {(!charts?.recentLeaves || charts.recentLeaves.length === 0) ? (
              <div className="text-center text-muted py-5">No recent leave requests</div>
            ) : (
              <ul className="activity-list">
                {charts.recentLeaves.map((leave, idx) => (
                  <li key={idx} className="activity-item">
                    <div className="activity-avatar bg-gradient-violet">
                      {leave.employee.charAt(0)}
                    </div>
                    <div className="activity-info">
                      <div className="activity-name">{leave.employee}</div>
                      <div className="activity-detail">
                        {leave.days} day(s) • {leave.type} leave • from {formatDate(leave.date)}
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

export default AdminDashboard;
