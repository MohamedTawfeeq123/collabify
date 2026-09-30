import React from 'react';
import {
  FiPlusCircle,
  FiEdit2,
  FiArrowRightCircle,
  FiMessageSquare,
  FiUserPlus,
  FiCheckCircle,
  FiActivity
} from 'react-icons/fi';
import { formatRelativeTime, getInitials } from '../utils/helpers';

const ActivityFeed = ({ activities = [] }) => {
  const getActionIcon = (action) => {
    switch (action) {
      case 'created_project':
      case 'created_task':
        return <FiPlusCircle style={{ color: 'var(--success)' }} />;
      case 'moved_task':
        return <FiArrowRightCircle style={{ color: 'var(--info)' }} />;
      case 'commented_task':
        return <FiMessageSquare style={{ color: 'var(--warning)' }} />;
      case 'invited_member':
      case 'joined_project':
        return <FiUserPlus style={{ color: 'var(--primary)' }} />;
      case 'completed_project':
        return <FiCheckCircle style={{ color: 'var(--success)' }} />;
      case 'updated_project':
      case 'updated_task':
      default:
        return <FiEdit2 style={{ color: 'var(--text-muted)' }} />;
    }
  };

  if (!activities || activities.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem 1rem',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.9rem'
        }}
      >
        <FiActivity style={{ fontSize: '1.75rem', marginBottom: '0.5rem', opacity: 0.5 }} />
        <p>No activity recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {activities.map((act) => (
        <div
          key={act._id}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.85rem',
            padding: '0.75rem 0',
            borderBottom: '1px solid var(--border-color)'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--bg-card-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
              flexShrink: 0
            }}
          >
            {getActionIcon(act.action)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>
              {act.description}
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.2rem'
              }}
            >
              {formatRelativeTime(act.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
