import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
  useRef
} from 'react';
import io from 'socket.io-client';
import { notificationApi } from '../api/notificationApi';
import { useToast } from './ToastContext';
import { useAuth } from '../hooks/useAuth';
import { useProjects } from './ProjectContext';

export const NotificationContext = createContext(null);

const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const POLL_INTERVAL_MS = 30000; // safety net if the socket is offline

export const NotificationProvider = ({ children }) => {
  const { showToast } = useToast();
  const { user, token } = useAuth();
  const { fetchMyInvitations, fetchProjects } = useProjects();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const socketRef = useRef(null);
  const notificationsRef = useRef([]);
  notificationsRef.current = notifications;

  const fetchNotifications = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    try {
      const res = await notificationApi.getNotifications();
      if (res.success) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Called when a brand-new notification arrives through the socket
  const addRealtimeNotification = useCallback(
    (notification) => {
      // ignore duplicates (e.g. socket + polling both delivering it)
      if (notificationsRef.current.some((n) => n._id === notification._id)) return;
      notificationsRef.current = [notification, ...notificationsRef.current];
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((c) => c + 1);

      showToast(`🔔 ${notification.title}: ${notification.message}`, 'info', 6000);

      // Keep other parts of the UI fresh
      if (notification.type === 'invitation') fetchMyInvitations();
      if (notification.type === 'member_added') fetchProjects();
    },
    [showToast, fetchMyInvitations, fetchProjects]
  );

  // Load notifications as soon as the user is logged in + poll as a fallback
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return undefined;
    }

    fetchNotifications();
    fetchMyInvitations();
    const timer = setInterval(() => fetchNotifications({ silent: true }), POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [user?._id, fetchNotifications]); // eslint-disable-line react-hooks/exhaustive-deps

  // One app-wide socket connection dedicated to notifications
  useEffect(() => {
    if (!user || !token) return undefined;

    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsLive(true);
      // Catch up on anything missed while offline
      fetchNotifications({ silent: true });
    });
    socket.on('disconnect', () => setIsLive(false));
    socket.on('newNotification', addRealtimeNotification);

    return () => {
      socket.off('newNotification', addRealtimeNotification);
      socket.disconnect();
      socketRef.current = null;
      setIsLive(false);
    };
  }, [user?._id, token, addRealtimeNotification, fetchNotifications]); // eslint-disable-line react-hooks/exhaustive-deps

  const markAsRead = async (id) => {
    const target = notifications.find((n) => n._id === id);
    if (!target || target.isRead) return;
    // optimistic update
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      fetchNotifications({ silent: true });
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await notificationApi.markAllAsRead();
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        showToast('All notifications marked as read', 'info');
      }
    } catch (error) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const deleteNotification = async (id) => {
    try {
      const res = await notificationApi.deleteNotification(id);
      if (res.success) {
        const item = notifications.find((n) => n._id === id);
        if (item && !item.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        setNotifications((prev) => prev.filter((n) => n._id !== id));
      }
    } catch (error) {
      showToast('Failed to delete notification', 'error');
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        isLive,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        addRealtimeNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
