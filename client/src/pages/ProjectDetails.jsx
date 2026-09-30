import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiCalendar,
  FiUserPlus,
  FiPlus,
  FiSettings,
  FiTrash2,
  FiActivity,
  FiCheckSquare,
  FiGrid,
  FiUsers,
  FiMessageSquare,
  FiInfo
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ProjectModal from '../components/ProjectModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ChatBox from '../components/ChatBox';
import ActivityFeed from '../components/ActivityFeed';
import AddMemberModal from '../components/AddMemberModal';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import {
  formatDate,
  getInitials,
  getPriorityBadgeClass,
  getStatusBadgeClass
} from '../utils/helpers';
import { MEMBER_ROLES } from '../utils/constants';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const {
    fetchProjectById,
    updateProject,
    deleteProject,
    updateMemberRole,
    updateMemberTeam,
    removeMember
  } = useProjects();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activeTab, setActiveTab] = useState('board'); // 'overview' | 'tasks' | 'board' | 'members' | 'chat' | 'activity'
  const [loading, setLoading] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState(null);


  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const projData = await fetchProjectById(id);
      if (!projData) {
        navigate('/projects');
        return;
      }
      setProject(projData);

      const [tasksRes, activitiesRes] = await Promise.all([
        API.get(`/tasks?project=${id}`),
        API.get(`/activities/project/${id}`)
      ]);

      if (tasksRes.data.success) {
        setTasks(tasksRes.data.data);
      }
      if (activitiesRes.data.success) {
        setActivities(activitiesRes.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, fetchProjectById, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwner = project?.owner?._id === user?._id || project?.owner === user?._id;
  const isOwnerOrAdmin = isOwner || project?.userRole === 'Admin';

  // Group members by team name -> { 'Frontend Team': [member, ...], ... }
  const teamGroups = (project?.members || []).reduce((groups, m) => {
    const teamName = m.team || 'General';
    (groups[teamName] = groups[teamName] || []).push(m);
    return groups;
  }, {});
  const teamNames = Object.keys(teamGroups).sort();

  // Task Creation & Updates
  const handleCreateTask = async (taskData) => {
    try {
      const res = await API.post('/tasks', taskData);
      if (res.data.success) {
        showToast('Task created successfully.', 'success');
        setIsTaskModalOpen(false);
        loadData();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create task';
      showToast(msg, 'error');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic update
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );

      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Task moved to ${newStatus}.`, 'success');
        // Refresh project stats & activity
        const projData = await fetchProjectById(id);
        if (projData) setProject(projData);
        const activitiesRes = await API.get(`/activities/project/${id}`);
        if (activitiesRes.data.success) setActivities(activitiesRes.data.data);
      }
    } catch (err) {
      showToast('Failed to update task status.', 'error');
      loadData();
    }
  };

  // Drag and drop handlers for Kanban
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      handleStatusChange(taskId, columnStatus);
    }
  };

  // Delete Project
  const handleDeleteProject = async () => {
    const res = await deleteProject(id);
    if (res.success) {
      navigate('/projects');
    }
  };

  if (loading || !project) {
    return <Loading message="Loading project workspace..." />;
  }

  // Kanban Columns Data
  const columns = [
    { key: 'Todo', title: 'To Do', color: 'var(--text-muted)' },
    { key: 'In Progress', title: 'In Progress', color: 'var(--primary)' },
    { key: 'Review', title: 'Review', color: 'var(--warning)' },
    { key: 'Completed', title: 'Completed', color: 'var(--success)' }
  ];

  return (
    <div>
      {/* Project Header Banner */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.5rem' }}>
              <span className={`badge ${getStatusBadgeClass(project.status)}`}>
                {project.status}
              </span>
              <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
                {project.priority}
              </span>
              <span className="badge badge-medium">Role: {project.userRole || 'Member'}</span>
            </div>

            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {project.name}
            </h1>

            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.35rem', maxWidth: '750px' }}>
              {project.description || 'No description provided.'}
            </p>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1.5rem',
                marginTop: '1rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiCalendar />
                <span>
                  {formatDate(project.startDate)} – {formatDate(project.endDate)}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <FiUsers />
                <span>{project.members?.length || 1} team members</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="btn btn-primary"
            >
              <FiPlus /> Add Task
            </button>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="btn btn-secondary"
              >
                <FiUserPlus /> Add Member
              </button>
            )}
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsProjectModalOpen(true)}
                className="btn btn-secondary"
                title="Edit Project"
              >
                <FiSettings />
              </button>
            )}
            {isOwner && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="btn btn-danger"
                title="Delete Project"
              >
                <FiTrash2 />
              </button>
            )}
          </div>
        </div>

        {/* Project Task Completion Progress */}
        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Completion Progress</span>
            <span style={{ fontWeight: 700 }}>{project.stats?.progress || 0}%</span>
          </div>
          <div style={{ height: '8px', background: 'var(--bg-card-hover)', borderRadius: '999px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${project.stats?.progress || 0}%`,
                height: '100%',
                background: project.stats?.progress === 100 ? 'var(--success)' : 'var(--primary)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          marginBottom: '1.75rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}
      >
        <button
          onClick={() => setActiveTab('board')}
          className={`btn ${activeTab === 'board' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiGrid /> Kanban Board
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiCheckSquare /> Tasks List ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiMessageSquare /> Real-Time Chat
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiUsers /> Members ({project.members?.length || 1})
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`btn ${activeTab === 'activity' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiActivity /> Activity Timeline
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'} btn-sm`}
        >
          <FiInfo /> Overview
        </button>
      </div>

      {/* Tab 1: KANBAN BOARD */}
      {activeTab === 'board' && (
        <div className="kanban-board">
          {columns.map((col) => {
            const columnTasks = tasks.filter((t) => t.status === col.key);

            return (
              <div
                key={col.key}
                className="kanban-column"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.key)}
              >
                <div className="kanban-column-header">
                  <div className="kanban-column-title">
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: col.color
                      }}
                    />
                    <span>{col.title}</span>
                  </div>
                  <span className="kanban-card-count">{columnTasks.length}</span>
                </div>

                <div className="kanban-column-body">
                  {columnTasks.length === 0 ? (
                    <div
                      style={{
                        textAlign: 'center',
                        color: 'var(--text-muted)',
                        padding: '2rem 1rem',
                        fontSize: '0.85rem'
                      }}
                    >
                      Drag tasks here or add a new task
                    </div>
                  ) : (
                    columnTasks.map((t) => (
                      <TaskCard
                        key={t._id}
                        task={t}
                        isDraggable={true}
                        onDragStart={(e) => handleDragStart(e, t._id)}
                        onStatusChange={handleStatusChange}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: TASKS LIST */}
      {activeTab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Project Tasks</h3>
            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              <FiPlus /> Add Task
            </button>
          </div>

          {tasks.length === 0 ? (
            <EmptyState
              icon={FiCheckSquare}
              title="No tasks in this project"
              description="Keep your team organized by creating actionable tasks."
              actionLabel="+ Create Task"
              onAction={() => setIsTaskModalOpen(true)}
            />
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem'
              }}
            >
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: REAL-TIME CHAT */}
      {activeTab === 'chat' && (
        <ChatBox projectId={project._id} projectName={project.name} />
      )}

      {/* Tab 4: MEMBERS MANAGEMENT */}
      {activeTab === 'members' && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Team Members</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Collaborators with access to this project.
              </p>
            </div>
            {isOwnerOrAdmin && (
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="btn btn-primary btn-sm"
              >
                <FiUserPlus /> Add Member
              </button>
            )}
          </div>

          {teamNames.map((teamName) => (
            <div key={teamName} style={{ marginBottom: '1.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem',
                  fontWeight: 700,
                  fontSize: '0.95rem'
                }}
              >
                <FiUsers style={{ color: 'var(--primary)' }} /> {teamName}
                <span className="badge badge-medium">{teamGroups[teamName].length}</span>
              </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {teamGroups[teamName].map((m) => {
              const memberUser = m.user || {};
              const isMemberOwner = memberUser._id === project.owner?._id || memberUser._id === project.owner;

              return (
                <div
                  key={memberUser._id}
                  style={{
                    padding: '1rem',
                    background: 'var(--bg-page)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.9rem'
                      }}
                    >
                      {getInitials(memberUser.fullName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        {memberUser.fullName}{' '}
                        {isMemberOwner && <span style={{ color: 'var(--primary)', fontSize: '0.75rem' }}>(Owner)</span>}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        @{memberUser.username} • {memberUser.email}
                      </div>
                      {(memberUser.employeeId || memberUser.department || memberUser.designation) && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {memberUser.employeeId && <>ID: {memberUser.employeeId}</>}
                          {memberUser.department && <> • {memberUser.department}</>}
                          {memberUser.designation && <> • {memberUser.designation}</>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {isOwnerOrAdmin && !isMemberOwner && (
                      <>
                        <input
                          key={`${memberUser._id}-${m.team}`}
                          list="existing-team-options-edit"
                          defaultValue={m.team || 'General'}
                          className="form-input"
                          title="Type a team name and press Enter to move this member"
                          maxLength={40}
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: '140px' }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') e.currentTarget.blur();
                          }}
                          onBlur={(e) => {
                            const value = e.target.value.trim() || 'General';
                            if (value !== (m.team || 'General')) {
                              updateMemberTeam(project._id, memberUser._id, value);
                            }
                          }}
                        />
                      </>
                    )}

                    {isOwner && !isMemberOwner ? (
                      <select
                        value={m.role}
                        onChange={(e) => updateMemberRole(project._id, memberUser._id, e.target.value)}
                        className="form-select"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem', width: 'auto' }}
                      >
                        {MEMBER_ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="badge badge-medium">{m.role}</span>
                    )}

                    {(isOwner || isOwnerOrAdmin) && !isMemberOwner && (
                      <button
                        onClick={() => setMemberToRemove(memberUser)}
                        className="btn btn-danger btn-sm"
                        style={{ padding: '0.35rem 0.65rem' }}
                        title="Remove member"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
            </div>
          ))}
          <datalist id="existing-team-options-edit">
            {teamNames.map((t) => (
              <option key={t} value={t} />
            ))}
          </datalist>
        </div>
      )}

      {/* Tab 5: ACTIVITY TIMELINE */}
      {activeTab === 'activity' && (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem'
          }}
        >
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            Project Activity History
          </h3>
          <ActivityFeed activities={activities} />
        </div>
      )}

      {/* Tab 6: OVERVIEW */}
      {activeTab === 'overview' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem'
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Task Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>To Do</span>
                <span style={{ fontWeight: 600 }}>{project.stats?.todoTasks || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress</span>
                <span style={{ fontWeight: 600 }}>{project.stats?.inProgressTasks || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Review</span>
                <span style={{ fontWeight: 600 }}>{project.stats?.reviewTasks || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed</span>
                <span style={{ fontWeight: 600 }}>{project.stats?.completedTasks || 0}</span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem'
            }}
          >
            <h4 style={{ fontWeight: 700, marginBottom: '0.75rem' }}>Project Owner</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700
                }}
              >
                {getInitials(project.owner?.fullName)}
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>{project.owner?.fullName}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  @{project.owner?.username} • {project.owner?.email}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateTask}
        projectId={project._id}
        projectMembers={project.members || []}
      />

      {/* Project Settings Modal */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={async (formData) => {
          const res = await updateProject(project._id, formData);
          if (res.success) {
            setIsProjectModalOpen(false);
            loadData();
          }
        }}
        initialData={project}
      />

      {/* Add Team Member Modal (Employee ID + account detail) */}
      <AddMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        projectId={id}
        onDone={loadData}
        existingTeams={teamNames}
      />

      {/* Delete Project Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Project"
        message={`Are you sure you want to delete "${project.name}"? All tasks, comments, and activities will be permanently deleted.`}
        confirmText="Delete Project"
        onConfirm={handleDeleteProject}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Remove Member Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        title="Remove Member"
        message={`Are you sure you want to remove ${memberToRemove?.fullName} from this project?`}
        confirmText="Remove Member"
        onConfirm={async () => {
          await removeMember(project._id, memberToRemove._id);
          setMemberToRemove(null);
          loadData();
        }}
        onCancel={() => setMemberToRemove(null)}
      />
    </div>
  );
};

export default ProjectDetails;
