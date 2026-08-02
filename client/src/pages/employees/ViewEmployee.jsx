import { useParams, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { 
  HiOutlinePencil, 
  HiOutlineMail, 
  HiOutlinePhone, 
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineCalendar,
  HiOutlineCreditCard,
  HiOutlineUser
} from 'react-icons/hi';
import useFetch from '../../hooks/useFetch';
import PageHeader from '../../components/common/PageHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, capitalize } from '../../utils/formatters';

const ViewEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, loading } = useFetch(`/employees/${id}`);

  if (loading) return <LoadingSpinner fullPage />;
  if (!employee) return <div className="text-center p-5">Employee not found</div>;

  const getInitials = (first, last) => `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;

  return (
    <div className="animate-fade-in">
      <PageHeader 
        title="Employee Profile" 
        breadcrumbs="Management / Employees / View"
        action={
          <Button variant="outline-primary" onClick={() => navigate(`/employees/edit/${id}`)} className="d-flex align-items-center gap-2">
            <HiOutlinePencil /> Edit Profile
          </Button>
        }
      />

      <Row>
        {/* Left Column: Profile Card */}
        <Col lg={4} className="mb-4">
          <Card className="card text-center h-100 border-0">
            <Card.Body className="p-4 d-flex flex-column align-items-center">
              <div 
                className="rounded-circle bg-gradient-primary d-flex align-items-center justify-content-center text-white mb-3 shadow-sm"
                style={{ width: '100px', height: '100px', fontSize: '2rem', fontWeight: 'bold' }}
              >
                {getInitials(employee.first_name, employee.last_name)}
              </div>
              <h4 className="font-weight-bold mb-1">{employee.first_name} {employee.last_name}</h4>
              <p className="text-muted mb-2">{employee.designation}</p>
              
              <Badge bg={employee.is_active ? 'success' : 'danger'} className="mb-4 px-3 py-2 rounded-pill">
                {employee.is_active ? 'Active Employee' : 'Inactive'}
              </Badge>

              <div className="w-100 mt-auto text-left">
                <div className="d-flex align-items-center gap-2 mb-3 text-muted">
                  <HiOutlineMail className="text-primary" /> 
                  <a href={`mailto:${employee.email}`} className="text-dark">{employee.email}</a>
                </div>
                <div className="d-flex align-items-center gap-2 mb-3 text-muted">
                  <HiOutlinePhone className="text-primary" /> 
                  <span className="text-dark">{employee.phone || 'N/A'}</span>
                </div>
                <div className="d-flex align-items-start gap-2 text-muted">
                  <HiOutlineLocationMarker className="text-primary mt-1" /> 
                  <span className="text-dark">
                    {employee.address ? (
                      <>
                        {employee.address}<br/>
                        {employee.city && `${employee.city}, `}{employee.state} {employee.zip_code}
                      </>
                    ) : 'Address not provided'}
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Column: Details Tabs/Sections */}
        <Col lg={8}>
          <div className="form-section h-100">
            <h5 className="font-weight-bold border-bottom pb-3 mb-4 d-flex align-items-center gap-2">
              <HiOutlineBriefcase className="text-primary" /> Employment Information
            </h5>
            <Row className="mb-4">
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Employee Code</div>
                <div className="font-weight-bold">{employee.emp_code}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Department</div>
                <div className="font-weight-bold">{employee.department_name || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Date of Joining</div>
                <div className="font-weight-bold">{formatDate(employee.date_of_joining)}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Employment Type</div>
                <div className="font-weight-bold text-capitalize">{employee.employment_type?.replace('-', ' ')}</div>
              </Col>
            </Row>

            <h5 className="font-weight-bold border-bottom pb-3 mb-4 mt-5 d-flex align-items-center gap-2">
              <HiOutlineUser className="text-primary" /> Personal Information
            </h5>
            <Row className="mb-4">
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Date of Birth</div>
                <div className="font-weight-bold">{employee.dob ? formatDate(employee.dob) : 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Gender</div>
                <div className="font-weight-bold text-capitalize">{employee.gender || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Emergency Contact</div>
                <div className="font-weight-bold">{employee.emergency_contact_name || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Emergency Phone</div>
                <div className="font-weight-bold">{employee.emergency_contact_phone || 'N/A'}</div>
              </Col>
            </Row>

            <h5 className="font-weight-bold border-bottom pb-3 mb-4 mt-5 d-flex align-items-center gap-2">
              <HiOutlineCreditCard className="text-primary" /> Bank & Tax Details
            </h5>
            <Row>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Bank Name</div>
                <div className="font-weight-bold">{employee.bank_name || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">Account Number</div>
                <div className="font-weight-bold">{employee.bank_account_no || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">IFSC Code</div>
                <div className="font-weight-bold">{employee.ifsc_code || 'N/A'}</div>
              </Col>
              <Col sm={6} className="mb-3">
                <div className="text-muted small">PAN Number</div>
                <div className="font-weight-bold">{employee.pan_number || 'N/A'}</div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ViewEmployee;
