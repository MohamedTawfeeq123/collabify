import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import ChatBox from '../components/ChatBox';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { FiMessageSquare, FiFolder } from 'react-icons/fi';

const Messages = () => {
  const { projects, loading, fetchProjects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState('');

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [projects, selectedProjectId]);

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  if (loading) {
    return <Loading message="Loading team chats..." />;
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={FiMessageSquare}
        title="No project channels available"
        description="Join or create a project to start chatting with teammates in real-time."
        actionLabel="Go to Projects"
        onAction={() => (window.location.href = '/projects')}
      />
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Messages</h1>
          <p className="page-subtitle">
            Real-time chat channels organized by project.
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '260px 1fr',
          gap: '1.5rem',
          alignItems: 'start'
        }}
        id="messages-grid"
      >
        {/* Project Selector List */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}
        >
          <div
            style={{
              padding: '0.5rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              textTransform: 'uppercase'
            }}
          >
            Project Channels
          </div>

          {projects.map((p) => {
            const isSelected = p._id === selectedProjectId;
            return (
              <button
                key={p._id}
                onClick={() => setSelectedProjectId(p._id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: isSelected ? 'var(--primary-light)' : 'transparent',
                  color: isSelected ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.9rem',
                  transition: 'var(--transition)'
                }}
              >
                <FiFolder style={{ flexShrink: 0 }} />
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Chat Feed */}
        {selectedProject ? (
          <ChatBox
            projectId={selectedProject._id}
            projectName={selectedProject.name}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Select a project channel to begin chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
