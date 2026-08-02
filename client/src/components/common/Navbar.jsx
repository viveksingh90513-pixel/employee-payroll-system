/**
 * PayRoll Pro – Navbar Component
 * Top navigation bar with user info, role badge, and logout button.
 */

import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import useAuth from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, capitalize } from '../../utils/formatters';
import { getUploadURL } from '../../api/axios';
import { HiOutlineMenu, HiOutlineLogout, HiOutlineUser, HiOutlineSun, HiOutlineMoon } from 'react-icons/hi';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleBadgeColor = {
    admin: 'bg-gradient-danger',
    hr: 'bg-gradient-primary',
    employee: 'bg-gradient-success',
  };

  return (
    <nav className="top-navbar" style={{
      height: 'var(--navbar-height)',
      background: 'var(--bg-card)',
      borderBottom: '1px solid var(--gray-100)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 1020,
      boxShadow: 'var(--shadow-sm)',
    }}>
      {/* Left: Mobile toggle + Page title area */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <HiOutlineMenu />
        </button>
        <div>
          <h6 style={{
            margin: 0,
            fontWeight: 700,
            color: 'var(--gray-800)',
            fontSize: 'var(--font-size-lg)',
          }}>
            {getGreeting()}, {user?.firstName || 'User'} 👋
          </h6>
          <p style={{
            margin: 0,
            fontSize: 'var(--font-size-xs)',
            color: 'var(--gray-500)',
          }}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>
      </div>

      {/* Right: Theme Toggle & User dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          style={{
            background: 'var(--gray-50)',
            border: '1px solid var(--gray-200)',
            borderRadius: 'var(--radius-full)',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--gray-700)',
            fontSize: '1.2rem',
            transition: 'all 0.2s ease',
          }}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <HiOutlineMoon /> : <HiOutlineSun style={{ color: '#f59e0b' }} />}
        </button>

        <span className={`badge ${roleBadgeColor[user?.role] || 'bg-secondary'} text-white`}
          style={{ fontSize: '0.65rem', padding: '0.35em 0.75em', borderRadius: 'var(--radius-full)' }}>
          {capitalize(user?.role || '')}
        </span>

        <Dropdown align="end">
          <Dropdown.Toggle
            variant="light"
            id="user-dropdown"
            style={{
              background: 'var(--primary-50)',
              border: '2px solid var(--primary-100)',
              borderRadius: 'var(--radius-full)',
              width: '40px',
              height: '40px',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: 'var(--primary-600)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {user?.profilePhoto ? (
              <img 
                src={getUploadURL(user.profilePhoto)}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              user ? getInitials(user.firstName, user.lastName) : '??'
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu style={{
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--gray-100)',
            minWidth: '200px',
            padding: '0.5rem',
          }}>
            <div style={{
              padding: '0.5rem 0.75rem',
              borderBottom: '1px solid var(--gray-100)',
              marginBottom: '0.25rem',
            }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--gray-800)' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--gray-500)' }}>
                {user?.email}
              </div>
            </div>

            <Dropdown.Item onClick={() => navigate('/profile')} style={{
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <HiOutlineUser /> My Profile
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item onClick={handleLogout} style={{
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              color: 'var(--danger)',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <HiOutlineLogout /> Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </nav>
  );
};

/** Get time-based greeting. */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default Navbar;
