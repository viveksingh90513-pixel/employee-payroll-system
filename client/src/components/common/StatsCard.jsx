/**
 * PayRoll Pro – StatsCard Component
 * Dashboard card to display key metrics with trends and decorative icons.
 */

import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = 'primary',
  delay = 0,
}) => {
  // Map color names to CSS classes/gradients
  const gradients = {
    primary: 'linear-gradient(135deg, var(--primary-500), var(--primary-600))',
    success: 'linear-gradient(135deg, #10b981, #059669)',
    warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
    danger: 'linear-gradient(135deg, #ef4444, #dc2626)',
    info: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    violet: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
  };

  return (
    <div
      className="stats-card animate-fade-in-up"
      style={{
        background: gradients[color] || gradients.primary,
        animationDelay: `${delay}s`,
      }}
    >
      <div className="stats-card-header">
        <div className="stats-card-icon">{icon}</div>
        {trend !== undefined && (
          <div className={`stats-card-trend ${trend >= 0 ? 'up' : 'down'}`}>
            {trend >= 0 ? <HiArrowSmUp /> : <HiArrowSmDown />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <div className="stats-card-value">{value}</div>
        <div className="stats-card-label">
          {title}
          {trendLabel && <span style={{ opacity: 0.7, marginLeft: '4px', fontSize: '0.9em' }}>{trendLabel}</span>}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
