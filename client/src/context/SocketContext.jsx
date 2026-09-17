import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [onlineUsers, setOnlineUsers] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
        setConnectionStatus('Disconnected');
      }
      return;
    }

    setConnectionStatus('Connecting...');

    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully:', socketInstance.id);
      setIsConnected(true);
      setConnectionStatus('Connected');
    });

    socketInstance.on('disconnect', (reason) => {
      console.warn('⚠️ Socket disconnected:', reason);
      setIsConnected(false);
      setConnectionStatus('Disconnected');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      setIsConnected(false);
      setConnectionStatus('Reconnecting...');
    });

    socketInstance.on('online_users_list', ({ onlineUsers: list }) => {
      setOnlineUsers(list || []);
    });

    socketInstance.on('user_joined', ({ onlineUsers: list }) => {
      setOnlineUsers(list || []);
    });

    socketInstance.on('user_left', ({ onlineUsers: list }) => {
      setOnlineUsers(list || []);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, token]);

  const joinWorkspace = (workspaceId) => {
    if (socket && isConnected) {
      socket.emit('join_workspace', { workspaceId });
    }
  };

  const leaveWorkspace = (workspaceId) => {
    if (socket && isConnected) {
      socket.emit('leave_workspace', { workspaceId });
    }
  };

  const joinDocument = (documentId) => {
    if (socket && isConnected) {
      socket.emit('join_document', { documentId });
    }
  };

  const leaveDocument = (documentId) => {
    if (socket && isConnected) {
      socket.emit('leave_document', { documentId });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        connectionStatus,
        onlineUsers,
        joinWorkspace,
        leaveWorkspace,
        joinDocument,
        leaveDocument,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
