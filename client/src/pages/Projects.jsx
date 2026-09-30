import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiFolder, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../hooks/useAuth';
import ProjectCard from '../components/ProjectCard';
import ProjectModal from '../components/ProjectModal';
import ConfirmDialog from '../components/ConfirmDialog';
import EmptyState from '../components/EmptyState';
import Loading from '../components/Loading';
import { PROJECT_STATUSES, PROJECT_PRIORITIES } from '../utils/constants';

const Projects = () => {
  const { user } = useAuth();
  const {
    projects,
    loading,
    pagination,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject
  } = useProjects();

  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [priority, setPriority] = useState(searchParams.get('priority') || 'All');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    const params = {
      search,
      status: status !== 'All' ? status : undefined,
      priority: priority !== 'All' ? priority : undefined,
      sort,
      page,
      limit: 9
    };
    fetchProjects(params);
  }, [search, status, priority, sort, page, fetchProjects]);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (formData) => {
    setIsActionLoading(true);
    let res;
    if (editingProject) {
      res = await updateProject(editingProject._id, formData);
    } else {
      res = await createProject(formData);
    }
    setIsActionLoading(false);

    if (res.success) {
      setIsModalOpen(false);
      fetchProjects();
    }
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    setIsActionLoading(true);
    const res = await deleteProject(projectToDelete._id);
    setIsActionLoading(false);
    if (res.success) {
      setProjectToDelete(null);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">
            Manage, organize and track all collaborative projects in one place.
          </p>
        </div>
        <button onClick={handleOpenCreate} className="btn btn-primary">
          <FiPlus /> New Project
        </button>
      </div>

      {/* Filter and Search Bar */}
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
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
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
            placeholder="Search projects..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Statuses</option>
            {PROJECT_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="All">All Priorities</option>
            {PROJECT_PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="form-select"
            style={{ width: 'auto' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Alphabetical (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Projects List / Grid */}
      {loading ? (
        <Loading message="Fetching projects..." />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FiFolder}
          title="No projects found"
          description={
            search || status !== 'All' || priority !== 'All'
              ? 'No projects match your filter criteria. Try adjusting your search.'
              : "You haven't created or joined any projects yet. Start by creating one!"
          }
          actionLabel="+ Create Project"
          onAction={handleOpenCreate}
        />
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}
          >
            {projects.map((proj) => {
              const isOwner =
                proj.owner?._id === user?._id ||
                proj.owner === user?._id;

              return (
                <ProjectCard
                  key={proj._id}
                  project={proj}
                  isOwner={isOwner}
                  onEdit={() => handleOpenEdit(proj)}
                  onDelete={() => setProjectToDelete(proj)}
                />
              );
            })}
          </div>

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.75rem',
                marginTop: '1.5rem'
              }}
            >
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <FiChevronLeft /> Previous
              </button>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Page {page} of {pagination.pages}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page === pagination.pages}
              >
                Next <FiChevronRight />
              </button>
            </div>
          )}
        </>
      )}

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingProject}
        isLoading={isActionLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(projectToDelete)}
        title="Delete Project"
        message={`Are you sure you want to delete "${projectToDelete?.name}"? All associated tasks, activities, and messages will be permanently removed.`}
        confirmText="Delete Project"
        isLoading={isActionLoading}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setProjectToDelete(null)}
      />
    </div>
  );
};

export default Projects;
