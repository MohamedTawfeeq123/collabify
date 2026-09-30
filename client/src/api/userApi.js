import API from './axios';

export const userApi = {
  getProfile: async () => {
    const res = await API.get('/users/profile');
    return res.data;
  },

  updateProfile: async (userData) => {
    const res = await API.put('/users/profile', userData);
    return res.data;
  },

  changePassword: async (passwordData) => {
    const res = await API.put('/users/change-password', passwordData);
    return res.data;
  },

  // Exact lookup by Employee ID / Gmail / username (used by Add Team Member dialog)
  lookupUser: async (params) => {
    const res = await API.get('/users/lookup', { params });
    return res.data;
  },

  searchUsers: async (q) => {
    const res = await API.get('/users/search', { params: { q } });
    return res.data;
  }
};
