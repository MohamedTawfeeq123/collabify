import API from './axios';

export const taskApi = {
  getTasks: async (params = {}) => {
    const res = await API.get('/tasks', { params });
    return res.data;
  },

  getTaskById: async (id) => {
    const res = await API.get(`/tasks/${id}`);
    return res.data;
  },

  createTask: async (taskData) => {
    const res = await API.post('/tasks', taskData);
    return res.data;
  },

  updateTask: async (id, taskData) => {
    const res = await API.put(`/tasks/${id}`, taskData);
    return res.data;
  },

  deleteTask: async (id) => {
    const res = await API.delete(`/tasks/${id}`);
    return res.data;
  },

  getComments: async (taskId) => {
    const res = await API.get(`/tasks/${taskId}/comments`);
    return res.data;
  },

  addComment: async (taskId, commentData) => {
    const res = await API.post(`/tasks/${taskId}/comments`, commentData);
    return res.data;
  },

  updateComment: async (commentId, commentData) => {
    const res = await API.put(`/comments/${commentId}`, commentData);
    return res.data;
  },

  deleteComment: async (commentId) => {
    const res = await API.delete(`/comments/${commentId}`);
    return res.data;
  }
};
