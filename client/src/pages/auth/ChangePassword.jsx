import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { HiOutlineKey, HiOutlineCheckCircle } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import api from '../../api/axios';

const ChangePassword = () => {
  const { user, setUser } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFirstLogin = user?.isFirstLogin;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.currentPassword) {
      return setErrorMsg('Please enter your current temporary password.');
    }

    if (formData.newPassword.length < 8) {
      return setErrorMsg('New password must be at least 8 characters long.');
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setErrorMsg('New password and confirm password do not match.');
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const res = await api.post('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      if (res.data.success) {
        showSuccess('Password updated successfully!');

        // Update user state in localStorage & AuthContext
        const updatedUser = { ...user, isFirstLogin: false };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);

        // Redirect based on role
        if (user?.role === 'admin' || user?.role === 'hr') {
          navigate('/dashboard');
        } else {
          navigate('/employee/dashboard');
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update password. Please check your current password.';
      setErrorMsg(msg);
      showError(msg);
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
          {isFirstLogin ? 'First Time Login - Change Password' : 'Change Account Password'}
        </h2>
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '0.9rem',
          margin: 0,
          lineHeight: 1.4
        }}>
          {isFirstLogin
            ? 'For security reasons, you must change your temporary password before accessing your account.'
            : 'Update your account password below.'}
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
        {isFirstLogin && (
          <div style={{
            background: '#fef9c3',
            border: '1px solid #fef08a',
            color: '#a16207',
            borderRadius: '10px',
            padding: '12px 16px',
            fontSize: '0.85rem',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '1.25rem'
          }}>
            <HiOutlineKey style={{ fontSize: '1.2rem', flexShrink: 0 }} />
            <span>
              <strong>Action Required:</strong> Please set a secure password of at least 8 characters.
            </span>
          </div>
        )}

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

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              Current / Temporary Password *
            </Form.Label>
            <Form.Control
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="•••••••••"
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

          <Form.Group className="mb-3">
            <Form.Label style={{ fontSize: '0.825rem', fontWeight: 600, color: '#374151', marginBottom: '6px' }}>
              New Password * (Min 8 Characters)
            </Form.Label>
            <Form.Control
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
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
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
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
              boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
            }}
          >
            {loading ? (
              'Saving Password...'
            ) : (
              <>
                <HiOutlineCheckCircle style={{ fontSize: '1.25rem' }} />
                Save Password & Continue
              </>
            )}
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default ChangePassword;
