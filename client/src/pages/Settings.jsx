import React from 'react';
import { FiSun, FiMoon, FiBell, FiShield, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';

const Settings = () => {
  const { theme, toggleTheme, logout, user } = useAuth();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">
            Configure application theme, notifications, and security options.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        {/* Appearance Settings */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {theme === 'dark' ? <FiMoon /> : <FiSun />} Appearance
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Customize your visual theme preference. The choice is saved automatically.
          </p>

          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              style={{
                flex: '1 1 180px',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'light' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: '#ffffff',
                color: '#0f172a',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FiSun style={{ color: '#f59e0b' }} /> Light Mode
            </button>

            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              style={{
                flex: '1 1 180px',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${theme === 'dark' ? 'var(--primary)' : 'var(--border-color)'}`,
                background: '#111827',
                color: '#f8fafc',
                cursor: 'pointer',
                textAlign: 'center',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <FiMoon style={{ color: '#6366f1' }} /> Dark Mode
            </button>
          </div>
        </div>

        {/* Notifications Preferences */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiBell /> Notification Alerts
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Choose how you wish to receive updates from Collabify.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Project Invitations</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Receive real-time alerts when invited to collaborate on a project.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Task Assignments</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Get notified when a new task is assigned to you.
                </div>
              </div>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px' }} />
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Task Comments</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Notify me when teammates comment on tasks I'm working on.
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Security & Session */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiShield /> Account & Session
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
            Signed in as <strong>{user?.email}</strong>.
          </p>

          <button
            onClick={logout}
            className="btn btn-danger"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <FiLogOut /> Sign Out of All Sessions
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
