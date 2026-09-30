import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiCheckSquare, FiFilter } from 'react-icons/fi';
import { useProjects } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/constants';

const Tasks = () => {
  const { projects, fetchProjects } = useProjects();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState(searchParams.get('project') || 'All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All'); // 'All' | 'me'
  const [sort, setSort] = useState('dueDate');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: search.trim() || undefined,
        project: projectFilter !== 'All' ? projectFilter : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        priority: priorityFilter !== 'All' ? priorityFilter : undefined,
        assignedTo: assigneeFilter !== 'All' ? assigneeFilter : undefined,
        sort
      };

      const res = await API.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, projectFilter, statusFilter, priorityFilter, assigneeFilter, sort]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      const res = await API.put(`/tasks/${taskId}`, { status: newStatus });
      if (res.data.success) {
        showToast(`Task moved to ${newStatus}.`, 'success');
      }
    } catch (err) {
      showToast('Failed to update task status.', 'error');
      loadTasks();
    }
  };

  const handleModalSubmit = async (taskData) => {
    try {
      if (editingTask) {
        const res = await API.put(`/tasks/${editingTask._id}`, taskData);
        if (res.data.success) {
          showToast('Task updated successfully.', 'success');
        }
      } else {
        const res = await API.post('/tasks', taskData);
        if (res.data.success) {
          showToast('Task created successfully.', 'success');
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
      loadTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Operation failed';
      showToast(msg, 'error');
    }
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    try {
      const res = await API.delete(`/tasks/${taskToDelete._id}`);
      if (res.data.success) {
        showToast('Task deleted successfully.', 'success');
        setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
        setTaskToDelete(null);
      }
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    }
  };

  // Get active project members for the creation modal
  const selectedProjectObj =
    projects.find((p) => p._id === projectFilter) || projects[0];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">
            View, track, and prioritize action items across all projects.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="btn btn-primary"
          disabled={projects.length === 0}
        >
          <FiPlus /> New Task
        </button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem 1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <FiSearch
            style={{
              position: 'absolute',
              left: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)'
            }}
          />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            {TASK_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Priorities</option>
            {TASK_PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>

          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Assignees</option>
            <option value="me">Assigned to Me</option>
          </select>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title (A-Z)</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {/* Task List / Grid */}
      {loading ? (
        <Loading message="Loading tasks..." />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={FiCheckSquare}
          title="No tasks found"
          description={
            search || statusFilter !== 'All' || priorityFilter !== 'All'
              ? 'No tasks match your selected filters. Try changing or clearing filters.'
              : 'No tasks exist yet in your projects. Create one to get started!'
          }
          actionLabel={projects.length > 0 ? '+ Create Task' : null}
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem'
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

      {/* Task Create / Edit Modal */}
      {selectedProjectObj && (
        <TaskModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleModalSubmit}
          initialData={editingTask}
          projectId={selectedProjectObj._id}
          projectMembers={selectedProjectObj.members || []}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`}
        confirmText="Delete Task"
        onConfirm={handleDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};

export default Tasks;
