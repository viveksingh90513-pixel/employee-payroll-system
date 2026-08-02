/**
 * PayRoll Pro – EmptyState Component
 * Reusable placeholder for pages/sections with no data.
 */

const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '4rem 2rem',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--gray-300)',
    }}>
      {icon && (
        <div style={{
          fontSize: '3.5rem',
          color: 'var(--gray-300)',
          marginBottom: '1rem',
        }}>
          {icon}
        </div>
      )}
      <h3 style={{
        fontSize: 'var(--font-size-xl)',
        fontWeight: 700,
        color: 'var(--gray-700)',
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>
      <p style={{
        color: 'var(--gray-500)',
        maxWidth: '400px',
        margin: '0 auto 1.5rem',
        fontSize: 'var(--font-size-sm)',
      }}>
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
