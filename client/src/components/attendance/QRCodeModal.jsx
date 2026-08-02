import { useState, useEffect } from 'react';
import { Modal, Button, Spinner } from 'react-bootstrap';
import { HiOutlineQrcode, HiOutlineCheckCircle } from 'react-icons/hi';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';

const QRCodeModal = ({ show, onHide, onAttendanceMarked }) => {
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(false);
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);

  const fetchQRCode = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/qr-code');
      if (res.data.success) {
        setQrToken(res.data.data.qrPayload);
      }
    } catch (err) {
      showError('Failed to generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchQRCode();
      const timer = setInterval(fetchQRCode, 60000); // refresh every 60s
      return () => clearInterval(timer);
    }
  }, [show]);

  const handleSimulateScan = async () => {
    try {
      setScanning(true);
      const res = await api.post('/attendance/qr-scan', {
        qrPayload: qrToken,
        lat: 12.9716,
        lng: 77.5946,
      });

      if (res.data.success) {
        showSuccess('QR Attendance Verified! Check-in successful.');
        if (onAttendanceMarked) onAttendanceMarked();
        onHide();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'QR Verification failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-6 font-weight-bold d-flex align-items-center gap-2">
          <HiOutlineQrcode className="text-primary fs-5" /> QR Code Kiosk Attendance
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-4">
        {loading ? (
          <div className="py-4">
            <Spinner animation="border" variant="primary" />
            <div className="text-muted small mt-2">Generating Dynamic QR Code...</div>
          </div>
        ) : (
          <div>
            <div 
              className="p-4 mx-auto mb-3 bg-light border rounded-3 shadow-xs d-flex align-items-center justify-content-center"
              style={{ width: '200px', height: '200px' }}
            >
              {/* Render simulated SVG QR Code */}
              <svg viewBox="0 0 100 100" width="160" height="160">
                <rect width="100" height="100" fill="#ffffff" />
                <rect x="10" y="10" width="30" height="30" fill="#4f46e5" />
                <rect x="15" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="20" width="10" height="10" fill="#4f46e5" />

                <rect x="60" y="10" width="30" height="30" fill="#4f46e5" />
                <rect x="65" y="15" width="20" height="20" fill="#ffffff" />
                <rect x="70" y="20" width="10" height="10" fill="#4f46e5" />

                <rect x="10" y="60" width="30" height="30" fill="#4f46e5" />
                <rect x="15" y="65" width="20" height="20" fill="#ffffff" />
                <rect x="20" y="70" width="10" height="10" fill="#4f46e5" />

                <rect x="50" y="50" width="10" height="10" fill="#4f46e5" />
                <rect x="70" y="50" width="10" height="10" fill="#4f46e5" />
                <rect x="50" y="70" width="20" height="20" fill="#4f46e5" />
              </svg>
            </div>
            <div className="small text-muted mb-3">
              Scan this QR Code at the entry kiosk or click below to simulate instant check-in.
            </div>
            <Button 
              variant="primary" 
              onClick={handleSimulateScan} 
              disabled={scanning}
              className="w-100 py-2 d-flex align-items-center justify-content-center gap-2"
            >
              {scanning ? (
                <span>Verifying...</span>
              ) : (
                <>
                  <HiOutlineCheckCircle className="fs-5" /> Simulate QR Scan Check-In
                </>
              )}
            </Button>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default QRCodeModal;
