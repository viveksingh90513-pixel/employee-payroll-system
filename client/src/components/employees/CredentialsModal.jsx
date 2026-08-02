import { useState } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { HiOutlineDuplicate, HiOutlineMail, HiOutlineCheck, HiOutlineKey } from 'react-icons/hi';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';

const CredentialsModal = ({ show, onHide, credentials, title = "Employee Created Successfully" }) => {
  const { showSuccess, showError } = useToast();
  const [copied, setCopied] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  if (!credentials) return null;

  const { email, tempPassword, firstName, lastName, employeeId } = credentials;

  const handleCopy = () => {
    const textToCopy = `Login Email: ${email}\nTemporary Password: ${tempPassword}\nLogin URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showSuccess('Credentials copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendEmail = async () => {
    if (!employeeId) {
      showError('Employee ID not available to send email.');
      return;
    }
    try {
      setSendingEmail(true);
      await api.post(`/employees/${employeeId}/send-credentials`, { tempPassword });
      showSuccess(`Credentials emailed successfully to ${email}`);
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to send credentials email.');
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" keyboard={false}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold text-success d-flex align-items-center gap-2 fs-5">
          <HiOutlineKey className="fs-4" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 py-3">
        <p className="text-muted small mb-3">
          {firstName ? `Account setup complete for ${firstName} ${lastName || ''}.` : 'Account login credentials:'} Please copy or share these credentials securely with the employee.
        </p>

        <div className="bg-light p-3 rounded-3 border mb-3">
          <Form.Group className="mb-3">
            <Form.Label className="small text-secondary fw-semibold mb-1">Login Email</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={email || ''}
              className="bg-white font-monospace text-dark border-0 shadow-sm"
            />
          </Form.Group>

          <Form.Group className="mb-0">
            <Form.Label className="small text-secondary fw-semibold mb-1">Temporary Password</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                readOnly
                value={tempPassword || ''}
                className="bg-white font-monospace fw-bold text-primary border-0 shadow-sm"
              />
            </InputGroup>
          </Form.Group>
        </div>

        <div className="p-3 bg-warning-subtle text-warning-emphasis rounded-3 small mb-2 border border-warning-subtle">
          ⚠️ The employee will be prompted to change this temporary password upon their first login.
        </div>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
        <Button
          variant={copied ? 'success' : 'outline-primary'}
          onClick={handleCopy}
          className="d-flex align-items-center gap-1 shadow-sm px-3"
        >
          {copied ? <HiOutlineCheck /> : <HiOutlineDuplicate />}
          {copied ? 'Copied!' : 'Copy Credentials'}
        </Button>

        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            onClick={handleSendEmail}
            disabled={sendingEmail}
            className="d-flex align-items-center gap-1"
          >
            <HiOutlineMail />
            {sendingEmail ? 'Sending...' : 'Send by Email'}
          </Button>

          <Button variant="primary" onClick={onHide} className="px-4">
            Done
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default CredentialsModal;
