import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';
import useAuth from '../../hooks/useAuth';
import useToast from '../../hooks/useToast';
import FormInput from '../../components/common/FormInput';
import { Button } from 'react-bootstrap';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return showError('Please enter both email and password');
    }

    try {
      setLoading(true);
      await login(email, password);
      showSuccess('Login successful');
      navigate('/');
    } catch (err) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-logo">
        <div className="auth-logo-icon">💼</div>
        <h1 className="auth-title">PayRoll Pro</h1>
        <p className="auth-subtitle">Sign in to your account</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ position: 'relative' }}>
          <HiOutlineMail style={{ position: 'absolute', left: '12px', top: '40px', color: 'var(--gray-400)', zIndex: 1 }} />
          <FormInput
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
          />
          {/* Override padding for icon */}
          <style>{`input[type="email"] { padding-left: 2.5rem !important; }`}</style>
        </div>

        <div style={{ position: 'relative', marginTop: '1rem' }}>
          <HiOutlineLockClosed style={{ position: 'absolute', left: '12px', top: '40px', color: 'var(--gray-400)', zIndex: 1 }} />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
           {/* Override padding for icon */}
           <style>{`input[type="password"] { padding-left: 2.5rem !important; }`}</style>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', marginTop: '-0.5rem' }}>
          <Link to="/forgot-password" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          variant="primary" 
          className="w-100 btn-lg" 
          disabled={loading}
          style={{ letterSpacing: '0.02em' }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="auth-footer">
        Having trouble logging in? <a href="mailto:it-support@company.com">Contact IT Support</a>
      </div>
    </div>
  );
};

export default Login;
