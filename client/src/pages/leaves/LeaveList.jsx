import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Badge } from 'react-bootstrap';
import { HiOutlinePlus, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClock } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import useAuth from '../../hooks/useAuth';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatDate } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

const LeaveList = () => {
  const { hasRole } = useAuth();
  const isAdminOrHR = hasRole('admin') || hasRole('hr');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  
  const [actionModal, setActionModal] = useState({ show: false, id: null, action: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, loading, refetch } = useFetch('/leaves', {
    params: { page, limit: 10, status: statusFilter }
  });

  // Balance fetch (only for employee view)
  const { data: balanceData } = useFetch(isAdminOrHR ? null : '/leaves/balance');

  const handleStatusAction = async () => {
    try {
      setIsProcessing(true);
      const res = await api.put(`/leaves/${actionModal.id}/status`, { status: actionModal.action });
      if (res.data.success) {
        showSuccess(`Leave request ${actionModal.action} successfully`);
        setActionModal({ show: false, id: null, action: '' });
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || `Failed to ${actionModal.action} leave request`);
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    ...(isAdminOrHR ? [{ 
      header: 'Employee', 
      accessor: 'employee_name',
      render: (row) => (
        <div>
          <div className="font-weight-bold">{row.employee_name}</div>
          <div className="small text-muted">{row.emp_code}</div>
        </div>
      )
    }] : []),
    { header: 'Leave Type', accessor: 'leave_type', render: (row) => <span className="text-capitalize">{row.leave_type}</span> },
    { 
      header: 'Duration', 
      accessor: 'start_date',
      render: (row) => (
        <div>
          <div>{formatDate(row.start_date)} - {formatDate(row.end_date)}</div>
          <div className="small text-muted">{row.days} day(s)</div>
        </div>
      )
    },
    { 
      header: 'Reason', 
      accessor: 'reason',
      render: (row) => <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.reason}>{row.reason}</div>
    },
    { 
      header: 'Applied On', 
      accessor: 'created_at',
      render: (row) => <span className="text-muted small">{formatDate(row.created_at)}</span>
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (row) => (
        <span className={`status-badge status-${row.status.replace('_', '-')}`}>
          {row.status.replace('_', ' ')}
        </span>
      )
    },
  ];

  const renderActions = (row) => {
    if (!isAdminOrHR || row.status !== 'pending') return null;

    return (
      <div className="d-flex gap-2">
        <Button 
          variant="outline-success" 
          size="sm" 
          className="p-1 px-2 d-flex align-items-center gap-1"
          onClick={() => setActionModal({ show: true, id: row.id, action: 'approved' })}
        >
          <HiOutlineCheckCircle /> Approve
        </Button>
        <Button 
          variant="outline-danger" 
          size="sm" 
          className="p-1 px-2 d-flex align-items-center gap-1"
          onClick={() => setActionModal({ show: true, id: row.id, action: 'rejected' })}
        >
          <HiOutlineXCircle /> Reject
        </Button>
      </div>
    );
  };

  const headerActions = (
    <div className="d-flex gap-3 align-items-center">
      <select 
        className="form-select form-select-sm" 
        style={{ width: '150px' }}
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
      </select>
      <Button variant="primary" onClick={() => navigate('/leaves/apply')} className="d-flex align-items-center gap-2">
        <HiOutlinePlus /> Apply Leave
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Leave Management" 
        subtitle={isAdminOrHR ? "Manage employee leave applications." : "Track your leave applications and balances."}
        breadcrumbs="Operations / Leaves"
      />

      {/* Leave Balances for Employees */}
      {!isAdminOrHR && balanceData && (
        <Row className="mb-4 dashboard-grid dashboard-grid-3">
          {Object.entries(balanceData).map(([type, balance]) => (
            <div key={type} className="stats-card bg-gradient-primary">
              <div className="stats-card-header">
                <div className="stats-card-icon"><HiOutlineClock /></div>
                <div className="text-uppercase small font-weight-bold opacity-75">{type} Leave</div>
              </div>
              <div className="mt-3">
                <div className="display-4 font-weight-bold mb-1">{balance.remaining}</div>
                <div className="small opacity-75">out of {balance.total} days available</div>
                <div className="small opacity-75 mt-1">Used: {balance.used} | Pending: {balance.pending}</div>
              </div>
            </div>
          ))}
        </Row>
      )}

      <DataTable
        columns={columns}
        data={data?.leaves || []}
        loading={loading}
        totalItems={data?.total || 0}
        currentPage={page}
        pageSize={10}
        onPageChange={setPage}
        actions={isAdminOrHR ? renderActions : undefined}
        headerActions={headerActions}
        emptyMessage="No leave records found."
      />

      {/* Action Confirmation Modal */}
      <ConfirmModal
        show={actionModal.show}
        onHide={() => setActionModal({ show: false, id: null, action: '' })}
        onConfirm={handleStatusAction}
        title={`${actionModal.action === 'approved' ? 'Approve' : 'Reject'} Leave Request`}
        message={`Are you sure you want to ${actionModal.action === 'approved' ? 'approve' : 'reject'} this leave request? The employee will be notified.`}
        confirmText={`Yes, ${actionModal.action === 'approved' ? 'Approve' : 'Reject'}`}
        variant={actionModal.action === 'approved' ? 'success' : 'danger'}
        loading={isProcessing}
      />
    </div>
  );
};

export default LeaveList;
