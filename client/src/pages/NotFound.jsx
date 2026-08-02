import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { HiOutlineHome } from 'react-icons/hi';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-body)',
      padding: '2rem',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '8rem',
        fontWeight: 900,
        color: 'var(--primary-200)',
        lineHeight: 1,
        marginBottom: '1rem',
        textShadow: '4px 4px 0 rgba(255,255,255,0.5)'
      }}>
        404
      </div>
      <h2 style={{
        fontSize: 'var(--font-size-3xl)',
        fontWeight: 800,
        color: 'var(--gray-900)',
        marginBottom: '1rem'
      }}>
        Page Not Found
      </h2>
      <p style={{
        fontSize: 'var(--font-size-lg)',
        color: 'var(--gray-500)',
        maxWidth: '500px',
        margin: '0 auto 2rem'
      }}>
        Oops! The page you are looking for doesn't exist or has been moved.
      </p>
      <Button 
        variant="primary" 
        size="lg" 
        onClick={() => navigate('/')}
        className="d-flex align-items-center gap-2"
        style={{ padding: '0.75rem 2rem' }}
      >
        <HiOutlineHome /> Back to Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
