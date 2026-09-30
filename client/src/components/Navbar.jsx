import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiSearch,
  FiMoon,
  FiSun,
  FiBell,
  FiMenu,
  FiLogOut,
  FiUser,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../context/NotificationContext';
import NotificationDropdown from './NotificationDropdown';
import { getInitials } from '../utils/helpers';

const Navbar = ({ onToggleSidebar }) => {
  const { user, theme, toggleTheme, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="icon-button"
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
          id="sidebar-toggle-btn"
          aria-label="Toggle navigation menu"
        >
          <FiMenu />
        </button>

        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <FiSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search projects or tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-actions">
        {/* Dark / Light Mode Toggle */}
        <button
          className="icon-button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <FiSun style={{ color: '#f59e0b' }} /> : <FiMoon />}
        </button>

        {/* Notifications Bell */}
        <div style={{ position: 'relative' }}>
          <button
            className="icon-button"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notifications"
            aria-label="Notifications"
          >
            <FiBell />
            {unreadCount > 0 && <span className="icon-badge">{unreadCount}</span>}
          </button>
          <NotificationDropdown isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </div>

        {/* User Profile Menu */}
        <div style={{ position: 'relative' }}>
          <div
            className="user-profile-menu"
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                className="avatar"
              />
            ) : (
              <div className="avatar">{getInitials(user?.fullName)}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.2 }}>
                {user?.fullName || 'User'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                @{user?.username || 'member'}
              </span>
            </div>
          </div>

          {isUserMenuOpen && (
            <div
              style={{
                position: 'absolute',
                top: '55px',
                right: 0,
                width: '200px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-xl)',
                padding: '0.5rem',
                zIndex: 100
              }}
            >
              <Link
                to="/profile"
                className="nav-link-item"
                onClick={() => setIsUserMenuOpen(false)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              >
                <FiUser /> Profile
              </Link>
              <Link
                to="/settings"
                className="nav-link-item"
                onClick={() => setIsUserMenuOpen(false)}
                style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
              >
                <FiSettings /> Settings
              </Link>
              <div
                style={{
                  height: '1px',
                  background: 'var(--border-color)',
                  margin: '0.4rem 0'
                }}
              />
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  logout();
                }}
                className="nav-link-item"
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: 'var(--danger)',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.875rem'
                }}
              >
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
