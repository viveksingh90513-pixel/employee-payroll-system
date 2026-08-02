import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { 
  HiOutlineUser, 
  HiOutlineOfficeBuilding, 
  HiOutlineCash,
  HiOutlineCreditCard
} from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { EMPLOYMENT_TYPES, GENDER_OPTIONS } from '../../utils/constants';

import CredentialsModal from '../../components/employees/CredentialsModal';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [fieldErrors, setFieldErrors] = useState([]);

  // Fetch departments for dropdown
  const { data: departments } = useFetch('/departments/active');

  // Form State
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    empCode: '',
    dob: '',
    gender: '',
    // Employment Info
    departmentId: '',
    designation: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    employmentType: 'full-time',
    // Salary Info
    basicSalary: '',
    hra: '',
    da: '',
    ta: '',
    medicalAllowance: '',
    specialAllowance: '',
    pfDeduction: '',
    esiDeduction: '',
    taxDeduction: '',
    professionalTax: '',
    otherDeductions: '',
    // Bank Info
    bankName: '',
    bankAccountNo: '',
    ifscCode: '',
    panNumber: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors([]);
    try {
      setLoading(true);
      const res = await api.post('/employees', formData);
      if (res.data.success) {
        showSuccess('Employee created successfully');
        const data = res.data.data;
        setCreatedCredentials({
          email: formData.email,
          tempPassword: data.tempPassword || formData.password || 'Admin@123',
          firstName: formData.firstName,
          lastName: formData.lastName,
          employeeId: data.employee?.id,
        });
      }
    } catch (err) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        setFieldErrors(err.response.data.errors);
        showError(err.response.data.message || 'Validation failed. Please check your input.');
      } else {
        showError(err.response?.data?.message || 'Failed to create employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Add New Employee" 
        breadcrumbs="Management / Employees / Add"
      />

      {fieldErrors.length > 0 && (
        <Alert variant="danger" className="mb-4 shadow-sm rounded-3">
          <Alert.Heading className="fs-6 font-weight-bold mb-2">Please fix the following validation errors:</Alert.Heading>
          <ul className="mb-0 ps-3 small">
            {fieldErrors.map((err, idx) => (
              <li key={idx}><strong>{err.field}:</strong> {err.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        {/* Personal Details Section */}
        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineUser className="icon" /> Personal Details</h4>
          <p className="form-section-subtitle">Basic personal information and contact details</p>
          
          <Row>
            <Col md={6}>
              <FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <FormInput label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <FormInput label="Temporary / Default Password (Optional)" type="text" name="password" value={formData.password} onChange={handleChange} placeholder="Leave blank to auto-generate" />
            </Col>
            <Col md={6}>
              <FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} />
            </Col>
            <Col md={6}>
              <FormInput label="Employee ID / Code (Optional)" name="empCode" value={formData.empCode} onChange={handleChange} placeholder="Auto-generated if left blank (e.g. EMP005)" />
            </Col>
            <Col md={6}>
              <FormInput label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} />
            </Col>
            <Col md={6}>
              <FormInput label="Gender" as="select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
            </Col>
          </Row>
        </div>

        {/* Employment Details Section */}
        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineOfficeBuilding className="icon" /> Employment Details</h4>
          <p className="form-section-subtitle">Job role, department, and joining information</p>

          <Row>
            <Col md={6}>
              <FormInput label="Department" as="select" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments?.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </FormInput>
            </Col>
            <Col md={6}>
              <FormInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <FormInput label="Date of Joining" type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required />
            </Col>
            <Col md={6}>
              <FormInput label="Employment Type" as="select" name="employmentType" value={formData.employmentType} onChange={handleChange} required>
                {EMPLOYMENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
            </Col>
          </Row>
        </div>

        {/* Bank Details Section */}
        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineCreditCard className="icon" /> Bank & Statutory Details</h4>
          <p className="form-section-subtitle">Bank account and tax identification numbers</p>

          <Row>
            <Col md={6}>
              <FormInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
            </Col>
            <Col md={6}>
              <FormInput label="Account Number" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} />
            </Col>
            <Col md={6}>
              <FormInput label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            </Col>
            <Col md={6}>
              <FormInput label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} />
            </Col>
          </Row>
        </div>

        {/* Salary Details Section */}
        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineCash className="icon" /> Initial Salary Structure (Optional)</h4>
          <p className="form-section-subtitle">You can set this up later from the Salary module</p>

          <Row>
            <Col md={6}>
              <h6 className="font-weight-bold text-primary mb-3">Earnings</h6>
              <FormInput label="Basic Salary (₹)" type="number" name="basicSalary" value={formData.basicSalary} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="HRA (₹)" type="number" name="hra" value={formData.hra} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="Dearness Allowance (₹)" type="number" name="da" value={formData.da} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="Special Allowance (₹)" type="number" name="specialAllowance" value={formData.specialAllowance} onChange={handleChange} min="0" step="0.01" />
            </Col>
            <Col md={6}>
              <h6 className="font-weight-bold text-danger mb-3">Deductions</h6>
              <FormInput label="PF Deduction (₹)" type="number" name="pfDeduction" value={formData.pfDeduction} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="ESI Deduction (₹)" type="number" name="esiDeduction" value={formData.esiDeduction} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="Tax Deduction/TDS (₹)" type="number" name="taxDeduction" value={formData.taxDeduction} onChange={handleChange} min="0" step="0.01" />
              <FormInput label="Professional Tax (₹)" type="number" name="professionalTax" value={formData.professionalTax} onChange={handleChange} min="0" step="0.01" />
            </Col>
          </Row>
        </div>

        {/* Actions */}
        <div className="d-flex justify-content-end gap-3 mb-5">
          <Button variant="ghost" onClick={() => navigate('/employees')} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4">
            {loading ? 'Creating...' : 'Save Employee'}
          </Button>
        </div>
      </Form>

      {/* Credentials Success Modal */}
      <CredentialsModal
        show={!!createdCredentials}
        onHide={() => {
          setCreatedCredentials(null);
          navigate('/employees');
        }}
        credentials={createdCredentials}
        title="Employee Created Successfully"
      />
    </div>
  );
};

export default AddEmployee;
