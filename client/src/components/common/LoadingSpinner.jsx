/**
 * PayRoll Pro – LoadingSpinner Component
 * Simple, elegant loading indicator. Can be full page or localized.
 */

import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ fullPage = false, message = 'Loading...', size = 'md' }) => {
  const spinnerSize = size === 'sm' ? 'sm' : size === 'lg' ? undefined : undefined;
  const style = fullPage
    ? {
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-body)',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
      }
    : {
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      };

  return (
    <div style={style}>
      <Spinner
        animation="border"
        variant="primary"
        size={spinnerSize}
        style={size === 'lg' ? { width: '3rem', height: '3rem' } : {}}
      />
      {message && (
        <div style={{ marginTop: '1rem', color: 'var(--gray-500)', fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default LoadingSpinner;
