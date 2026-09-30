import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiFolder,
  FiCheckSquare,
  FiMessageSquare,
  FiBell,
  FiUser,
  FiSettings,
  FiLayers
} from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { unreadCount } = useNotifications();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: FiGrid },
    { to: '/projects', label: 'Projects', icon: FiFolder },
    { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
    { to: '/messages', label: 'Messages', icon: FiMessageSquare },
    {
      to: '/notifications',
      label: 'Notifications',
      icon: FiBell,
      badge: unreadCount > 0 ? unreadCount : null
    },
    { to: '/profile', label: 'Profile', icon: FiUser },
    { to: '/settings', label: 'Settings', icon: FiSettings }
  ];

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 35
          }}
        />
      )}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to="/dashboard" className="sidebar-logo">
            <FiLayers style={{ fontSize: '1.5rem', color: 'var(--primary)' }} />
            <span>Collabify</span>
          </NavLink>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-link-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon style={{ fontSize: '1.15rem' }} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div
            style={{
              padding: '0.85rem',
              background: 'var(--bg-card-hover)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.75rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Collabify Pro v1.0
            </div>
            <span>Real-Time Collaboration Platform</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
