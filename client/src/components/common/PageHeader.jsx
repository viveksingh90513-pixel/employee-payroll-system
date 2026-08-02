/**
 * PayRoll Pro – PageHeader Component
 * Standardized page title, subtitle, and action buttons header.
 */

const PageHeader = ({ title, subtitle, action, breadcrumbs }) => {
  return (
    <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--gray-900)', margin: 0 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--gray-500)', margin: '0.25rem 0 0 0' }}>
            {subtitle}
          </p>
        )}
        {breadcrumbs && (
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--primary-600)', marginTop: '0.5rem', fontWeight: 500 }}>
            {breadcrumbs}
          </div>
        )}
      </div>
      
      {action && (
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {action}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
