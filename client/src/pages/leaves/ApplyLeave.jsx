import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import { HiOutlineCalendar, HiOutlineInformationCircle } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { LEAVE_TYPES } from '../../utils/constants';

const ApplyLeave = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [days, setDays] = useState(0);

  const { data: balanceData } = useFetch('/leaves/balance');

  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Calculate days difference when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        // Simple calculation inclusive of start and end
        // In a real app, you might want to exclude weekends/holidays here
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDays(diffDays);
      } else {
        setDays(0);
      }
    } else {
      setDays(0);
    }
  }, [formData.startDate, formData.endDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      return showError('End date cannot be before start date');
    }

    if (days <= 0) {
      return showError('Invalid date range');
    }

    try {
      setLoading(true);
      const res = await api.post('/leaves', formData);
      if (res.data.success) {
        showSuccess('Leave application submitted successfully');
        navigate('/leaves');
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  // Get selected leave type balance
  const selectedBalance = formData.leaveType && balanceData ? balanceData[formData.leaveType] : null;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Apply for Leave" 
        breadcrumbs="Operations / Leaves / Apply"
      />

      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {selectedBalance && (
            <Card className={`mb-4 border-0 shadow-sm bg-${selectedBalance.remaining < days ? 'danger' : 'primary'}-50`}>
              <Card.Body className="d-flex align-items-start gap-3 p-3">
                <HiOutlineInformationCircle size={24} className={`text-${selectedBalance.remaining < days ? 'danger' : 'primary'}-600 mt-1`} />
                <div>
                  <h6 className={`mb-1 font-weight-bold text-${selectedBalance.remaining < days ? 'danger' : 'primary'}-700`}>
                    Balance Check
                  </h6>
                  <p className="mb-0 text-sm text-dark">
                    You are requesting <strong>{days}</strong> days of {formData.leaveType} leave. 
                    You currently have <strong>{selectedBalance.remaining}</strong> days remaining.
                    {selectedBalance.remaining < days && (
                      <span className="text-danger d-block mt-1 font-weight-bold">
                        Warning: You do not have enough balance. This request may be rejected or processed as Unpaid Leave.
                      </span>
                    )}
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}

          <Form onSubmit={handleSubmit} className="form-section">
            <h4 className="form-section-title"><HiOutlineCalendar className="icon" /> Leave Application</h4>
            <p className="form-section-subtitle">Fill out the details below to request time off.</p>

            <FormInput 
              label="Leave Type" 
              as="select" 
              name="leaveType" 
              value={formData.leaveType} 
              onChange={handleChange} 
              required
            >
              <option value="">-- Select Leave Type --</option>
              {LEAVE_TYPES.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </FormInput>

            <Row>
              <Col sm={6}>
                <FormInput 
                  label="Start Date" 
                  type="date" 
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  required
                  min={new Date().toISOString().split('T')[0]} // Prevent past dates mostly
                />
              </Col>
              <Col sm={6}>
                <FormInput 
                  label="End Date" 
                  type="date" 
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  required
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                />
              </Col>
            </Row>

            {days > 0 && (
              <div className="mb-3 p-2 bg-gray-50 rounded text-center font-weight-bold text-primary-700 border border-gray-200">
                Total Duration: {days} Day(s)
              </div>
            )}

            <FormInput 
              label="Reason for Leave" 
              as="textarea" 
              rows={4} 
              name="reason" 
              value={formData.reason} 
              onChange={handleChange} 
              required
              placeholder="Please provide a brief reason for your leave request..."
            />

            <div className="d-flex justify-content-end gap-3 mt-4 pt-3 border-top border-gray-100">
              <Button variant="ghost" onClick={() => navigate('/leaves')} disabled={loading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={loading} className="px-4">
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ApplyLeave;
