import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiBell,
  FiUserPlus,
  FiUserCheck,
  FiCheckSquare,
  FiRefreshCw,
  FiMessageSquare,
  FiFolder,
  FiCheck,
  FiTrash2
} from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import { useProjects } from '../context/ProjectContext';
import { formatRelativeTime } from '../utils/helpers';

const TYPE_META = {
  invitation: { icon: FiUserPlus, color: '#4f46e5' },
  invitation_response: { icon: FiUserCheck, color: '#10b981' },
  member_added: { icon: FiUserCheck, color: '#10b981' },
  task_assigned: { icon: FiCheckSquare, color: '#f59e0b' },
  task_status: { icon: FiRefreshCw, color: '#0ea5e9' },
  comment: { icon: FiMessageSquare, color: '#8b5cf6' },
  project_update: { icon: FiFolder, color: '#0ea5e9' },
  general: { icon: FiBell, color: '#64748b' }
};

/**
 * One notification row (used by the bell dropdown AND the Notifications page).
 * - Click anywhere on the row: marks it as read and opens the linked page
 * - Invitation notifications get inline Accept / Decline buttons
 */
const NotificationItem = ({ notif, compact = false, onNavigate }) => {
  const navigate = useNavigate();
  const { markAsRead, deleteNotification, fetchNotifications } = useNotifications();
  const { invitations, respondToInvitation } = useProjects();
  const [busy, setBusy] = useState(false);

  const meta = TYPE_META[notif.type] || TYPE_META.general;
  const Icon = meta.icon;

  const invitationId = notif.data?.invitationId;
  const isPendingInvite =
    notif.type === 'invitation' && invitationId && invitations.some((i) => i._id === invitationId);

  const openNotification = async () => {
    if (!notif.isRead) markAsRead(notif._id);
    if (notif.link && !isPendingInvite) {
      navigate(notif.link);
      if (onNavigate) onNavigate();
    }
  };

  const handleRespond = async (e, action) => {
    e.stopPropagation();
    setBusy(true);
    const res = await respondToInvitation(invitationId, action);
    setBusy(false);
    if (res?.success) {
      await fetchNotifications({ silent: true });
      if (action === 'accept' && res.projectId) {
        navigate(`/projects/${res.projectId}`);
        if (onNavigate) onNavigate();
      }
    }
  };

  const stop = (fn) => (e) => {
    e.stopPropagation();
    fn();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openNotification}
      onKeyDown={(e) => e.key === 'Enter' && openNotification()}
      style={{
        padding: compact ? '0.85rem 1.1rem' : '1.1rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        background: notif.isRead ? 'transparent' : 'var(--primary-light)',
        display: 'flex',
        gap: '0.85rem',
        alignItems: 'flex-start',
        cursor: 'pointer',
        transition: 'background 0.2s ease'
      }}
    >
      {/* Type icon / sender avatar */}
      <div
        style={{
          width: compact ? 34 : 40,
          height: compact ? 34 : 40,
          borderRadius: '50%',
          background: `${meta.color}22`,
          color: meta.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: compact ? '1rem' : '1.15rem'
        }}
        title={notif.sender?.fullName ? `From ${notif.sender.fullName}` : undefined}
      >
        <Icon />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {!notif.isRead && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--primary)',
                flexShrink: 0
              }}
            />
          )}
          <span
            style={{
              fontSize: compact ? '0.85rem' : '0.95rem',
              fontWeight: notif.isRead ? 600 : 700,
              color: 'var(--text-primary)'
            }}
          >
            {notif.title}
          </span>
        </div>

        <div
          style={{
            fontSize: compact ? '0.825rem' : '0.9rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginTop: '0.15rem'
          }}
        >
          {notif.message}
        </div>

        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          {formatRelativeTime(notif.createdAt)}
          {notif.sender?.fullName && <> • from {notif.sender.fullName}</>}
        </div>

        {/* Inline invitation actions */}
        {notif.type === 'invitation' && (
          <div style={{ marginTop: '0.6rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isPendingInvite ? (
              <>
                <button
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={(e) => handleRespond(e, 'accept')}
                >
                  {busy ? 'Please wait...' : 'Accept'}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                  onClick={(e) => handleRespond(e, 'reject')}
                >
                  Decline
                </button>
              </>
            ) : (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ✓ You already responded to this invitation
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {!notif.isRead && (
          <button
            onClick={stop(() => markAsRead(notif._id))}
            className="icon-button"
            style={{ width: 30, height: 30 }}
            title="Mark as read"
            aria-label="Mark as read"
          >
            <FiCheck />
          </button>
        )}
        <button
          onClick={stop(() => deleteNotification(notif._id))}
          className="icon-button"
          style={{ width: 30, height: 30, color: 'var(--text-muted)' }}
          title="Delete"
          aria-label="Delete notification"
        >
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
