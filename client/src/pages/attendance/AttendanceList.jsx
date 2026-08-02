import { useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { 
  HiOutlineCalendar, 
  HiOutlineClipboardCheck, 
  HiOutlineExclamationCircle,
  HiOutlineViewList,
  HiOutlineViewGrid
} from 'react-icons/hi';
import { HiOutlineCalendar as HiOutlineCalendarIcon } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import GPSAttendanceWidget from '../../components/attendance/GPSAttendanceWidget';
import QRCodeModal from '../../components/attendance/QRCodeModal';
import MonthlyCalendar from '../../components/attendance/MonthlyCalendar';
import { formatDate } from '../../utils/formatters';

const AttendanceList = () => {
  const { user, hasRole } = useAuth();
  const isAdminOrHR = hasRole('admin') || hasRole('hr');
  
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'calendar'
  const [showQRModal, setShowQRModal] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Fetch summary stats
  const { data: summary, refetch: refetchSummary } = useFetch('/attendance/summary');

  // Fetch detailed records
  const { data, loading, refetch: refetchData } = useFetch('/attendance', {
    params: { 
      page, 
      limit: 10, 
      search,
    }
  });

  const handleRefresh = () => {
    refetchSummary();
    refetchData();
  };

  const columns = [
    { header: 'Date', accessor: 'date', render: (row) => <span className="font-weight-bold">{formatDate(row.date)}</span> },
    ...(isAdminOrHR ? [{ 
      header: 'Employee', 
      accessor: 'first_name',
      render: (row) => (
        <div>
          <div className="font-weight-bold">{row.first_name} {row.last_name}</div>
          <div className="small text-muted">{row.emp_code}</div>
        </div>
      )
    }] : []),
    { 
      header: 'Shift', 
      accessor: 'shift_name',
      render: (row) => <span className="small font-weight-bold text-muted">{row.shift_name || 'General Shift'}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`status-badge status-${row.status}`}>
          {row.status}
        </span>
      )
    },
    { header: 'Check In', accessor: 'check_in', render: (row) => row.check_in || '-' },
    { header: 'Check Out', accessor: 'check_out', render: (row) => row.check_out || '-' },
    { 
      header: 'Hours Worked', 
      accessor: 'hours_worked',
      render: (row) => row.hours_worked ? `${row.hours_worked} hrs` : '-'
    },
    { 
      header: 'Late / Overtime', 
      accessor: 'late_minutes',
      render: (row) => (
        <div className="small">
          {row.late_minutes > 0 && <div className="text-warning font-weight-bold">+{row.late_minutes}m Late</div>}
          {row.overtime_hours > 0 && <div className="text-primary font-weight-bold">+{row.overtime_hours}h OT</div>}
          {!row.late_minutes && !row.overtime_hours && <span className="text-muted">-</span>}
        </div>
      )
    },
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Attendance Management" 
        subtitle={isAdminOrHR ? "Monitor employee daily attendance, GPS punch-ins, shifts, and monthly calendar." : "Self check-in and view your monthly attendance calendar."}
        breadcrumbs="Operations / Attendance"
        action={
          <div className="d-flex gap-2 border rounded-3 p-1 bg-white">
            <Button 
              variant={viewMode === 'list' ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('list')}
              className="d-flex align-items-center gap-1"
            >
              <HiOutlineCalendarIcon /> Table View
            </Button>
            <Button 
              variant={viewMode === 'calendar' ? 'primary' : 'ghost'} 
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="d-flex align-items-center gap-1"
            >
              <HiOutlineCalendarIcon /> Monthly Calendar
            </Button>
          </div>
        }
      />

      {/* GPS Self Check-In / Punch-Out Widget */}
      <GPSAttendanceWidget 
        onAttendanceMarked={handleRefresh}
        onOpenQR={() => setShowQRModal(true)}
      />

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div className="rounded-3 bg-success bg-opacity-10 text-success p-3">
                <HiOutlineClipboardCheck size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase font-weight-bold">Present</span>
                <h4 className="mb-0 font-weight-bold text-dark">{summary?.present || 0}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div className="rounded-3 bg-warning bg-opacity-10 text-warning p-3">
                <HiOutlineCalendarIcon size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase font-weight-bold">Late Entries</span>
                <h4 className="mb-0 font-weight-bold text-dark">{summary?.late || 0}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div className="rounded-3 bg-danger bg-opacity-10 text-danger p-3">
                <HiOutlineExclamationCircle size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase font-weight-bold">Absent</span>
                <h4 className="mb-0 font-weight-bold text-dark">{summary?.absent || 0}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 bg-white">
            <Card.Body className="p-3 d-flex align-items-center gap-3">
              <div className="rounded-3 bg-primary bg-opacity-10 text-primary p-3">
                <HiOutlineCalendarIcon size={24} />
              </div>
              <div>
                <span className="text-muted small text-uppercase font-weight-bold">On Leave</span>
                <h4 className="mb-0 font-weight-bold text-dark">{summary?.on_leave || 0}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main View Mode: List vs Monthly Calendar */}
      {viewMode === 'calendar' ? (
        <MonthlyCalendar employeeId={user?.role === 'employee' ? user?.employeeId : undefined} />
      ) : (
        <DataTable
          columns={columns}
          data={data?.records || []}
          loading={loading}
          totalItems={data?.total || 0}
          currentPage={page}
          pageSize={10}
          onPageChange={setPage}
          onSearch={isAdminOrHR ? setSearch : undefined}
          searchPlaceholder="Search by employee name..."
          emptyMessage="No attendance records found for this period."
        />
      )}

      {/* QR Code Attendance Modal */}
      <QRCodeModal 
        show={showQRModal} 
        onHide={() => setShowQRModal(false)} 
        onAttendanceMarked={handleRefresh} 
      />
    </div>
  );
};

export default AttendanceList;
