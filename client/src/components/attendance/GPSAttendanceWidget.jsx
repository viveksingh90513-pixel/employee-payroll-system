import { useState, useEffect } from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { 
  HiOutlineLocationMarker, 
  HiOutlineClock, 
  HiOutlineLogin, 
  HiOutlineLogout,
  HiOutlineQrcode
} from 'react-icons/hi';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';

const GPSAttendanceWidget = ({ onAttendanceMarked, onOpenQR }) => {
  const { showSuccess, showError } = useToast();
  const [time, setTime] = useState(new Date());
  const [location, setLocation] = useState(null);
  const [loadingLoc, setLoadingLoc] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [todayRecord, setTodayRecord] = useState(null);

  // Update live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Detect GPS location
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      return showError('Geolocation is not supported by your browser.');
    }
    setLoadingLoc(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          address: `GPS (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`,
        });
        setLoadingLoc(false);
        showSuccess('GPS Location acquired!');
      },
      (err) => {
        setLoadingLoc(false);
        showError(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const res = await api.post('/attendance/check-in', {
        lat: location?.lat || null,
        lng: location?.lng || null,
        address: location?.address || 'Web Self Check-in',
        shiftName: 'General Shift (09:00 - 18:00)',
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Check-in recorded!');
        setTodayRecord(res.data.data);
        if (onAttendanceMarked) onAttendanceMarked();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const res = await api.post('/attendance/check-out', {
        lat: location?.lat || null,
        lng: location?.lng || null,
        address: location?.address || 'Web Self Check-out',
      });

      if (res.data.success) {
        showSuccess(res.data.message || 'Check-out recorded!');
        setTodayRecord(prev => ({ ...prev, ...res.data.data }));
        if (onAttendanceMarked) onAttendanceMarked();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #ffffff 0%, #f9fafb 100%)' }}>
      <Card.Body className="p-4">
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
          <div>
            <span className="text-muted small text-uppercase font-weight-bold tracking-wider">Current Shift</span>
            <h5 className="font-weight-bold mb-0 text-dark">General Shift <Badge bg="primary" className="ms-2">09:00 AM - 06:00 PM</Badge></h5>
          </div>

          <div className="d-flex align-items-center gap-2 bg-white px-3 py-2 rounded-3 border shadow-xs">
            <HiOutlineClock className="text-primary fs-4" />
            <div className="text-end">
              <div className="fw-bold fs-5 text-dark leading-tight">{time.toLocaleTimeString()}</div>
              <div className="text-muted small">{time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
            </div>
          </div>
        </div>

        {/* GPS Location Bar */}
        <div className="d-flex align-items-center justify-content-between bg-gray-50 p-2.5 px-3 rounded-3 mb-4 border">
          <div className="d-flex align-items-center gap-2 text-muted small">
            <HiOutlineLocationMarker className={location ? "text-success fs-5" : "text-secondary fs-5"} />
            <span>{location ? location.address : 'GPS Location not captured yet'}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDetectLocation} 
            disabled={loadingLoc}
            className="p-1 px-2 text-primary font-weight-bold"
          >
            {loadingLoc ? 'Detecting...' : 'Capture GPS'}
          </Button>
        </div>

        {/* Check-In / Check-Out Actions */}
        <div className="d-flex flex-wrap gap-3">
          <Button
            variant="success"
            size="lg"
            onClick={handleCheckIn}
            disabled={checkingIn || todayRecord?.checkInTime}
            className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm"
            style={{ borderRadius: '12px' }}
          >
            <HiOutlineLogin className="fs-4" />
            {todayRecord?.checkInTime ? (
              <span>Checked In at {todayRecord.checkInTime}</span>
            ) : (
              <span>{checkingIn ? 'Checking In...' : 'Punch In (Check-In)'}</span>
            )}
          </Button>

          <Button
            variant="danger"
            size="lg"
            onClick={handleCheckOut}
            disabled={checkingOut || !todayRecord || todayRecord?.checkOutTime}
            className="flex-fill d-flex align-items-center justify-content-center gap-2 py-2.5 shadow-sm"
            style={{ borderRadius: '12px' }}
          >
            <HiOutlineLogout className="fs-4" />
            {todayRecord?.checkOutTime ? (
              <span>Checked Out ({todayRecord.hoursWorked} hrs)</span>
            ) : (
              <span>{checkingOut ? 'Checking Out...' : 'Punch Out (Check-Out)'}</span>
            )}
          </Button>

          <Button
            variant="outline-secondary"
            size="lg"
            onClick={onOpenQR}
            className="d-flex align-items-center gap-2 px-3"
            style={{ borderRadius: '12px' }}
            title="Scan QR Code Attendance"
          >
            <HiOutlineQrcode className="fs-4 text-primary" />
            <span className="d-none d-md-inline">QR Kiosk</span>
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default GPSAttendanceWidget;
