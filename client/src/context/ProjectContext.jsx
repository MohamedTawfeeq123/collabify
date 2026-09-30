import React, { createContext, useState, useContext, useCallback } from 'react';
import { projectApi } from '../api/projectApi';
import { useToast } from './ToastContext';

export const ProjectContext = createContext(null);

export const ProjectProvider = ({ children }) => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 1 });

  const fetchProjects = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await projectApi.getProjects(params);
      if (res.success) {
        setProjects(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (error) {
      showToast('Failed to load projects.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchProjectById = useCallback(async (id) => {
    setLoading(true);
    try {
      const res = await projectApi.getProjectById(id);
      if (res.success) {
        setCurrentProject(res.data);
        return res.data;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to fetch project details.';
      showToast(msg, 'error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const createProject = async (projectData) => {
    try {
      const res = await projectApi.createProject(projectData);
      if (res.success) {
        showToast(res.message || 'Project created successfully.', 'success');
        setProjects((prev) => [res.data, ...prev]);
        return { success: true, data: res.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to create project.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const res = await projectApi.updateProject(id, projectData);
      if (res.success) {
        showToast(res.message || 'Project updated successfully.', 'success');
        setCurrentProject((prev) => (prev?._id === id ? { ...prev, ...res.data } : prev));
        setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...res.data } : p)));
        return { success: true, data: res.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to update project.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const deleteProject = async (id) => {
    try {
      const res = await projectApi.deleteProject(id);
      if (res.success) {
        showToast(res.message || 'Project deleted successfully.', 'success');
        setProjects((prev) => prev.filter((p) => p._id !== id));
        if (currentProject?._id === id) {
          setCurrentProject(null);
        }
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Unable to delete project.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const inviteMember = async (projectId, inviteData) => {
    try {
      const res = await projectApi.inviteMember(projectId, inviteData);
      if (res.success) {
        showToast(res.message || 'Invitation sent successfully.', 'success');
        return { success: true, data: res.data };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to send invitation.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateMemberRole = async (projectId, memberId, role) => {
    try {
      const res = await projectApi.updateMemberRole(projectId, memberId, role);
      if (res.success) {
        showToast(res.message || 'Member role updated successfully.', 'success');
        if (currentProject?._id === projectId) {
          fetchProjectById(projectId);
        }
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update member role.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const updateMemberTeam = async (projectId, memberId, team) => {
    try {
      const res = await projectApi.updateMemberTeam(projectId, memberId, team);
      if (res.success) {
        showToast(res.message || 'Team updated.', 'success');
        if (currentProject?._id === projectId) {
          fetchProjectById(projectId);
        }
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update team.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const removeMember = async (projectId, memberId) => {
    try {
      const res = await projectApi.removeMember(projectId, memberId);
      if (res.success) {
        showToast(res.message || 'Member removed successfully.', 'success');
        if (currentProject?._id === projectId) {
          fetchProjectById(projectId);
        }
        return { success: true };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to remove member.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  const fetchMyInvitations = useCallback(async () => {
    try {
      const res = await projectApi.getMyInvitations();
      if (res.success) {
        setInvitations(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
    }
  }, []);

  const respondToInvitation = async (invitationId, action) => {
    try {
      const res = await projectApi.respondToInvitation(invitationId, action);
      if (res.success) {
        showToast(res.message, 'success');
        setInvitations((prev) => prev.filter((i) => i._id !== invitationId));
        fetchProjects();
        return { success: true, projectId: res.projectId };
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to process invitation.';
      showToast(msg, 'error');
      return { success: false, message: msg };
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        invitations,
        loading,
        pagination,
        fetchProjects,
        fetchProjectById,
        createProject,
        updateProject,
        deleteProject,
        inviteMember,
        updateMemberRole,
        updateMemberTeam,
        removeMember,
        fetchMyInvitations,
        respondToInvitation
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
