import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { HiOutlineDownload, HiOutlineArrowLeft, HiOutlinePrinter } from 'react-icons/hi';
import api from '../../api/axios';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatCurrency, getMonthName } from '../../utils/formatters';

const ViewPayslip = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: payslip, loading } = useFetch(`/payroll/${id}`);

  const [downloading, setDownloading] = useState(false);

  if (loading) return <LoadingSpinner fullPage />;
  if (!payslip) return <div className="text-center p-5">Payslip not found</div>;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    try {
      setDownloading(true);
      const res = await api.get(`/payroll/${id}/payslip`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${payslip.emp_code || 'payroll'}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      // Fallback: direct window open with query token
      const token = localStorage.getItem('token');
      window.open(`/api/payroll/${id}/payslip?token=${token}`, '_blank');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in pb-5">
      <div className="d-print-none">
        <PageHeader 
          title="View Payslip" 
          breadcrumbs="Payroll / History / Payslip"
          action={
            <div className="d-flex gap-2">
              <Button variant="ghost" onClick={() => navigate(-1)} className="d-flex align-items-center gap-2">
                <HiOutlineArrowLeft /> Back
              </Button>
              <Button variant="outline-primary" onClick={handlePrint} className="d-flex align-items-center gap-2">
                <HiOutlinePrinter /> Print
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDownloadPDF} 
                disabled={downloading}
                className="d-flex align-items-center gap-2"
              >
                <HiOutlineDownload /> {downloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          }
        />
      </div>

      <Row className="justify-content-center">
        <Col lg={10} xl={8}>
          <Card className="border-0 shadow-sm payslip-container" style={{ minHeight: '800px' }}>
            <Card.Body className="p-5">
              
              {/* Header */}
              <div className="text-center mb-5 pb-4 border-bottom">
                <h2 className="font-weight-bold text-primary-800 mb-1">PayRoll Pro Inc.</h2>
                <p className="text-muted mb-3">123 Business Avenue, Tech District, City - 10001</p>
                <h4 className="font-weight-bold text-uppercase border bg-gray-50 d-inline-block px-4 py-2 rounded">
                  Payslip for {getMonthName(payslip.month)} {payslip.year}
                </h4>
              </div>

              {/* Employee Summary */}
              <Row className="mb-4 bg-gray-50 p-3 rounded mx-0">
                <Col sm={6}>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>Employee Name:</span> <strong className="text-dark">{payslip.employee_name}</strong></div>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>Employee Code:</span> <strong className="text-dark">{payslip.emp_code}</strong></div>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>Designation:</span> <strong className="text-dark">{payslip.designation}</strong></div>
                  <div><span className="text-muted d-inline-block" style={{ width: '120px' }}>Department:</span> <strong className="text-dark">{payslip.department}</strong></div>
                </Col>
                <Col sm={6}>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>Bank Name:</span> <strong className="text-dark">{payslip.bank_name || '-'}</strong></div>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>A/C No:</span> <strong className="text-dark">{payslip.bank_account_no || '-'}</strong></div>
                  <div className="mb-2"><span className="text-muted d-inline-block" style={{ width: '120px' }}>PAN No:</span> <strong className="text-dark">{payslip.pan_number || '-'}</strong></div>
                  <div><span className="text-muted d-inline-block" style={{ width: '120px' }}>Pay Date:</span> <strong className="text-dark">{new Date(payslip.created_at).toLocaleDateString()}</strong></div>
                </Col>
              </Row>

              {/* Attendance Summary */}
              <div className="mb-4 px-3">
                <h6 className="font-weight-bold text-primary-700 mb-3 border-bottom pb-2">Attendance Details</h6>
                <Row>
                  <Col sm={4}><div className="mb-2"><span className="text-muted">Total Working Days:</span> <strong>{payslip.working_days}</strong></div></Col>
                  <Col sm={4}><div className="mb-2"><span className="text-muted">Days Present:</span> <strong>{payslip.present_days}</strong></div></Col>
                  <Col sm={4}><div><span className="text-muted">Half Days:</span> <strong>{payslip.half_days}</strong></div></Col>
                </Row>
              </div>

              {/* Earnings & Deductions */}
              <Row className="mb-5">
                <Col sm={6} className="pr-sm-0">
                  <div className="border h-100 rounded-left border-right-0">
                    <div className="bg-gray-50 p-2 border-bottom font-weight-bold text-center">EARNINGS</div>
                    <div className="p-3">
                      <div className="d-flex justify-content-between mb-2"><span>Basic Salary</span> <span>{formatCurrency(payslip.basic_salary)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>House Rent Allowance</span> <span>{formatCurrency(payslip.hra)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Dearness Allowance</span> <span>{formatCurrency(payslip.da)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Travel Allowance</span> <span>{formatCurrency(payslip.ta)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Medical Allowance</span> <span>{formatCurrency(payslip.medical_allowance)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Special Allowance</span> <span>{formatCurrency(payslip.special_allowance)}</span></div>
                    </div>
                  </div>
                </Col>
                <Col sm={6} className="pl-sm-0">
                  <div className="border h-100 rounded-right">
                    <div className="bg-gray-50 p-2 border-bottom font-weight-bold text-center border-left">DEDUCTIONS</div>
                    <div className="p-3">
                      <div className="d-flex justify-content-between mb-2"><span>PF Deduction</span> <span>{formatCurrency(payslip.pf_deduction)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>ESI Deduction</span> <span>{formatCurrency(payslip.esi_deduction)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Tax (TDS)</span> <span>{formatCurrency(payslip.tax_deduction)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Professional Tax</span> <span>{formatCurrency(payslip.professional_tax)}</span></div>
                      <div className="d-flex justify-content-between mb-2"><span>Other Deductions</span> <span>{formatCurrency(payslip.other_deductions)}</span></div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Totals */}
              <Row className="border rounded bg-gray-50 mx-0 mb-5 align-items-center">
                <Col sm={4} className="p-3 text-center border-right">
                  <div className="text-muted small font-weight-bold text-uppercase mb-1">Total Earnings</div>
                  <div className="h4 mb-0 text-primary-700 font-weight-bold">{formatCurrency(payslip.gross_pay)}</div>
                </Col>
                <Col sm={4} className="p-3 text-center border-right">
                  <div className="text-muted small font-weight-bold text-uppercase mb-1">Total Deductions</div>
                  <div className="h4 mb-0 text-danger font-weight-bold">{formatCurrency(payslip.total_deductions)}</div>
                </Col>
                <Col sm={4} className="p-3 text-center">
                  <div className="text-muted small font-weight-bold text-uppercase mb-1">Net Pay</div>
                  <div className="h3 mb-0 text-success font-weight-bold">{formatCurrency(payslip.net_pay)}</div>
                </Col>
              </Row>

              {/* Footer */}
              <div className="text-center text-muted small mt-5 pt-4 border-top">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>Status: <span className="font-weight-bold text-uppercase">{payslip.status}</span></p>
              </div>

            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .payslip-container, .payslip-container * { visibility: visible; }
          .payslip-container { position: absolute; left: 0; top: 0; width: 100%; box-shadow: none !important; }
          .d-print-none { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ViewPayslip;
