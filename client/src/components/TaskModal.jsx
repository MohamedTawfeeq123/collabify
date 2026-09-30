import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import { validateTaskTitle, validateDescription } from '../utils/validators';
import { TASK_STATUSES, TASK_PRIORITIES } from '../utils/constants';

const TaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  projectMembers = [],
  projectId,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'Todo',
        priority: initialData.priority || 'Medium',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        dueDate: initialData.dueDate
          ? new Date(initialData.dueDate).toISOString().split('T')[0]
          : '',
        tags: Array.isArray(initialData.tags) ? initialData.tags.join(', ') : ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        status: 'Todo',
        priority: 'Medium',
        assignedTo: '',
        dueDate: '',
        tags: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'title') {
      setErrors((prev) => ({ ...prev, title: validateTaskTitle(value) }));
    }
    if (name === 'description') {
      setErrors((prev) => ({ ...prev, description: validateDescription(value, 500) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleErr = validateTaskTitle(formData.title);
    const descErr = validateDescription(formData.description, 500);

    setErrors({
      title: titleErr,
      description: descErr
    });

    if (titleErr || descErr) {
      return;
    }

    const payload = {
      ...formData,
      project: projectId,
      tags: formData.tags
        ? formData.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : []
    };

    if (!payload.assignedTo) {
      delete payload.assignedTo;
    }

    await onSubmit(payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{initialData ? 'Edit Task' : 'Create New Task'}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '1.25rem',
              display: 'flex'
            }}
            aria-label="Close modal"
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <FormInput
            label="Task Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="e.g., Implement authentication middleware"
            required
            maxLength={100}
          />

          <FormTextarea
            label="Task Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Detailed description of what needs to be done..."
            maxLength={500}
            rows={3}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="task-status" className="form-label">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                {TASK_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="task-priority" className="form-label">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {TASK_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="task-assignee" className="form-label">
                Assign To
              </label>
              <select
                id="task-assignee"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                className="form-select"
              >
                <option value="">Unassigned</option>
                {projectMembers.map((m) => {
                  const memberUser = m.user || m;
                  return (
                    <option key={memberUser._id} value={memberUser._id}>
                      {memberUser.fullName} (@{memberUser.username})
                    </option>
                  );
                })}
              </select>
            </div>

            <FormInput
              label="Due Date"
              name="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
            />
          </div>

          <FormInput
            label="Tags (Comma separated)"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="api, backend, bug, feature"
          />
        </form>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={isLoading || Boolean(errors.title || errors.description)}
          >
            {isLoading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
