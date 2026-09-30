import API from './axios';

export const notificationApi = {
  getNotifications: async () => {
    const res = await API.get('/notifications');
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await API.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await API.put('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await API.delete(`/notifications/${id}`);
    return res.data;
  }
};
