import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertOctagon, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem'
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'var(--danger-light)',
          color: 'var(--danger)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <FiAlertOctagon />
      </div>

      <h1
        style={{
          fontSize: '4.5rem',
          fontWeight: 900,
          color: 'var(--primary)',
          letterSpacing: '-2px',
          lineHeight: 1
        }}
      >
        404
      </h1>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0.75rem 0 0.5rem' }}>
        Page Not Found
      </h2>

      <p
        style={{
          color: 'var(--text-muted)',
          maxWidth: '420px',
          marginBottom: '2rem',
          fontSize: '0.95rem'
        }}
      >
        The page you are looking for does not exist or has been moved.
      </p>

      <Link
        to="/dashboard"
        className="btn btn-primary"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
      >
        <FiArrowLeft /> Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
