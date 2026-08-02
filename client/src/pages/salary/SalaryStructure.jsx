import { useState } from 'react';
import { Row, Col, Button, Modal, Form } from 'react-bootstrap';
import { HiOutlineCash, HiOutlinePencil } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import FormInput from '../../components/common/FormInput';
import { formatCurrency } from '../../utils/formatters';

const SalaryStructure = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { showSuccess, showError } = useToast();

  const { data, loading, refetch } = useFetch('/salary', {
    params: { page, limit: 10, search }
  });

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    basic_salary: 0,
    hra: 0,
    da: 0,
    ta: 0,
    medical_allowance: 0,
    special_allowance: 0,
    pf_deduction: 0,
    esi_deduction: 0,
    tax_deduction: 0,
    professional_tax: 0,
    other_deductions: 0
  });

  const handleEdit = async (row) => {
    try {
      // Fetch full details if needed, or use row data
      const res = await api.get(`/salary/${row.employee_id}`);
      if (res.data.success && res.data.data) {
        setFormData({
          ...res.data.data,
          // Handle nulls
          basic_salary: res.data.data.basic_salary || 0,
          hra: res.data.data.hra || 0,
          da: res.data.data.da || 0,
          ta: res.data.data.ta || 0,
          medical_allowance: res.data.data.medical_allowance || 0,
          special_allowance: res.data.data.special_allowance || 0,
          pf_deduction: res.data.data.pf_deduction || 0,
          esi_deduction: res.data.data.esi_deduction || 0,
          tax_deduction: res.data.data.tax_deduction || 0,
          professional_tax: res.data.data.professional_tax || 0,
          other_deductions: res.data.data.other_deductions || 0,
        });
        setShowModal(true);
      } else {
        // Init empty structure for employee if not exists
        setFormData({
          employee_id: row.employee_id,
          basic_salary: 0, hra: 0, da: 0, ta: 0, medical_allowance: 0, special_allowance: 0,
          pf_deduction: 0, esi_deduction: 0, tax_deduction: 0, professional_tax: 0, other_deductions: 0
        });
        setShowModal(true);
      }
    } catch (err) {
      showError('Failed to fetch salary details');
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value === '' ? 0 : Number(value) }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const res = await api.put(`/salary/${formData.employee_id}`, formData);
      if (res.data.success) {
        showSuccess('Salary structure updated successfully');
        setShowModal(false);
        refetch();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update salary structure');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { 
      header: 'Employee', 
      accessor: 'employee_name',
      render: (row) => (
        <div>
          <div className="font-weight-bold">{row.first_name} {row.last_name}</div>
          <div className="small text-muted">{row.emp_code}</div>
        </div>
      )
    },
    { header: 'Department', accessor: 'department_name' },
    { 
      header: 'Basic Salary', 
      accessor: 'basic_salary',
      render: (row) => row.basic_salary ? formatCurrency(row.basic_salary) : <span className="text-muted">Not Set</span>
    },
    { 
      header: 'Gross Salary', 
      accessor: 'gross_salary',
      render: (row) => <span className="font-weight-bold text-primary-700">{row.gross_salary ? formatCurrency(row.gross_salary) : '-'}</span>
    },
    { 
      header: 'Net Salary (Est)', 
      accessor: 'net_salary',
      render: (row) => <span className="font-weight-bold text-success">{row.net_salary ? formatCurrency(row.net_salary) : '-'}</span>
    },
    {
      header: 'Last Updated',
      accessor: 'updated_at',
      render: (row) => row.updated_at ? new Date(row.updated_at).toLocaleDateString() : '-'
    }
  ];

  const renderActions = (row) => (
    <Button 
      variant="outline-primary" 
      size="sm" 
      className="d-flex align-items-center gap-1"
      onClick={() => handleEdit(row)}
    >
      <HiOutlinePencil /> {row.basic_salary ? 'Edit' : 'Setup'}
    </Button>
  );

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Salary Structures" 
        subtitle="Manage employee compensation, allowances, and deductions."
        breadcrumbs="Payroll / Salary Structure"
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
        searchPlaceholder="Search by name or code..."
        actions={renderActions}
      />

      <Modal show={showModal} onHide={() => !isSubmitting && setShowModal(false)} size="lg" centered>
        <Form onSubmit={handleFormSubmit}>
          <Modal.Header closeButton={!isSubmitting}>
            <Modal.Title className="d-flex align-items-center gap-2">
              <HiOutlineCash className="text-primary" /> Update Salary Structure
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-gray-50">
            <Row>
              <Col md={6}>
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100 mb-3">
                  <h6 className="font-weight-bold text-primary mb-3 border-bottom pb-2">Earnings / Allowances</h6>
                  <FormInput label="Basic Salary (₹)" type="number" name="basic_salary" value={formData.basic_salary} onChange={handleFormChange} min="0" step="0.01" required />
                  <FormInput label="HRA (₹)" type="number" name="hra" value={formData.hra} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Dearness Allowance (DA) (₹)" type="number" name="da" value={formData.da} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Travel Allowance (TA) (₹)" type="number" name="ta" value={formData.ta} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Medical Allowance (₹)" type="number" name="medical_allowance" value={formData.medical_allowance} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Special Allowance (₹)" type="number" name="special_allowance" value={formData.special_allowance} onChange={handleFormChange} min="0" step="0.01" />
                </div>
              </Col>
              <Col md={6}>
                <div className="bg-white p-3 rounded shadow-sm border border-gray-100 mb-3">
                  <h6 className="font-weight-bold text-danger mb-3 border-bottom pb-2">Deductions</h6>
                  <FormInput label="PF Deduction (₹)" type="number" name="pf_deduction" value={formData.pf_deduction} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="ESI Deduction (₹)" type="number" name="esi_deduction" value={formData.esi_deduction} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Tax Deduction/TDS (₹)" type="number" name="tax_deduction" value={formData.tax_deduction} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Professional Tax (₹)" type="number" name="professional_tax" value={formData.professional_tax} onChange={handleFormChange} min="0" step="0.01" />
                  <FormInput label="Other Deductions (₹)" type="number" name="other_deductions" value={formData.other_deductions} onChange={handleFormChange} min="0" step="0.01" />
                </div>
              </Col>
            </Row>
            
            {/* Real-time Estimate (Uses generated column logic roughly) */}
            <div className="salary-breakdown mt-2">
              <h6 className="salary-breakdown-title">Estimated Monthly Calculation</h6>
              <div className="salary-breakdown-item">
                <span className="label">Total Gross Salary</span>
                <span className="value">₹{(
                  Number(formData.basic_salary) + Number(formData.hra) + Number(formData.da) + 
                  Number(formData.ta) + Number(formData.medical_allowance) + Number(formData.special_allowance)
                ).toFixed(2)}</span>
              </div>
              <div className="salary-breakdown-item">
                <span className="label">Total Deductions</span>
                <span className="value negative">-₹{(
                  Number(formData.pf_deduction) + Number(formData.esi_deduction) + 
                  Number(formData.tax_deduction) + Number(formData.professional_tax) + Number(formData.other_deductions)
                ).toFixed(2)}</span>
              </div>
              <div className="salary-breakdown-item total">
                <span className="label">Estimated Net Salary</span>
                <span className="value text-success">₹{(
                  (Number(formData.basic_salary) + Number(formData.hra) + Number(formData.da) + Number(formData.ta) + Number(formData.medical_allowance) + Number(formData.special_allowance)) -
                  (Number(formData.pf_deduction) + Number(formData.esi_deduction) + Number(formData.tax_deduction) + Number(formData.professional_tax) + Number(formData.other_deductions))
                ).toFixed(2)}</span>
              </div>
            </div>

          </Modal.Body>
          <Modal.Footer>
            <Button variant="ghost" onClick={() => setShowModal(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Structure'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default SalaryStructure;
