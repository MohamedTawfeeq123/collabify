import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiFolder,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiPlus,
  FiArrowRight,
  FiActivity,
  FiList,
  FiMail
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../context/ProjectContext';
import API from '../api/axios';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';
import ActivityFeed from '../components/ActivityFeed';
import Loading from '../components/Loading';
import {
  formatDate,
  getPriorityBadgeClass,
  getStatusBadgeClass
} from '../utils/helpers';

const Dashboard = () => {
  const { user } = useAuth();
  const {
    projects,
    fetchProjects,
    createProject,
    invitations,
    fetchMyInvitations,
    respondToInvitation
  } = useProjects();

  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchProjects(),
          fetchMyInvitations()
        ]);

        const [tasksRes, activitiesRes] = await Promise.all([
          API.get('/tasks?limit=10'),
          API.get('/activities/recent')
        ]);

        if (tasksRes.data.success) {
          setTasks(tasksRes.data.data);
        }
        if (activitiesRes.data.success) {
          setActivities(activitiesRes.data.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [fetchProjects, fetchMyInvitations]);

  // Derived Analytics Metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === 'Active').length;
  const completedProjects = projects.filter((p) => p.status === 'Completed').length;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
  const overdueTasks = tasks.filter((t) => {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed';
  }).length;

  const overallProgress =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateProject = async (data) => {
    const res = await createProject(data);
    if (res.success) {
      setIsProjectModalOpen(false);
      fetchProjects();
    }
  };

  const handleCreateTask = async (data) => {
    try {
      const res = await API.post('/tasks', data);
      if (res.data.success) {
        setIsTaskModalOpen(false);
        const tasksRes = await API.get('/tasks?limit=10');
        if (tasksRes.data.success) setTasks(tasksRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return <Loading message="Loading dashboard insights..." />;
  }

  return (
    <div>
      {/* Welcome Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.fullName}! 👋</h1>
          <p className="page-subtitle">
            Here is your project health, workload metrics, and recent team activities.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="btn btn-secondary"
            disabled={projects.length === 0}
          >
            <FiPlus /> New Task
          </button>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className="btn btn-primary"
          >
            <FiPlus /> New Project
          </button>
        </div>
      </div>

      {/* Pending Invitations Banner */}
      {invitations.length > 0 && (
        <div
          style={{
            background: 'var(--primary-light)',
            border: '1px solid rgba(var(--primary-rgb), 0.3)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FiMail style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
              You have {invitations.length} pending project invitation{invitations.length > 1 ? 's' : ''}!
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {invitations.map((inv) => (
              <div
                key={inv._id}
                style={{
                  background: 'var(--bg-card)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.75rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 700 }}>{inv.invitedBy?.fullName}</span> invited you
                  to join <span style={{ fontWeight: 700 }}>"{inv.project?.name}"</span> as{' '}
                  <span className="badge badge-medium">{inv.role}</span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => respondToInvitation(inv._id, 'accept')}
                    className="btn btn-primary btn-sm"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => respondToInvitation(inv._id, 'reject')}
                    className="btn btn-secondary btn-sm"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Metrics Cards Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(79, 70, 229, 0.12)', color: 'var(--primary)' }}>
            <FiFolder />
          </div>
          <div className="metric-info">
            <h4>Total Projects</h4>
            <div className="metric-value">{totalProjects}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
            <FiClock />
          </div>
          <div className="metric-info">
            <h4>Active Projects</h4>
            <div className="metric-value">{activeProjects}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--info)' }}>
            <FiCheckCircle />
          </div>
          <div className="metric-info">
            <h4>Completed Projects</h4>
            <div className="metric-value">{completedProjects}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(147, 51, 234, 0.12)', color: '#9333ea' }}>
            <FiList />
          </div>
          <div className="metric-info">
            <h4>Total Tasks</h4>
            <div className="metric-value">{totalTasks}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)' }}>
            <FiCheckCircle />
          </div>
          <div className="metric-info">
            <h4>Completed Tasks</h4>
            <div className="metric-value">{completedTasks}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning)' }}>
            <FiClock />
          </div>
          <div className="metric-info">
            <h4>Pending Tasks</h4>
            <div className="metric-value">{pendingTasks}</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-wrap" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger)' }}>
            <FiAlertTriangle />
          </div>
          <div className="metric-info">
            <h4>Overdue Tasks</h4>
            <div className="metric-value" style={{ color: overdueTasks > 0 ? 'var(--danger)' : undefined }}>
              {overdueTasks}
            </div>
          </div>
        </div>
      </div>

      {/* Progress & Overview Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Overall Workspace Progress</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {completedTasks} of {totalTasks} tasks resolved
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
            {overallProgress}%
          </span>
        </div>
        <div style={{ height: '8px', background: 'var(--bg-card-hover)', borderRadius: '999px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${overallProgress}%`,
              height: '100%',
              background: overallProgress === 100 ? 'var(--success)' : 'var(--primary)',
              borderRadius: '999px',
              transition: 'width 0.5s ease'
            }}
          />
        </div>
      </div>

      {/* Main Grid: Recent Projects & Tasks vs Recent Activity */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}
        id="dashboard-content-grid"
      >
        {/* Left Column: Recent Projects & Recent Tasks */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Recent Projects */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Projects</h3>
              <Link to="/projects" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                View All <FiArrowRight />
              </Link>
            </div>

            {projects.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No projects yet. Click "+ New Project" to get started!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {projects.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    style={{
                      padding: '0.85rem 1rem',
                      background: 'var(--bg-page)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <Link
                        to={`/projects/${p._id}`}
                        style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}
                      >
                        {p.name}
                      </Link>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Due: {formatDate(p.endDate)} • {p.taskCount || 0} tasks
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span className={`badge ${getStatusBadgeClass(p.status)}`}>
                        {p.status}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(p.priority)}`}>
                        {p.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Recent Tasks</h3>
              <Link to="/tasks" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                View All <FiArrowRight />
              </Link>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '1.5rem 0' }}>
                No tasks created yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.slice(0, 5).map((t) => (
                  <div
                    key={t._id}
                    style={{
                      padding: '0.75rem 1rem',
                      background: 'var(--bg-page)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <Link
                        to={`/tasks/${t._id}`}
                        style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}
                      >
                        {t.title}
                      </Link>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {t.project?.name} • Due: {formatDate(t.dueDate)}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                      <span className={`badge ${getStatusBadgeClass(t.status)}`}>
                        {t.status}
                      </span>
                      <span className={`badge ${getPriorityBadgeClass(t.priority)}`}>
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Recent Activity Feed */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            height: 'fit-content'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <FiActivity style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Activity Timeline</h3>
          </div>
          <ActivityFeed activities={activities} />
        </div>
      </div>

      {/* Project Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleCreateProject}
      />

      {/* Task Modal */}
      {projects.length > 0 && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSubmit={handleCreateTask}
          projectId={projects[0]._id}
          projectMembers={projects[0].members || []}
        />
      )}
    </div>
  );
};

export default Dashboard;
