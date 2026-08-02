import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { HiOutlineClipboardCheck } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { ATTENDANCE_STATUSES } from '../../utils/constants';

const MarkAttendance = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: employees } = useFetch('/employees', { params: { limit: 1000 } });

  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    timeIn: '09:00',
    timeOut: '18:00',
    remarks: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updates = { [name]: value };
      // Auto-clear times if absent or on leave
      if (name === 'status') {
        if (['absent', 'on_leave'].includes(value)) {
          updates.timeIn = '';
          updates.timeOut = '';
        } else if (value === 'present' && !prev.timeIn) {
           updates.timeIn = '09:00';
           updates.timeOut = '18:00';
        }
      }
      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/attendance', formData);
      if (res.data.success) {
        showSuccess('Attendance marked successfully');
        navigate('/attendance');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const isTimeRequired = ['present', 'half_day', 'late'].includes(formData.status);

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Mark Attendance" 
        breadcrumbs="Operations / Attendance / Mark"
      />

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Form onSubmit={handleSubmit} className="form-section">
            <h4 className="form-section-title"><HiOutlineClipboardCheck className="icon" /> Attendance Entry</h4>
            <p className="form-section-subtitle">Record daily attendance for an employee</p>

            <FormInput 
              label="Select Employee" 
              as="select" 
              name="employeeId" 
              value={formData.employeeId} 
              onChange={handleChange} 
              required
            >
              <option value="">-- Select Employee --</option>
              {employees?.employees?.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.first_name} {emp.last_name}
                </option>
              ))}
            </FormInput>

            <Row>
              <Col sm={6}>
                <FormInput 
                  label="Date" 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required 
                  max={new Date().toISOString().split('T')[0]} 
                />
              </Col>
              <Col sm={6}>
                <FormInput 
                  label="Status" 
                  as="select" 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange} 
                  required
                >
                  {ATTENDANCE_STATUSES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </FormInput>
              </Col>
            </Row>

            <Row>
              <Col sm={6}>
                <FormInput 
                  label="Time In" 
                  type="time" 
                  name="timeIn" 
                  value={formData.timeIn} 
                  onChange={handleChange} 
                  required={isTimeRequired}
                  disabled={!isTimeRequired}
                />
              </Col>
              <Col sm={6}>
                <FormInput 
                  label="Time Out" 
                  type="time" 
                  name="timeOut" 
                  value={formData.timeOut} 
                  onChange={handleChange} 
                  required={isTimeRequired}
                  disabled={!isTimeRequired}
                />
              </Col>
            </Row>

            <FormInput 
              label="Remarks (Optional)" 
              as="textarea" 
              rows={2} 
              name="remarks" 
              value={formData.remarks} 
              onChange={handleChange} 
              placeholder="E.g., Arrived late due to traffic"
            />

            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-gray-100">
              <Button variant="ghost" onClick={() => navigate('/attendance')} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="px-4">
                {loading ? 'Saving...' : 'Save Record'}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default MarkAttendance;
