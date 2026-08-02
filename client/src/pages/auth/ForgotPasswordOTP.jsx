import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { HiOutlineKey, HiOutlineArrowLeft, HiOutlineCheckCircle } from 'react-icons/hi';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';

const ForgotPasswordOTP = () => {
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // Step 1: Enter Email, Step 2: Enter OTP & New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [devOTP, setDevOTP] = useState('');

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return setErrorMsg('Please enter your registered email address.');

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.post('/auth/forgot-password-otp', { email });
      if (res.data.success) {
        showSuccess('If registered, a 6-digit OTP has been sent to your email.');
        if (res.data.data?.otp) {
          setDevOTP(res.data.data.otp);
        }
        setStep(2);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to request OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || otp.trim().length !== 6) {
      return setErrorMsg('Please enter a valid 6-digit OTP.');
    }

    if (newPassword.length < 8) {
      return setErrorMsg('New password must be at least 8 characters long.');
    }

    if (newPassword !== confirmPassword) {
      return setErrorMsg('New password and confirm password do not match.');
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await api.post('/auth/reset-password-otp', {
        email,
        otp: otp.trim(),
        newPassword,
      });

      if (res.data.success) {
        showSuccess('Password reset successful! You can now log in.');
        navigate('/login');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Invalid or expired OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 40%, #3730a3 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999,
      overflowY: 'auto'
    }}>
      {/* Top Header Section */}
      <div className="text-center mb-4" style={{ maxWidth: '540px' }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '2rem',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
          marginBottom: '1.25rem'
        }}>
          <HiOutlineKey />
        </div>
        <h2 style={{
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.85rem',
          marginBottom: '0.4rem',
          letterSpacing: '-0.02em'
        }}>
          Reset Password
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
          margin: 0,
          lineHeight: 1.4
        }}>
          {step === 1
            ? 'Enter your email address to receive a 6-digit verification OTP.'
            : `Enter the 6-digit OTP sent to ${email} and your new password.`}
        </p>
      </div>

      {/* Centered White Card */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        padding: '2.25rem 2rem',
        position: 'relative'
      }}>
        {errorMsg && (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.875rem',
            fontWeight: 500,
            marginBottom: '1.25rem'
          }}>
            {errorMsg}
          </div>
        )}

        {step === 1 ? (
          <Form onSubmit={handleRequestOTP}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Email Address *
              </Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrorMsg(''); }}
                placeholder="employee@payrollpro.com"
                required
                style={{
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.925rem'
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#4f46e5',
                borderColor: '#4f46e5',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                marginBottom: '1rem'
              }}
            >
              {loading ? 'Sending OTP...' : 'Send OTP Code'}
            </Button>
          </Form>
        ) : (
          <Form onSubmit={handleResetPassword}>
            {devOTP && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e40af',
                borderRadius: '10px',
                padding: '10px 14px',
                fontSize: '0.85rem',
                marginBottom: '1rem'
              }}>
                <strong>Demo OTP:</strong> {devOTP}
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                6-Digit OTP Code *
              </Form.Label>
              <Form.Control
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => { setOtp(e.target.value); setErrorMsg(''); }}
                placeholder="123456"
                required
                style={{
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  textAlign: 'center',
                  letterSpacing: '0.15em'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                New Password * (Min 8 Chars)
              </Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => { setNewPassword(e.target.value); setErrorMsg(''); }}
                placeholder="•••••••••"
                required
                minLength={8}
                style={{
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.925rem'
                }}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
                Confirm New Password *
              </Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMsg(''); }}
                placeholder="•••••••••"
                required
                minLength={8}
                style={{
                  borderRadius: '8px',
                  padding: '10px 14px',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  fontSize: '0.925rem'
                }}
              />
            </Form.Group>

            <Button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: '#4f46e5',
                borderColor: '#4f46e5',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)',
                marginBottom: '1rem'
              }}
            >
              {loading ? (
                'Resetting Password...'
              ) : (
                <>
                  <HiOutlineCheckCircle style={{ fontSize: '1.25rem' }} />
                  Verify OTP & Reset Password
                </>
              )}
            </Button>
          </Form>
        )}

        <div className="text-center pt-2" style={{ borderTop: '1px solid #f3f4f6' }}>
          <Link to="/login" style={{ textDecoration: 'none', color: '#6b7280', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            <HiOutlineArrowLeft /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordOTP;
