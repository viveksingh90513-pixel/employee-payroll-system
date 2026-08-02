import { useState, useEffect } from 'react';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';
import { Modal, Button, Form } from 'react-bootstrap';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ConfirmModal from '../../components/common/ConfirmModal';
import FormInput from '../../components/common/FormInput';
import { formatDate } from '../../utils/formatters';

const DepartmentList = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [showFormModal, setShowFormModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({ id: null, name: '', description: '' });

  const { showSuccess, showError } = useToast();
  const { data, loading, refetch } = useFetch('/departments', {
    params: { page, limit: 10, search }
  });

  const handleOpenForm = (dept = null) => {
    if (dept) {
      setFormData({ id: dept.id, name: dept.name, description: dept.description || '' });
    } else {
      setFormData({ id: null, name: '', description: '' });
    }
    setShowFormModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      if (formData.id) {
        // Update
        await api.put(`/departments/${formData.id}`, { 
          name: formData.name, 
          description: formData.description 
        });
        showSuccess('Department updated successfully');
      } else {
        // Create
        await api.post('/departments', { 
          name: formData.name, 
          description: formData.description 
        });
        showSuccess('Department created successfully');
      }
      setShowFormModal(false);
      refetch();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save department');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      setIsSubmitting(true);
      await api.delete(`/departments/${deleteModal.id}`);
      showSuccess('Department deleted successfully');
      setDeleteModal({ show: false, id: null });
      refetch();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to delete department. It may have employees assigned.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Department Name', accessor: 'name', cellStyle: { fontWeight: 600, color: 'var(--gray-900)' } },
    { header: 'Description', accessor: 'description', render: (row) => row.description || '-' },
    { 
      header: 'Employees', 
      accessor: 'employee_count',
      render: (row) => (
        <span className="badge bg-primary-50 text-primary-600 px-3 py-2 rounded-pill">
          {row.employee_count || 0} Members
        </span>
      )
    },
    { header: 'Created On', accessor: 'created_at', render: (row) => formatDate(row.created_at) },
  ];

  const renderActions = (row) => (
    <>
      <button className="table-action-btn edit" title="Edit Department" onClick={() => handleOpenForm(row)}>
        <HiOutlinePencil />
      </button>
      <button className="table-action-btn delete" title="Delete Department" onClick={() => setDeleteModal({ show: true, id: row.id })}>
        <HiOutlineTrash />
      </button>
    </>
  );

  const headerActions = (
    <Button variant="primary" onClick={() => handleOpenForm()} className="d-flex align-items-center gap-2">
      <HiOutlinePlus /> Add Department
    </Button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Departments" 
        subtitle="Manage company departments and view employee distribution."
        breadcrumbs="Management / Departments"
      />

      <DataTable
        columns={columns}
        data={data?.departments || []}
        loading={loading}
        totalItems={data?.total || 0}
        currentPage={page}
        pageSize={10}
        onPageChange={setPage}
        onSearch={setSearch}
        searchPlaceholder="Search departments..."
        actions={renderActions}
        headerActions={headerActions}
        emptyMessage="No departments found."
      />

      {/* Add/Edit Department Modal */}
      <Modal show={showFormModal} onHide={() => !isSubmitting && setShowFormModal(false)} centered>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title>{formData.id ? 'Edit Department' : 'Add New Department'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FormInput
              label="Department Name"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g. Human Resources"
              required
            />
            <FormInput
              label="Description (Optional)"
              as="textarea"
              rows={3}
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the department's function"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setShowFormModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : formData.id ? 'Update Department' : 'Create Department'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={deleteModal.show}
        onHide={() => setDeleteModal({ show: false, id: null })}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message="Are you sure you want to delete this department? This action will fail if there are active employees assigned to it."
        confirmText="Yes, Delete"
        loading={isSubmitting}
      />
    </div>
  );
};

export default DepartmentList;
