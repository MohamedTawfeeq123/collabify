import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiUserPlus, FiCheckCircle, FiAlertCircle, FiSend, FiZap } from 'react-icons/fi';
import { userApi } from '../api/userApi';
import { useProjects } from '../context/ProjectContext';
import { getInitials } from '../utils/helpers';
import { validateEmployeeId } from '../utils/validators';

/**
 * Add Team Member dialog
 * - Find a person by Employee ID and/or account detail (Gmail address or username)
 * - Live preview card so you can confirm it is the right person BEFORE adding
 * - Choose role, then either send an invitation or add them instantly
 */
const AddMemberModal = ({ isOpen, onClose, projectId, onDone, existingTeams = [] }) => {
  const { inviteMember } = useProjects();

  const [employeeId, setEmployeeId] = useState('');
  const [account, setAccount] = useState(''); // Gmail address or username
  const [role, setRole] = useState('Member');
  const [team, setTeam] = useState('');
  const [mode, setMode] = useState('invite'); // 'invite' | 'direct'

  const [lookup, setLookup] = useState({ state: 'idle', user: null, status: 'available', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requestId = useRef(0);

  // Reset when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      setEmployeeId('');
      setAccount('');
      setRole('Member');
      setTeam('');
      setMode('invite');
      setLookup({ state: 'idle', user: null, status: 'available', message: '' });
    }
  }, [isOpen]);

  const idError = employeeId ? validateEmployeeId(employeeId, false) : '';
  const accountValue = account.trim();
  const hasInput = Boolean(employeeId.trim() || accountValue);

  // Debounced live lookup as the user types
  useEffect(() => {
    if (!isOpen) return undefined;
    if (!hasInput || idError) {
      setLookup({ state: 'idle', user: null, status: 'available', message: '' });
      return undefined;
    }

    const current = ++requestId.current;
    setLookup((prev) => ({ ...prev, state: 'loading' }));

    const timer = setTimeout(async () => {
      try {
        const params = { projectId };
        if (employeeId.trim()) params.employeeId = employeeId.trim();
        if (accountValue) {
          if (accountValue.includes('@')) params.email = accountValue;
          else params.username = accountValue;
        }
        const res = await userApi.lookupUser(params);
        if (current !== requestId.current) return; // stale response

        const u = res.data;
        // If both fields were typed they must describe the same person
        const idMismatch = employeeId.trim() && u.employeeId !== employeeId.trim().toUpperCase();
        const accMismatch =
          accountValue &&
          u.email !== accountValue.toLowerCase() &&
          u.username !== accountValue.toLowerCase();

        if (idMismatch || accMismatch) {
          setLookup({
            state: 'error',
            user: null,
            status: 'available',
            message: 'The Employee ID and Gmail / username belong to different accounts.'
          });
        } else {
          setLookup({ state: 'found', user: u, status: res.status, message: '' });
        }
      } catch (err) {
        if (current !== requestId.current) return;
        setLookup({
          state: 'error',
          user: null,
          status: 'available',
          message: err.response?.data?.message || 'Could not search right now.'
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [employeeId, accountValue, idError, hasInput, isOpen, projectId]);

  if (!isOpen) return null;

  const canSubmit = lookup.state === 'found' && lookup.status === 'available' && !isSubmitting;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    const res = await inviteMember(projectId, {
      employeeId: lookup.user.employeeId || undefined,
      // always use the verified account's email so the server matches exactly this person
      email: lookup.user.email,
      role,
      team: team.trim() || 'General',
      addDirectly: mode === 'direct'
    });
    setIsSubmitting(false);

    if (res?.success) {
      if (onDone) onDone();
      onClose();
    }
  };

  const statusBadge = () => {
    if (lookup.status === 'member')
      return <span className="badge badge-medium">Already in this project</span>;
    if (lookup.status === 'invited')
      return <span className="badge badge-medium">Invitation pending</span>;
    return null;
  };

  const optionStyle = (active) => ({
    flex: 1,
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    border: `2px solid ${active ? 'var(--primary)' : 'var(--border-color)'}`,
    background: active ? 'var(--primary-light)' : 'var(--bg-card)',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)'
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
        <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiUserPlus /> Add Team Member
          </h3>
          <button className="icon-button" onClick={onClose} aria-label="Close" type="button">
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Enter the person's <strong>Employee ID</strong>, their <strong>Gmail / username</strong>, or both to
            double-check you picked the right person.
          </p>

          <div className="form-group">
            <label className="form-label">Employee ID</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. EMP-1024"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
              maxLength={20}
              autoFocus
            />
            {idError && <small style={{ color: 'var(--danger)' }}>{idError}</small>}
          </div>

          <div className="form-group">
            <label className="form-label">Account detail (Gmail address or username)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. teammate@gmail.com"
              value={account}
              onChange={(e) => setAccount(e.target.value)}
            />
          </div>

          {/* Live result */}
          <div style={{ minHeight: 84, marginBottom: '1rem' }}>
            {lookup.state === 'loading' && (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <FiSearch /> Searching...
              </div>
            )}

            {lookup.state === 'error' && (
              <div
                style={{
                  color: 'var(--danger)',
                  fontSize: '0.875rem',
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center'
                }}
              >
                <FiAlertCircle /> {lookup.message}
              </div>
            )}

            {lookup.state === 'found' && lookup.user && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-page)'
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {getInitials(lookup.user.fullName)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                    {lookup.user.fullName}
                    {lookup.status === 'available' && (
                      <FiCheckCircle style={{ color: 'var(--success)' }} title="Account found" />
                    )}
                    {statusBadge()}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    @{lookup.user.username} • {lookup.user.email}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {lookup.user.employeeId ? `ID: ${lookup.user.employeeId}` : 'No Employee ID set'}
                    {lookup.user.department && ` • ${lookup.user.department}`}
                    {lookup.user.designation && ` • ${lookup.user.designation}`}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Team name</label>
            <input
              type="text"
              className="form-input"
              list="existing-team-options"
              placeholder="e.g. Frontend Team (leave empty for General)"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              maxLength={40}
            />
            <datalist id="existing-team-options">
              {existingTeams.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
            {existingTeams.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                {existingTeams.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTeam(t)}
                    className="badge badge-medium"
                    style={{ cursor: 'pointer', border: 'none' }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="form-select">
              <option value="Admin">Admin (Can manage tasks & members)</option>
              <option value="Member">Member (Can create tasks & comments)</option>
              <option value="Viewer">Viewer (Read-only access)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">How should they join?</label>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button type="button" style={optionStyle(mode === 'invite')} onClick={() => setMode('invite')}>
                <div style={{ fontWeight: 700, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <FiSend /> Send invitation
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>They accept or decline</div>
              </button>
              <button type="button" style={optionStyle(mode === 'direct')} onClick={() => setMode('direct')}>
                <div style={{ fontWeight: 700, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <FiZap /> Add instantly
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Joins right away</div>
              </button>
            </div>
          </div>

          <div className="modal-footer" style={{ padding: 0, marginTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
              {isSubmitting ? 'Working...' : mode === 'direct' ? 'Add to Team' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;
