import React from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckSquare, FiMoreVertical } from 'react-icons/fi';
import {
  formatDate,
  getInitials,
  getPriorityBadgeClass,
  getStatusBadgeClass
} from '../utils/helpers';

const ProjectCard = ({ project, onEdit, onDelete, isOwner }) => {
  const progress = project.progress || 0;

  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'var(--transition)'
      }}
      className="project-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge ${getStatusBadgeClass(project.status)}`}>
            {project.status}
          </span>
          <span className={`badge ${getPriorityBadgeClass(project.priority)}`}>
            {project.priority}
          </span>
        </div>

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {onEdit && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onEdit(project);
                }}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.25rem 0.5rem' }}
                title="Edit Project"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onDelete(project);
                }}
                className="btn btn-danger btn-sm"
                style={{ padding: '0.25rem 0.5rem' }}
                title="Delete Project"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        <Link
          to={`/projects/${project._id}`}
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            textDecoration: 'none'
          }}
        >
          {project.name}
        </Link>
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.875rem',
            marginTop: '0.35rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {project.description || 'No description provided.'}
        </p>
      </div>

      {/* Progress Bar */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '0.35rem'
          }}
        >
          <span>Progress</span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{progress}%</span>
        </div>
        <div
          style={{
            width: '100%',
            height: '6px',
            background: 'var(--bg-card-hover)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              background: progress === 100 ? 'var(--success)' : 'var(--primary)',
              borderRadius: '999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      <div
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.85rem',
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Members Avatars */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {project.members?.slice(0, 3).map((m, idx) => (
            <div
              key={m.user?._id || idx}
              title={m.user?.fullName}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                border: '2px solid var(--bg-card)',
                marginLeft: idx > 0 ? '-8px' : '0'
              }}
            >
              {getInitials(m.user?.fullName)}
            </div>
          ))}
          {project.members?.length > 3 && (
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-card-hover)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                border: '2px solid var(--bg-card)',
                marginLeft: '-8px'
              }}
            >
              +{project.members.length - 3}
            </div>
          )}
        </div>

        {/* Due Date */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: 'var(--text-muted)',
            fontSize: '0.8rem'
          }}
        >
          <FiCalendar />
          <span>{formatDate(project.endDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
