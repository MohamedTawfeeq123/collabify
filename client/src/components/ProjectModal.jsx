import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import {
  validateProjectName,
  validateDescription,
  validateDates
} from '../utils/validators';
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from '../utils/constants';

const ProjectModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Active',
    priority: 'Medium',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'Active',
        priority: initialData.priority || 'Medium',
        startDate: initialData.startDate
          ? new Date(initialData.startDate).toISOString().split('T')[0]
          : '',
        endDate: initialData.endDate
          ? new Date(initialData.endDate).toISOString().split('T')[0]
          : ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'Active',
        priority: 'Medium',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time live validation
    if (name === 'name') {
      setErrors((prev) => ({ ...prev, name: validateProjectName(value) }));
    }
    if (name === 'description') {
      setErrors((prev) => ({ ...prev, description: validateDescription(value, 500) }));
    }
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? value : formData.startDate;
      const end = name === 'endDate' ? value : formData.endDate;
      setErrors((prev) => ({ ...prev, dates: validateDates(start, end) }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateProjectName(formData.name);
    const descErr = validateDescription(formData.description, 500);
    const dateErr = validateDates(formData.startDate, formData.endDate);

    const newErrors = {
      name: nameErr,
      description: descErr,
      dates: dateErr
    };

    setErrors(newErrors);

    if (nameErr || descErr || dateErr) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {initialData ? 'Edit Project' : 'Create New Project'}
          </h3>
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
            label="Project Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="e.g., Collabify Redesign"
            required
            maxLength={100}
          />

          <FormTextarea
            label="Project Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            placeholder="Describe the goals and scope of this project..."
            maxLength={500}
            rows={3}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                {PROJECT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority" className="form-label">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="form-select"
              >
                {PROJECT_PRIORITIES.map((pr) => (
                  <option key={pr} value={pr}>
                    {pr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Start Date"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
            />

            <FormInput
              label="End Date"
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleChange}
              error={errors.dates}
            />
          </div>
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
            disabled={isLoading || Boolean(errors.name || errors.description || errors.dates)}
          >
            {isLoading
              ? 'Saving...'
              : initialData
              ? 'Save Changes'
              : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
