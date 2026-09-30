import API from './axios';

export const projectApi = {
  getProjects: async (params = {}) => {
    const res = await API.get('/projects', { params });
    return res.data;
  },

  getProjectById: async (id) => {
    const res = await API.get(`/projects/${id}`);
    return res.data;
  },

  createProject: async (projectData) => {
    const res = await API.post('/projects', projectData);
    return res.data;
  },

  updateProject: async (id, projectData) => {
    const res = await API.put(`/projects/${id}`, projectData);
    return res.data;
  },

  deleteProject: async (id) => {
    const res = await API.delete(`/projects/${id}`);
    return res.data;
  },

  inviteMember: async (id, inviteData) => {
    const res = await API.post(`/projects/${id}/invite`, inviteData);
    return res.data;
  },

  updateMemberRole: async (projectId, memberId, role) => {
    const res = await API.put(`/projects/${projectId}/members/${memberId}/role`, { role });
    return res.data;
  },

  updateMemberTeam: async (projectId, memberId, team) => {
    const res = await API.put(`/projects/${projectId}/members/${memberId}/team`, { team });
    return res.data;
  },

  removeMember: async (projectId, memberId) => {
    const res = await API.delete(`/projects/${projectId}/members/${memberId}`);
    return res.data;
  },

  getMyInvitations: async () => {
    const res = await API.get('/projects/invitations/my');
    return res.data;
  },

  respondToInvitation: async (invitationId, action) => {
    const res = await API.put(`/projects/invitations/${invitationId}/respond`, { action });
    return res.data;
  },

  getProjectActivities: async (projectId) => {
    const res = await API.get(`/activities/project/${projectId}`);
    return res.data;
  }
};
