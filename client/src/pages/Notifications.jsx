import React, { useState } from 'react';
import { FiBell, FiCheck } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import NotificationItem from '../components/NotificationItem';
import EmptyState from '../components/EmptyState';

const Notifications = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const [filter, setFilter] = useState('all'); // 'all' | 'unread'

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((n) => !n.isRead)
      : notifications;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">
            Stay updated with project invites, assignments, and discussions.
          </p>
        </div>

        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
            <FiCheck /> Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setFilter('all')}
          className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`btn ${filter === 'unread' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={FiBell}
          title="All caught up!"
          description={
            filter === 'unread'
              ? 'You have no unread notifications.'
              : 'You have not received any notifications yet.'
          }
        />
      ) : (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden'
          }}
        >
          {filteredNotifications.map((notif) => (
            <NotificationItem key={notif._id} notif={notif} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
