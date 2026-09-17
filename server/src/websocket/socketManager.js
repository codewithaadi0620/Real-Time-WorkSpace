const { Server } = require('socket.io');
const { verifyToken } = require('../utils/jwt');
const redis = require('../config/redis');
const presenceService = require('../services/presenceService');
const documentService = require('../services/documentService');

function initializeWebSockets(server, clientUrl) {
  const io = new Server(server, {
    cors: {
      origin: clientUrl || '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Invalid token'));
      }

      // Check Redis session
      const sessionData = await redis.get(`session:${token}`);
      if (!sessionData) {
        return next(new Error('Session expired'));
      }

      socket.user = JSON.parse(sessionData);
      socket.workspaceRooms = new Set();
      socket.documentRooms = new Set();
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket Connected: ${socket.user.name} (${socket.id})`);

    // Join Workspace Room & Presence
    socket.on('join_workspace', async ({ workspaceId }) => {
      if (!workspaceId) return;

      const roomName = `workspace:${workspaceId}`;
      socket.join(roomName);
      socket.workspaceRooms.add(workspaceId);

      // Add to Redis Presence
      const onlineUsers = await presenceService.addUserToWorkspace(workspaceId, socket.user);

      // Emit current online users to joining client
      socket.emit('online_users_list', { workspaceId, onlineUsers });

      // Broadcast user_joined to all other workspace members
      socket.to(roomName).emit('user_joined', {
        workspaceId,
        user: socket.user,
        onlineUsers,
      });

      console.log(`👤 ${socket.user.name} joined workspace room: ${workspaceId}`);
    });

    // Leave Workspace Room
    socket.on('leave_workspace', async ({ workspaceId }) => {
      if (!workspaceId) return;

      const roomName = `workspace:${workspaceId}`;
      socket.leave(roomName);
      socket.workspaceRooms.delete(workspaceId);

      const onlineUsers = await presenceService.removeUserFromWorkspace(workspaceId, socket.user.id);

      socket.to(roomName).emit('user_left', {
        workspaceId,
        user: socket.user,
        onlineUsers,
      });
    });

    // Join Document Room
    socket.on('join_document', ({ documentId }) => {
      if (!documentId) return;
      const roomName = `document:${documentId}`;
      socket.join(roomName);
      socket.documentRooms.add(documentId);
      console.log(`📄 ${socket.user.name} joined document room: ${documentId}`);
    });

    // Leave Document Room
    socket.on('leave_document', ({ documentId }) => {
      if (!documentId) return;
      const roomName = `document:${documentId}`;
      socket.leave(roomName);
      socket.documentRooms.delete(documentId);
    });

    // Typing Indicators (Throttled/Debounced on client)
    socket.on('typing_start', ({ documentId }) => {
      if (!documentId) return;
      socket.to(`document:${documentId}`).emit('typing_start', {
        documentId,
        user: { id: socket.user.id, name: socket.user.name },
      });
    });

    socket.on('typing_stop', ({ documentId }) => {
      if (!documentId) return;
      socket.to(`document:${documentId}`).emit('typing_stop', {
        documentId,
        userId: socket.user.id,
      });
    });

    // Real-Time Document Editing Sync
    socket.on('document_update', async ({ documentId, title, content, workspaceId }) => {
      if (!documentId) return;

      // Broadcast to other users editing the same document in real time
      socket.to(`document:${documentId}`).emit('document_updated', {
        documentId,
        title,
        content,
        updatedBy: { id: socket.user.id, name: socket.user.name },
        updatedAt: new Date().toISOString(),
      });
    });

    // Real-Time Task Operations
    socket.on('task_created', ({ workspaceId, task }) => {
      if (!workspaceId) return;
      socket.to(`workspace:${workspaceId}`).emit('task_created', { workspaceId, task });
    });

    socket.on('task_updated', ({ workspaceId, task }) => {
      if (!workspaceId) return;
      socket.to(`workspace:${workspaceId}`).emit('task_updated', { workspaceId, task });
    });

    socket.on('task_deleted', ({ workspaceId, taskId }) => {
      if (!workspaceId) return;
      socket.to(`workspace:${workspaceId}`).emit('task_deleted', { workspaceId, taskId });
    });

    // Real-Time Comments
    socket.on('comment_added', ({ documentId, comment }) => {
      if (!documentId) return;
      io.to(`document:${documentId}`).emit('comment_added', { documentId, comment });
    });

    // Real-Time Notifications dispatch helper
    socket.on('send_notification', ({ targetUserId, notification }) => {
      // Broadcast to all sockets belonging to targetUserId
      for (const [id, s] of io.sockets.sockets) {
        if (s.user && s.user.id === targetUserId) {
          s.emit('notification_created', notification);
        }
      }
    });

    // Handle Disconnect
    socket.on('disconnect', async () => {
      console.log(`❌ Socket Disconnected: ${socket.user.name} (${socket.id})`);

      for (const workspaceId of socket.workspaceRooms) {
        const roomName = `workspace:${workspaceId}`;
        const onlineUsers = await presenceService.removeUserFromWorkspace(workspaceId, socket.user.id);
        
        io.to(roomName).emit('user_left', {
          workspaceId,
          user: socket.user,
          onlineUsers,
        });
      }
    });
  });

  return io;
}

module.exports = initializeWebSockets;
