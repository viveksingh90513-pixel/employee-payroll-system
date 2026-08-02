import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { 
  HiOutlineUser, 
  HiOutlineOfficeBuilding, 
  HiOutlineCreditCard
} from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { EMPLOYMENT_TYPES, GENDER_OPTIONS } from '../../utils/constants';
import { formatDate } from '../../utils/formatters';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: departments } = useFetch('/departments/active');
  const { data: employeeData, loading: fetchingEmployee } = useFetch(`/employees/${id}`);

  const [formData, setFormData] = useState({
    firstName: '', lastName: '', phone: '', dob: '', gender: '',
    address: '', city: '', state: '', zipCode: '',
    departmentId: '', designation: '', dateOfJoining: '', employmentType: '',
    emergencyContactName: '', emergencyContactPhone: '',
    bankName: '', bankAccountNo: '', ifscCode: '', panNumber: '',
  });

  useEffect(() => {
    if (employeeData) {
      setFormData({
        firstName: employeeData.first_name || '',
        lastName: employeeData.last_name || '',
        phone: employeeData.phone || '',
        dob: employeeData.dob ? employeeData.dob.split('T')[0] : '',
        gender: employeeData.gender || '',
        address: employeeData.address || '',
        city: employeeData.city || '',
        state: employeeData.state || '',
        zipCode: employeeData.zip_code || '',
        departmentId: employeeData.department_id || '',
        designation: employeeData.designation || '',
        dateOfJoining: employeeData.date_of_joining ? employeeData.date_of_joining.split('T')[0] : '',
        employmentType: employeeData.employment_type || '',
        emergencyContactName: employeeData.emergency_contact_name || '',
        emergencyContactPhone: employeeData.emergency_contact_phone || '',
        bankName: employeeData.bank_name || '',
        bankAccountNo: employeeData.bank_account_no || '',
        ifscCode: employeeData.ifsc_code || '',
        panNumber: employeeData.pan_number || '',
      });
    }
  }, [employeeData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put(`/employees/${id}`, formData);
      if (res.data.success) {
        showSuccess('Employee updated successfully');
        navigate('/employees');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update employee');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingEmployee) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title={`Edit Employee: ${employeeData?.first_name} ${employeeData?.last_name}`} 
        breadcrumbs="Management / Employees / Edit"
      />

      <Form onSubmit={handleSubmit}>
        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineUser className="icon" /> Personal Details</h4>
          <Row>
            <Col md={6}><FormInput label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} required /></Col>
            <Col md={6}><FormInput label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} required /></Col>
            <Col md={6}><FormInput label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} /></Col>
            <Col md={6}><FormInput label="Date of Birth" type="date" name="dob" value={formData.dob} onChange={handleChange} /></Col>
            <Col md={6}>
              <FormInput label="Gender" as="select" name="gender" value={formData.gender} onChange={handleChange}>
                <option value="">Select Gender</option>
                {GENDER_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
            </Col>
          </Row>
          <hr className="my-4 border-gray-100" />
          <Row>
            <Col md={12}><FormInput label="Address" as="textarea" rows={2} name="address" value={formData.address} onChange={handleChange} /></Col>
            <Col md={4}><FormInput label="City" name="city" value={formData.city} onChange={handleChange} /></Col>
            <Col md={4}><FormInput label="State" name="state" value={formData.state} onChange={handleChange} /></Col>
            <Col md={4}><FormInput label="Zip Code" name="zipCode" value={formData.zipCode} onChange={handleChange} /></Col>
          </Row>
          <hr className="my-4 border-gray-100" />
          <Row>
            <Col md={6}><FormInput label="Emergency Contact Name" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} /></Col>
            <Col md={6}><FormInput label="Emergency Contact Phone" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} /></Col>
          </Row>
        </div>

        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineOfficeBuilding className="icon" /> Employment Details</h4>
          <Row>
            <Col md={6}>
              <FormInput label="Department" as="select" name="departmentId" value={formData.departmentId} onChange={handleChange} required>
                <option value="">Select Department</option>
                {departments?.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
              </FormInput>
            </Col>
            <Col md={6}><FormInput label="Designation" name="designation" value={formData.designation} onChange={handleChange} required /></Col>
            <Col md={6}><FormInput label="Date of Joining" type="date" name="dateOfJoining" value={formData.dateOfJoining} onChange={handleChange} required /></Col>
            <Col md={6}>
              <FormInput label="Employment Type" as="select" name="employmentType" value={formData.employmentType} onChange={handleChange} required>
                {EMPLOYMENT_TYPES.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </FormInput>
            </Col>
          </Row>
        </div>

        <div className="form-section">
          <h4 className="form-section-title"><HiOutlineCreditCard className="icon" /> Bank Details</h4>
          <Row>
            <Col md={6}><FormInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} /></Col>
            <Col md={6}><FormInput label="Account Number" name="bankAccountNo" value={formData.bankAccountNo} onChange={handleChange} /></Col>
            <Col md={6}><FormInput label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} /></Col>
            <Col md={6}><FormInput label="PAN Number" name="panNumber" value={formData.panNumber} onChange={handleChange} /></Col>
          </Row>
        </div>

        <div className="d-flex justify-content-end gap-3 mb-5">
          <Button variant="ghost" onClick={() => navigate('/employees')} disabled={loading}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={loading} className="px-4">
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditEmployee;
