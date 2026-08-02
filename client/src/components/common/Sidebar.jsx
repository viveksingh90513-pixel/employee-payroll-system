/**
 * PayRoll Pro – Sidebar Component
 * Role-aware navigation with icons, active route highlighting, and mobile collapse.
 */

import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { getInitials } from '../../utils/formatters';
import { getUploadURL } from '../../api/axios';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineClipboardCheck, HiOutlineCalendar, HiOutlineCash,
  HiOutlineDocumentText, HiOutlineChartBar, HiOutlineUser,
  HiOutlineCreditCard,
} from 'react-icons/hi';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, hasRole } = useAuth();

  // Navigation items grouped by section, filtered by role
  const navSections = [
    {
      title: 'Main',
      items: [
        { path: '/', label: 'Dashboard', icon: <HiOutlineHome />, roles: ['admin', 'hr', 'employee'] },
      ],
    },
    {
      title: 'Management',
      items: [
        { path: '/employees', label: 'Employees', icon: <HiOutlineUsers />, roles: ['admin', 'hr'] },
        { path: '/departments', label: 'Departments', icon: <HiOutlineOfficeBuilding />, roles: ['admin', 'hr'] },
      ],
    },
    {
      title: 'Operations',
      items: [
        { path: '/attendance', label: 'Attendance', icon: <HiOutlineClipboardCheck />, roles: ['admin', 'hr', 'employee'] },
        { path: '/leaves', label: 'Leaves', icon: <HiOutlineCalendar />, roles: ['admin', 'hr', 'employee'] },
      ],
    },
    {
      title: 'Payroll',
      items: [
        { path: '/salary', label: 'Salary Structure', icon: <HiOutlineCash />, roles: ['admin', 'hr'] },
        { path: '/payroll', label: 'Payroll', icon: <HiOutlineCreditCard />, roles: ['admin', 'hr', 'employee'] },
      ],
    },
    {
      title: 'Analytics',
      items: [
        { path: '/reports', label: 'Reports', icon: <HiOutlineChartBar />, roles: ['admin', 'hr'] },
      ],
    },
    {
      title: 'Account',
      items: [
        { path: '/profile', label: 'My Profile', icon: <HiOutlineUser />, roles: ['admin', 'hr', 'employee'] },
      ],
    },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'show' : ''}`}>
      {/* Header / Brand */}
      <div className="sidebar-header">
        <div className="sidebar-logo">💼</div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">PayRoll Pro</span>
          <span className="sidebar-brand-tagline">Payroll Management</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navSections.map((section) => {
          // Filter items by user role
          const visibleItems = section.items.filter(
            (item) => item.roles.some((role) => hasRole(role))
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title}>
              <div className="sidebar-section-title">{section.title}</div>
              {visibleItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                  onClick={onClose}
                >
                  <span className="sidebar-link-icon">{item.icon}</span>
                  <span className="sidebar-link-text">{item.label}</span>
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      {/* Footer / User Info */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-user-avatar overflow-hidden">
            {user?.profilePhoto ? (
              <img 
                src={getUploadURL(user.profilePhoto)}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
              />
            ) : (
              user ? getInitials(user.firstName, user.lastName) : '??'
            )}
          </div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">
              {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
            </div>
            <div className="sidebar-user-role">{user?.role || ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
