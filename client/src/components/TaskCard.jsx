import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import {
  formatDate,
  getInitials,
  getPriorityBadgeClass
} from '../utils/helpers';

const TaskCard = ({ task, onStatusChange, isDraggable = false, onDragStart }) => {
  const isOverdue =
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Completed';

  return (
    <div
      className="task-card"
      draggable={isDraggable}
      onDragStart={onDragStart}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>
          {task.priority}
        </span>
        {onStatusChange && (
          <select
            value={task.status}
            onChange={(e) => onStatusChange(task._id, e.target.value)}
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.4rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        )}
      </div>

      <Link
        to={`/tasks/${task._id}`}
        style={{
          fontWeight: 600,
          fontSize: '0.95rem',
          color: 'var(--text-primary)',
          lineHeight: 1.3
        }}
      >
        {task.title}
      </Link>

      {task.description && (
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {task.description}
        </p>
      )}

      <div className="task-card-meta">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {task.assignedTo ? (
            <div
              title={task.assignedTo.fullName}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.65rem',
                fontWeight: 700
              }}
            >
              {getInitials(task.assignedTo.fullName)}
            </div>
          ) : (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.75rem',
                color: 'var(--text-muted)'
              }}
            >
              <FiUser /> Unassigned
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: isOverdue ? 'var(--danger)' : 'var(--text-muted)',
            fontWeight: isOverdue ? 700 : 400
          }}
        >
          <FiCalendar />
          <span>{formatDate(task.dueDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
