import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiBell } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications, unreadCount, markAllAsRead, isLive } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // The wrapper also contains the bell button - clicks on the bell are
      // handled by its own toggle, so don't treat them as "outside".
      const wrapper = dropdownRef.current?.parentElement;
      if (wrapper && !wrapper.contains(event.target)) {
        onClose();
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      style={{
        position: 'absolute',
        top: '52px',
        right: 0,
        width: 'min(400px, 92vw)',
        maxHeight: '520px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-xl)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden'
      }}
    >
      <div
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Notifications</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.1rem 0.5rem',
                borderRadius: '999px'
              }}
            >
              {unreadCount} new
            </span>
          )}
          <span
            title={isLive ? 'Live updates on' : 'Live updates offline (refreshing every 30s)'}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: isLive ? '#10b981' : '#94a3b8'
            }}
          />
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <FiCheck /> Mark all read
          </button>
        )}
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {notifications.length === 0 ? (
          <div
            style={{
              padding: '2.5rem 1rem',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.9rem'
            }}
          >
            <FiBell style={{ fontSize: '1.75rem', marginBottom: '0.5rem', opacity: 0.5 }} />
            <p>You're all caught up 🎉</p>
          </div>
        ) : (
          notifications
            .slice(0, 8)
            .map((notif) => (
              <NotificationItem key={notif._id} notif={notif} compact onNavigate={onClose} />
            ))
        )}
      </div>

      <div
        style={{
          padding: '0.75rem',
          borderTop: '1px solid var(--border-color)',
          textAlign: 'center',
          background: 'var(--bg-card-hover)'
        }}
      >
        <Link
          to="/notifications"
          onClick={onClose}
          style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600 }}
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
};

export default NotificationDropdown;
