import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Badge } from 'react-bootstrap';
import { HiOutlineDocumentText, HiOutlineCreditCard, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import { formatCurrency, getMonthName } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { exportToCSV } from '../../utils/exportUtils';

const PayrollList = () => {
  const { hasRole } = useAuth();
  const isAdminOrHR = hasRole('admin') || hasRole('hr');
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [statusModal, setStatusModal] = useState({ show: false, id: null, newStatus: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  const { data, loading, refetch } = useFetch('/payroll', {
    params: { page, limit: 10, search }
  });

  const handleExportCSV = () => {
    if (!data?.payrolls || data.payrolls.length === 0) return;
    const headers = {
      emp_code: 'Emp Code',
      employee_name: 'Employee Name',
      month: 'Month',
      year: 'Year',
      gross_pay: 'Gross Pay',
      net_pay: 'Net Pay',
      status: 'Status'
    };
    exportToCSV('Payroll_Records', data.payrolls, headers);
  };

  const handleUpdateStatus = async () => {
    try {
      setIsProcessing(true);
      const res = await api.put(`/payroll/${statusModal.id}/status`, { status: statusModal.newStatus });
      if (res.data.success) {
        showSuccess(`Payroll status updated to ${statusModal.newStatus}`);
        setStatusModal({ show: false, id: null, newStatus: '' });
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update status');
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
    { 
      header: 'Month/Year', 
      accessor: 'month',
      render: (row) => <span className="font-weight-bold">{getMonthName(row.month)} {row.year}</span>
    },
    { 
      header: 'Gross Pay', 
      accessor: 'gross_pay',
      render: (row) => formatCurrency(row.gross_pay)
    },
    { 
      header: 'Net Pay', 
      accessor: 'net_pay',
      render: (row) => <span className="font-weight-bold text-success">{formatCurrency(row.net_pay)}</span>
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
  ];

  const renderActions = (row) => (
    <div className="d-flex gap-2">
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1 px-2 d-flex align-items-center gap-1 text-primary-600 hover-bg-primary-50"
        onClick={() => navigate(`/payroll/payslip/${row.id}`)}
      >
        <HiOutlineEye /> View
      </Button>
      
      {/* Download PDF button directly calls the backend endpoint with token */}
      {row.status === 'paid' && (
        <a 
          href={`/api/payroll/${row.id}/payslip?token=${localStorage.getItem('token') || ''}`} 
          target="_blank" 
          rel="noreferrer"
          className="btn btn-sm btn-ghost p-1 px-2 d-flex align-items-center gap-1 text-success hover-bg-success-light"
        >
          <HiOutlineDownload /> PDF
        </a>
      )}

      {/* Admin actions for pending/generated payrolls */}
      {isAdminOrHR && row.status === 'generated' && (
        <Button 
          variant="outline-success" 
          size="sm" 
          className="p-1 px-2 d-flex align-items-center gap-1"
          onClick={() => setStatusModal({ show: true, id: row.id, newStatus: 'paid' })}
        >
          <HiOutlineCreditCard /> Mark Paid
        </Button>
      )}
    </div>
  );

  const headerActions = isAdminOrHR ? (
    <Button variant="primary" onClick={() => navigate('/payroll/generate')} className="d-flex align-items-center gap-2">
      <HiOutlineDocumentText /> Generate Payroll
    </Button>
  ) : null;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Payroll Records" 
        subtitle={isAdminOrHR ? "Manage monthly payroll and payslips." : "View your monthly payslips."}
        breadcrumbs="Payroll / History"
      />

      <DataTable
        columns={columns}
        data={data?.payrolls || []}
        loading={loading}
        totalItems={data?.total || 0}
        currentPage={page}
        pageSize={10}
        onPageChange={setPage}
        onSearch={isAdminOrHR ? setSearch : undefined}
        searchPlaceholder="Search by employee name..."
        actions={renderActions}
        headerActions={headerActions}
        emptyMessage="No payroll records found."
      />

      <ConfirmModal
        show={statusModal.show}
        onHide={() => setStatusModal({ show: false, id: null, newStatus: '' })}
        onConfirm={handleUpdateStatus}
        title="Confirm Payment"
        message="Are you sure you want to mark this payroll as Paid? This indicates that the salary has been successfully credited to the employee's bank account."
        confirmText="Yes, Mark as Paid"
        variant="success"
        loading={isProcessing}
      />
    </div>
  );
};

export default PayrollList;
