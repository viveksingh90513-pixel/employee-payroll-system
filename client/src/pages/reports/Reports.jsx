import { useState } from 'react';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
import { HiOutlineDownload, HiOutlineChartPie } from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import api from '../../api/axios';
import useToast from '../../hooks/useToast';
import PageHeader from '../../components/common/PageHeader';
import FormInput from '../../components/common/FormInput';
import { getMonthName } from '../../utils/formatters';

const Reports = () => {
  const { showSuccess, showError } = useToast();
  const [downloading, setDownloading] = useState({ payroll: false, attendance: false });

  // Default to previous month if today is early in the month, else current month
  const today = new Date();
  const defaultMonth = today.getDate() < 10 ? (today.getMonth() === 0 ? 12 : today.getMonth()) : today.getMonth() + 1;
  const defaultYear = today.getDate() < 10 && today.getMonth() === 0 ? today.getFullYear() - 1 : today.getFullYear();

  const [reportParams, setReportParams] = useState({
    month: defaultMonth,
    year: defaultYear
  });

  const { data: summary, loading } = useFetch('/reports/summary', {
    params: reportParams
  });

  const handleParamChange = (e) => {
    const { name, value } = e.target;
    setReportParams(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleDownload = async (type) => {
    try {
      setDownloading(prev => ({ ...prev, [type]: true }));
      
      const endpoint = type === 'payroll' ? '/reports/payroll/export' : '/reports/attendance/export';
      
      // Axios request with responseType blob for file download
      const response = await api.get(endpoint, {
        params: reportParams,
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_report_${getMonthName(reportParams.month)}_${reportParams.year}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      showSuccess(`${type} report downloaded successfully`);
    } catch (err) {
      showError(`Failed to download ${type} report`);
    } finally {
      setDownloading(prev => ({ ...prev, [type]: false }));
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
        title="Reports & Exports" 
        breadcrumbs="Analytics / Reports"
      />

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4 bg-gray-50 border-bottom">
          <Row className="align-items-end">
            <Col md={4}>
              <FormInput label="Report Month" as="select" name="month" value={reportParams.month} onChange={handleParamChange}>
                {months.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </FormInput>
            </Col>
            <Col md={4}>
              <FormInput label="Report Year" as="select" name="year" value={reportParams.year} onChange={handleParamChange}>
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </FormInput>
            </Col>
            <Col md={4} className="mb-3">
              <Button variant="primary" className="w-100 d-flex align-items-center justify-content-center gap-2" disabled={loading}>
                <HiOutlineChartPie /> Refresh Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
        <Card.Body className="p-4">
          <h5 className="font-weight-bold mb-4">Summary for {getMonthName(reportParams.month)} {reportParams.year}</h5>
          
          {loading ? (
            <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
          ) : (
            <Row className="mb-5">
              <Col md={3}>
                <div className="p-3 border rounded border-gray-200 text-center">
                  <div className="text-muted small text-uppercase font-weight-bold mb-1">Total Payroll</div>
                  <div className="h4 text-primary font-weight-bold mb-0">₹{(summary?.payrollTotal / 1000 || 0).toFixed(1)}k</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 border rounded border-gray-200 text-center">
                  <div className="text-muted small text-uppercase font-weight-bold mb-1">Avg Attendance</div>
                  <div className="h4 text-success font-weight-bold mb-0">{summary?.avgAttendance || 0}%</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 border rounded border-gray-200 text-center">
                  <div className="text-muted small text-uppercase font-weight-bold mb-1">Leaves Taken</div>
                  <div className="h4 text-warning font-weight-bold mb-0">{summary?.totalLeaves || 0}</div>
                </div>
              </Col>
              <Col md={3}>
                <div className="p-3 border rounded border-gray-200 text-center">
                  <div className="text-muted small text-uppercase font-weight-bold mb-1">New Hires</div>
                  <div className="h4 text-info font-weight-bold mb-0">{summary?.newHires || 0}</div>
                </div>
              </Col>
            </Row>
          )}

          <h5 className="font-weight-bold mb-4">Available Exports</h5>
          <Row>
            <Col md={6} className="mb-3">
              <div className="p-4 border rounded border-gray-200 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="font-weight-bold mb-1">Payroll Register</h6>
                  <p className="text-muted small mb-0">Detailed breakdown of gross pay, deductions, and net pay for all employees.</p>
                </div>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleDownload('payroll')}
                  disabled={downloading.payroll}
                >
                  {downloading.payroll ? 'Downloading...' : <><HiOutlineDownload /> Export CSV</>}
                </Button>
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="p-4 border rounded border-gray-200 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="font-weight-bold mb-1">Attendance Log</h6>
                  <p className="text-muted small mb-0">Daily attendance status, time-ins, time-outs, and accumulated hours.</p>
                </div>
                <Button 
                  variant="outline-primary" 
                  onClick={() => handleDownload('attendance')}
                  disabled={downloading.attendance}
                >
                  {downloading.attendance ? 'Downloading...' : <><HiOutlineDownload /> Export CSV</>}
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Reports;
