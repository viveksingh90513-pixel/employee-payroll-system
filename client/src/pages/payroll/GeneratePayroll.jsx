import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Button, Form, Card } from 'react-bootstrap';
import { HiOutlineCalculator, HiOutlineInformationCircle } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { getMonthName } from '../../utils/formatters';

const GeneratePayroll = () => {
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Default to previous month if today is early in the month, else current month
  const today = new Date();
  const defaultMonth = today.getDate() < 10 ? (today.getMonth() === 0 ? 12 : today.getMonth()) : today.getMonth() + 1;
  const defaultYear = today.getDate() < 10 && today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [formData, setFormData] = useState({
    month: defaultMonth,
    year: defaultYear,
    employeeId: '' // Optional: to generate for a single employee
  });

  const { data: employees } = useFetch('/employees', { params: { limit: 1000, status: 'active' } });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setResults(null); // Clear previous results when parameters change
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/payroll/generate', formData);
      if (res.data.success) {
        showSuccess(res.data.message || 'Payroll generated successfully');
        setResults(res.data.data); // Should contain { generatedCount, skippedCount, skippedDetails, etc. }
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: getMonthName(i + 1)
  }));

  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Generate Payroll" 
        breadcrumbs="Payroll / Generate"
      />

      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          
          <Card className="border-0 shadow-sm mb-4 bg-primary-50">
            <Card.Body className="d-flex align-items-start gap-3 p-4">
              <HiOutlineInformationCircle size={24} className="text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <h6 className="font-weight-bold text-primary-800">How it works</h6>
                <p className="text-sm text-dark mb-0">
                  This process calculates the salary for the selected month based on the employee's defined salary structure and their attendance records. 
                  If a payroll for the specific month/year already exists for an employee, it will be skipped to prevent duplication.
                </p>
              </div>
            </Card.Body>
          </Card>

          <Form onSubmit={handleGenerate} className="form-section">
            <h4 className="form-section-title"><HiOutlineCalculator className="icon" /> Payroll Parameters</h4>
            <p className="form-section-subtitle">Select the period to process salaries for.</p>

            <Row>
              <Col sm={6}>
                <FormInput label="Month" as="select" name="month" value={formData.month} onChange={handleChange} required>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </FormInput>
              </Col>
              <Col sm={6}>
                <FormInput label="Year" as="select" name="year" value={formData.year} onChange={handleChange} required>
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </FormInput>
              </Col>
            </Row>

            <FormInput label="Specific Employee (Optional)" as="select" name="employeeId" value={formData.employeeId} onChange={handleChange}>
              <option value="">-- All Active Employees --</option>
              {employees?.employees?.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.emp_code} - {emp.first_name} {emp.last_name}
                </option>
              ))}
            </FormInput>
            <Form.Text className="text-muted d-block mt-n2 mb-4">
              Leave blank to run payroll for all active employees.
            </Form.Text>

            {!results ? (
              <div className="d-flex justify-content-end gap-3 pt-3 border-top border-gray-100">
                <Button variant="ghost" onClick={() => navigate('/payroll')} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={loading} className="px-4">
                  {loading ? 'Processing...' : 'Run Payroll Engine'}
                </Button>
              </div>
            ) : (
              <div className="mt-4 pt-4 border-top border-gray-200 animate-fade-in-up">
                <div className="text-center mb-4">
                  <div className="display-4 text-success mb-2">✓</div>
                  <h4 className="font-weight-bold">Processing Complete</h4>
                </div>
                
                <Row className="text-center mb-4">
                  <Col>
                    <div className="h3 font-weight-bold text-primary mb-1">{results.generatedCount || 0}</div>
                    <div className="text-muted small text-uppercase">Generated</div>
                  </Col>
                  <Col>
                    <div className="h3 font-weight-bold text-warning mb-1">{results.skippedCount || 0}</div>
                    <div className="text-muted small text-uppercase">Skipped (Exists)</div>
                  </Col>
                  <Col>
                    <div className="h3 font-weight-bold text-danger mb-1">{results.errorsCount || 0}</div>
                    <div className="text-muted small text-uppercase">Failed (No Structure)</div>
                  </Col>
                </Row>

                <div className="d-flex justify-content-center gap-3">
                  <Button variant="outline-primary" onClick={() => setResults(null)}>
                    Run Another
                  </Button>
                  <Button variant="primary" onClick={() => navigate('/payroll')}>
                    View Payroll History
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default GeneratePayroll;
