/**
 * PayRoll Pro – ConfirmModal Component
 * Reusable confirmation dialog for destructive actions (deletes, status changes).
 */

import { Modal, Button } from 'react-bootstrap';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'primary', 'warning'
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={loading ? undefined : onHide} centered backdrop="static">
      <Modal.Header closeButton={!loading}>
        <Modal.Title style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {variant === 'danger' && <HiOutlineExclamationTriangle className="text-danger" />}
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p style={{ margin: 0, color: 'var(--gray-700)' }}>{message}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="ghost" onClick={onHide} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={loading}>
          {loading ? 'Processing...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmModal;
