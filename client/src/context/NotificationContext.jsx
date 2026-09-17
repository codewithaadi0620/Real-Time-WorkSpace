import React, { createContext, useContext, useEffect, useState } from 'react';
import { notificationService } from '../services/notificationService';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toast, setToast] = useState(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      const list = res.data.notifications || [];
      setNotifications(list);
      setUnreadCount(list.filter((n) => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
      
      // Trigger Toast Popup
      setToast({
        id: notification.id || Date.now(),
        message: notification.message,
        type: notification.type,
      });

      // Auto dismiss toast after 4 seconds
      setTimeout(() => setToast(null), 4000);
    };

    socket.on('notification_created', handleNewNotification);

    return () => {
      socket.off('notification_created', handleNewNotification);
    };
  }, [socket]);

  const markAsRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        toast,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
        clearToast: () => setToast(null),
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
