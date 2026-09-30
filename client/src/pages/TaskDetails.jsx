import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiCalendar,
  FiClock,
  FiUser,
  FiTrash2,
  FiEdit,
  FiSend,
  FiMessageSquare,
  FiTag
} from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import API from '../api/axios';
import TaskModal from '../components/TaskModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Loading from '../components/Loading';
import FormTextarea from '../components/FormTextarea';
import {
  formatDate,
  formatRelativeTime,
  getInitials,
  getPriorityBadgeClass,
  getStatusBadgeClass
} from '../utils/helpers';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/constants';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentError, setCommentError] = useState('');
  const [loading, setLoading] = useState(true);

  // Editing comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  const loadTask = useCallback(async () => {
    setLoading(true);
    try {
      const [taskRes, commentsRes] = await Promise.all([
        API.get(`/tasks/${id}`),
        API.get(`/tasks/${id}/comments`)
      ]);

      if (taskRes.data.success) {
        setTask(taskRes.data.data);
      }
      if (commentsRes.data.success) {
        setComments(commentsRes.data.data);
      }
    } catch (err) {
      console.error(err);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  const handleUpdateStatus = async (newStatus) => {
    try {
      const res = await API.put(`/tasks/${id}`, { status: newStatus });
      if (res.data.success) {
        setTask((prev) => ({ ...prev, status: newStatus }));
        showToast(`Task moved to ${newStatus}.`, 'success');
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    try {
      const res = await API.put(`/tasks/${id}`, { priority: newPriority });
      if (res.data.success) {
        setTask((prev) => ({ ...prev, priority: newPriority }));
        showToast('Priority updated.', 'success');
      }
    } catch (err) {
      showToast('Failed to update priority.', 'error');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) {
      setCommentError('Comment cannot be empty.');
      return;
    }
    if (newComment.length > 500) {
      setCommentError('Maximum 500 characters allowed.');
      return;
    }

    try {
      const res = await API.post(`/tasks/${id}/comments`, { text: newComment.trim() });
      if (res.data.success) {
        setComments((prev) => [...prev, res.data.data]);
        setNewComment('');
        setCommentError('');
        showToast('Comment added successfully.', 'success');
      }
    } catch (err) {
      showToast('Failed to post comment.', 'error');
    }
  };

  const handleSaveEditComment = async (commentId) => {
    if (!editingCommentText.trim()) return;

    try {
      const res = await API.put(`/comments/${commentId}`, { text: editingCommentText.trim() });
      if (res.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? { ...c, text: editingCommentText.trim() } : c))
        );
        setEditingCommentId(null);
        setEditingCommentText('');
        showToast('Comment updated.', 'success');
      }
    } catch (err) {
      showToast('Failed to edit comment.', 'error');
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete) return;
    try {
      const res = await API.delete(`/comments/${commentToDelete}`);
      if (res.data.success) {
        setComments((prev) => prev.filter((c) => c._id !== commentToDelete));
        setCommentToDelete(null);
        showToast('Comment deleted.', 'success');
      }
    } catch (err) {
      showToast('Failed to delete comment.', 'error');
    }
  };

  const handleDeleteTask = async () => {
    try {
      const res = await API.delete(`/tasks/${id}`);
      if (res.data.success) {
        showToast('Task deleted successfully.', 'success');
        navigate(task?.project?._id ? `/projects/${task.project._id}` : '/tasks');
      }
    } catch (err) {
      showToast('Failed to delete task.', 'error');
    }
  };

  if (loading || !task) {
    return <Loading message="Loading task details..." />;
  }

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr',
          gap: '2rem'
        }}
        id="task-details-grid"
      >
        {/* Left Column: Details & Comments */}
        <div>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem',
              marginBottom: '2rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <div>
                <Link
                  to={`/projects/${task.project?._id}`}
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}
                >
                  {task.project?.name}
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
                  {task.title}
                </h1>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="btn btn-secondary btn-sm"
                  title="Edit task"
                >
                  <FiEdit /> Edit
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="btn btn-danger btn-sm"
                  title="Delete task"
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </div>

            <div style={{ margin: '1.5rem 0' }}>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Description
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {task.description || 'No description provided.'}
              </p>
            </div>

            {task.tags && task.tags.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <FiTag style={{ color: 'var(--text-muted)' }} />
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      background: 'var(--bg-card-hover)',
                      padding: '0.2rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <FiMessageSquare style={{ color: 'var(--primary)', fontSize: '1.25rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                Discussion ({comments.length})
              </h3>
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleAddComment} style={{ marginBottom: '2rem' }}>
              <FormTextarea
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (commentError) setCommentError('');
                }}
                error={commentError}
                placeholder="Write a comment or update for the team..."
                maxLength={500}
                rows={3}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={!newComment.trim()}
                >
                  <FiSend /> Post Comment
                </button>
              </div>
            </form>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
                  No comments yet. Start the conversation!
                </p>
              ) : (
                comments.map((c) => {
                  const isCommentAuthor = c.user?._id === user?._id;

                  return (
                    <div
                      key={c._id}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-page)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'var(--primary-light)',
                              color: 'var(--primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            {getInitials(c.user?.fullName)}
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                            {c.user?.fullName}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatRelativeTime(c.createdAt)}
                          </span>
                        </div>

                        {isCommentAuthor && (
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => {
                                setEditingCommentId(c._id);
                                setEditingCommentText(c.text);
                              }}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => setCommentToDelete(c._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                              title="Delete"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingCommentId === c._id ? (
                        <div>
                          <textarea
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            maxLength={500}
                            rows={2}
                            className="form-textarea"
                          />
                          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => setEditingCommentId(null)}
                              className="btn btn-secondary btn-sm"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveEditComment(c._id)}
                              className="btn btn-primary btn-sm"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                          {c.text}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meta Properties Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}
          >
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Attributes
            </h3>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Status
              </label>
              <select
                value={task.status}
                onChange={(e) => handleUpdateStatus(e.target.value)}
                className="form-select"
              >
                {TASK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Priority
              </label>
              <select
                value={task.priority}
                onChange={(e) => handleUpdatePriority(e.target.value)}
                className="form-select"
              >
                {TASK_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Assignee
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                {task.assignedTo ? (
                  <>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--primary-light)',
                        color: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.8rem'
                      }}
                    >
                      {getInitials(task.assignedTo.fullName)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{task.assignedTo.fullName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{task.assignedTo.username}</div>
                    </div>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Unassigned</span>
                )}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Due Date
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
                <FiCalendar style={{ color: 'var(--text-muted)' }} />
                <span>{formatDate(task.dueDate)}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Created By
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <FiUser style={{ color: 'var(--text-muted)' }} />
                <span>{task.createdBy?.fullName || 'Teammate'}</span>
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Timestamps
              </label>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Created: {formatDate(task.createdAt)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Task Modal */}
      <TaskModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={async (formData) => {
          const res = await API.put(`/tasks/${id}`, formData);
          if (res.data.success) {
            showToast('Task updated successfully.', 'success');
            setIsEditModalOpen(false);
            loadTask();
          }
        }}
        initialData={task}
        projectId={task.project?._id}
        projectMembers={task.project?.members || []}
      />

      {/* Delete Task Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete Task"
        onConfirm={handleDeleteTask}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* Delete Comment Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(commentToDelete)}
        title="Delete Comment"
        message="Are you sure you want to delete this comment?"
        confirmText="Delete"
        onConfirm={handleDeleteComment}
        onCancel={() => setCommentToDelete(null)}
      />
    </div>
  );
};

export default TaskDetails;
