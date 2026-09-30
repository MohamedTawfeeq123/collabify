import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiLock, FiCheckCircle, FiEdit3 } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import API from '../api/axios';
import FormInput from '../components/FormInput';
import FormTextarea from '../components/FormTextarea';
import PasswordInput from '../components/PasswordInput';
import Loading from '../components/Loading';
import {
  validateName,
  validateUsername,
  validateEmployeeId,
  validateDescription,
  validatePassword,
  validateConfirmPassword
} from '../utils/validators';
import { formatDate, getInitials } from '../utils/helpers';

const Profile = () => {
  const { user, updateProfile, changePassword } = useAuth();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0
  });

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'password'
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Profile Form
  const [profileData, setProfileData] = useState({
    fullName: '',
    username: '',
    employeeId: '',
    department: '',
    designation: '',
    bio: '',
    profilePicture: ''
  });
  const [profileErrors, setProfileErrors] = useState({});

  // Change Password Form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  useEffect(() => {
    const loadProfileStats = async () => {
      setIsLoading(true);
      try {
        const res = await API.get('/users/profile');
        if (res.data.success) {
          setStats(res.data.data.stats || {});
          setProfileData({
            fullName: res.data.data.fullName || '',
            username: res.data.data.username || '',
            employeeId: res.data.data.employeeId || '',
            department: res.data.data.department || '',
            designation: res.data.data.designation || '',
            bio: res.data.data.bio || '',
            profilePicture: res.data.data.profilePicture || ''
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileStats();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));

    if (name === 'fullName') {
      setProfileErrors((prev) => ({ ...prev, fullName: validateName(value, 'Full Name') }));
    }
    if (name === 'username') {
      setProfileErrors((prev) => ({ ...prev, username: validateUsername(value) }));
    }
    if (name === 'employeeId') {
      setProfileErrors((prev) => ({ ...prev, employeeId: validateEmployeeId(value, false) }));
    }
    if (name === 'bio') {
      setProfileErrors((prev) => ({ ...prev, bio: validateDescription(value, 200, 'Bio') }));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(profileData.fullName, 'Full Name');
    const userErr = validateUsername(profileData.username);
    const idErr = validateEmployeeId(profileData.employeeId, false);
    const bioErr = validateDescription(profileData.bio, 200, 'Bio');

    setProfileErrors({
      fullName: nameErr,
      username: userErr,
      employeeId: idErr,
      bio: bioErr
    });

    if (nameErr || userErr || idErr || bioErr) return;

    setIsSaving(true);
    await updateProfile(profileData);
    setIsSaving(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));

    if (name === 'currentPassword') {
      setPasswordErrors((prev) => ({
        ...prev,
        currentPassword: !value ? 'Current password is required.' : ''
      }));
    }
    if (name === 'newPassword') {
      const passErr = validatePassword(value);
      setPasswordErrors((prev) => ({
        ...prev,
        newPassword: passErr,
        confirmNewPassword: passwordData.confirmNewPassword
          ? validateConfirmPassword(value, passwordData.confirmNewPassword)
          : ''
      }));
    }
    if (name === 'confirmNewPassword') {
      setPasswordErrors((prev) => ({
        ...prev,
        confirmNewPassword: validateConfirmPassword(passwordData.newPassword, value)
      }));
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    const currErr = !passwordData.currentPassword ? 'Current password is required.' : '';
    const newErr = validatePassword(passwordData.newPassword);
    const confirmErr = validateConfirmPassword(
      passwordData.newPassword,
      passwordData.confirmNewPassword
    );

    setPasswordErrors({
      currentPassword: currErr,
      newPassword: newErr,
      confirmNewPassword: confirmErr
    });

    if (currErr || newErr || confirmErr) return;

    setIsSaving(true);
    const res = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmNewPassword: passwordData.confirmNewPassword
    });
    setIsSaving(false);

    if (res.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setPasswordErrors({});
    }
  };

  if (isLoading) {
    return <Loading message="Loading profile..." />;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">User Profile</h1>
          <p className="page-subtitle">
            Manage your personal identity, bio, and account credentials.
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '2rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}
      >
        <div
          style={{
            width: '84px',
            height: '84px',
            borderRadius: '50%',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: 800,
            border: '2px solid var(--primary)'
          }}
        >
          {getInitials(user?.fullName)}
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {user?.fullName}
          </h2>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            @{user?.username} • {user?.email}{user?.employeeId ? ` • ID: ${user.employeeId}` : ''}
          </div>
          {user?.bio && (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
              {user.bio}
            </p>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              marginTop: '0.75rem'
            }}
          >
            <FiCalendar />
            <span>Member since {formatDate(user?.createdAt)}</span>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div
          style={{
            display: 'flex',
            gap: '1.5rem',
            background: 'var(--bg-page)',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
              {stats.totalProjects}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Projects</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--info)' }}>
              {stats.totalTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tasks</div>
          </div>
          <div style={{ width: '1px', background: 'var(--border-color)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--success)' }}>
              {stats.completedTasks}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed</div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('profile')}
          className={`btn ${activeTab === 'profile' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiEdit3 /> Edit Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`btn ${activeTab === 'password' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiLock /> Change Password
        </button>
      </div>

      {/* Edit Profile Form */}
      {activeTab === 'profile' && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem'
          }}
        >
          <form onSubmit={handleProfileSubmit}>
            <FormInput
              label="Full Name"
              name="fullName"
              value={profileData.fullName}
              onChange={handleProfileChange}
              error={profileErrors.fullName}
              maxLength={50}
              required
            />

            <FormInput
              label="Username"
              name="username"
              value={profileData.username}
              onChange={handleProfileChange}
              error={profileErrors.username}
              maxLength={20}
              required
            />

            <FormInput
              label="Employee ID"
              name="employeeId"
              value={profileData.employeeId}
              onChange={(e) =>
                handleProfileChange({ target: { name: 'employeeId', value: e.target.value.toUpperCase() } })
              }
              error={profileErrors.employeeId}
              placeholder="e.g. EMP-1024 (teammates use this to add you to projects)"
              maxLength={20}
            />

            <FormInput
              label="Department"
              name="department"
              value={profileData.department}
              onChange={handleProfileChange}
              placeholder="e.g. Engineering"
              maxLength={50}
            />

            <FormInput
              label="Designation"
              name="designation"
              value={profileData.designation}
              onChange={handleProfileChange}
              placeholder="e.g. Frontend Developer"
              maxLength={50}
            />

            <div className="form-group">
              <label className="form-label">Gmail Address</label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="form-input"
                style={{ opacity: 0.7, cursor: 'not-allowed' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Gmail address is permanently tied to this Collabify account.
              </span>
            </div>

            <FormTextarea
              label="Bio"
              name="bio"
              value={profileData.bio}
              onChange={handleProfileChange}
              error={profileErrors.bio}
              placeholder="Tell your team about your role, skills or interests..."
              maxLength={200}
              rows={3}
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || Boolean(profileErrors.fullName || profileErrors.username || profileErrors.employeeId || profileErrors.bio)}
            >
              {isSaving ? 'Updating...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Change Password Form */}
      {activeTab === 'password' && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem'
          }}
        >
          <form onSubmit={handlePasswordSubmit}>
            <PasswordInput
              label="Current Password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.currentPassword}
              required
            />

            <PasswordInput
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.newPassword}
              required
              showCriteria={true}
            />

            <PasswordInput
              label="Confirm New Password"
              name="confirmNewPassword"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              error={passwordErrors.confirmNewPassword}
              required
              placeholder="Re-enter new password"
            />

            <button
              type="submit"
              className="btn btn-primary"
              disabled={
                isSaving ||
                Boolean(
                  passwordErrors.currentPassword ||
                  passwordErrors.newPassword ||
                  passwordErrors.confirmNewPassword
                )
              }
            >
              {isSaving ? 'Changing Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
