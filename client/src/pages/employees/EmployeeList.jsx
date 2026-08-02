import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlinePlus, HiOutlineEye, HiOutlinePencil, HiOutlineTrash, HiOutlineKey, HiOutlineBan, HiOutlineCheckCircle, HiOutlineDownload } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import CredentialsModal from '../../components/employees/CredentialsModal';
import { Button } from 'react-bootstrap';
import { formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';

const EmployeeList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const [resetCredentials, setResetCredentials] = useState(null);
  const [resettingId, setResettingId] = useState(null);
  
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const { data, loading, refetch } = useFetch('/employees', {
    params: { page, limit: 10, search }
  });

  const handleDeleteClick = (id) => {
    setDeleteModal({ show: true, id });
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      const res = await api.delete(`/employees/${deleteModal.id}`);
      if (res.data.success) {
        showSuccess('Employee deleted successfully');
        setDeleteModal({ show: false, id: null });
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = async (row) => {
    try {
      setResettingId(row.id);
      const res = await api.post(`/employees/${row.id}/reset-password`);
      if (res.data.success) {
        showSuccess(`Password reset for ${row.first_name}`);
        setResetCredentials({
          email: res.data.data.email,
          tempPassword: res.data.data.tempPassword,
          firstName: res.data.data.firstName,
          lastName: res.data.data.lastName,
          employeeId: row.id,
        });
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to reset employee password');
    } finally {
      setResettingId(null);
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await api.patch(`/employees/${row.id}/status`);
      if (res.data.success) {
        showSuccess(res.data.message || `Employee status updated.`);
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update employee status');
    }
  };

  const columns = [
    { header: 'Emp Code', accessor: 'emp_code', width: '100px', cellStyle: { fontWeight: 600, color: 'var(--primary-700)' } },
    { 
      header: 'Employee', 
      accessor: 'first_name',
      render: (row) => (
        <div className="d-flex align-items-center gap-3">
          <div className="avatar bg-gradient-primary rounded-circle d-flex align-items-center justify-content-center text-white font-weight-bold" style={{ width: '36px', height: '36px', fontSize: '14px' }}>
            {row.first_name.charAt(0)}{row.last_name?.charAt(0) || ''}
          </div>
          <div>
            <div className="font-weight-bold text-dark">{row.first_name} {row.last_name}</div>
            <div className="text-muted small">{row.email}</div>
          </div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department_name', render: (row) => row.department_name || '-' },
    { header: 'Designation', accessor: 'designation', render: (row) => row.designation || '-' },
    { header: 'Joined Date', accessor: 'date_of_joining', render: (row) => formatDate(row.date_of_joining) },
    { 
      header: 'Status', 
      accessor: 'is_active',
      render: (row) => (
        <span 
          onClick={() => handleToggleStatus(row)}
          style={{ cursor: 'pointer' }}
          title="Click to toggle status"
          className={`status-badge status-${row.is_active ? 'active' : 'inactive'}`}
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  const renderActions = (row) => (
    <div className="d-flex align-items-center gap-1">
      <button 
        className="table-action-btn text-warning" 
        title="Reset Password" 
        disabled={resettingId === row.id}
        onClick={() => handleResetPassword(row)}
      >
        <HiOutlineKey />
      </button>
      <button 
        className={`table-action-btn ${row.is_active ? 'text-secondary' : 'text-success'}`}
        title={row.is_active ? 'Deactivate Employee' : 'Activate Employee'} 
        onClick={() => handleToggleStatus(row)}
      >
        {row.is_active ? <HiOutlineBan /> : <HiOutlineCheckCircle />}
      </button>
      <button className="table-action-btn view" title="View Details" onClick={() => navigate(`/employees/view/${row.id}`)}>
        <HiOutlineEye />
      </button>
      <button className="table-action-btn edit" title="Edit Employee" onClick={() => navigate(`/employees/edit/${row.id}`)}>
        <HiOutlinePencil />
      </button>
      <button className="table-action-btn delete" title="Delete Employee" onClick={() => handleDeleteClick(row.id)}>
        <HiOutlineTrash />
      </button>
    </div>
  );

  const handleExportCSV = () => {
    if (!data?.employees || data.employees.length === 0) return;
    const headers = {
      emp_code: 'Emp Code',
      first_name: 'First Name',
      last_name: 'Last Name',
      email: 'Email',
      department_name: 'Department',
      designation: 'Designation',
      date_of_joining: 'Date of Joining',
      is_active: 'Active Status'
    };
    exportToCSV('Employees_List', data.employees, headers);
  };

  const headerActions = (
    <div className="d-flex align-items-center gap-2">
      <Button variant="outline-secondary" onClick={handleExportCSV} className="d-flex align-items-center gap-2">
        <HiOutlineDownload /> Export CSV
      </Button>
      <Button variant="primary" onClick={() => navigate('/employees/add')} className="d-flex align-items-center gap-2">
        <HiOutlinePlus /> Add Employee
      </Button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Employees" 
        subtitle="Manage your organization's workforce."
        breadcrumbs="Management / Employees"
      />

      <DataTable
        columns={columns}
        data={data?.employees || []}
        loading={loading}
        totalItems={data?.total || 0}
        currentPage={page}
        pageSize={10}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search by name, email, or code..."
        actions={renderActions}
        headerActions={headerActions}
        emptyMessage="No employees found in the directory."
      />

      <ConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This will permanently remove their user account, salary structure, and employee records."
        confirmText="Delete"
        variant="danger"
        loading={isDeleting}
      />

      <CredentialsModal
        show={!!resetCredentials}
        onHide={() => setResetCredentials(null)}
        credentials={resetCredentials}
        title="Password Reset Successfully"
      />
    </div>
  );
};

export default EmployeeList;
