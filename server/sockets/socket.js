const Message = require('../models/Message');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

/**
 * Socket.IO Handler for Real-Time Project Chat & Notifications
 * Manages rooms per project, real-time message broadcasting,
 * typing indicators, and online status.
 */
const initSocket = (io) => {
  // Track active users: socketId -> { userId, username, currentProject }
  const activeSockets = new Map();
  // Track users in project rooms: projectId -> Set of userIds
  const projectUsers = new Map();

  // Optional JWT auth: a socket that sends a valid token is tied to that user
  // and automatically joins its private notification room. Sockets without a
  // token (e.g. the chat box) still work for chat but can NOT receive another
  // user's notifications.
  io.use((socket, next) => {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next();
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'collabify_super_secret_jwt_key_2026_production'
      );
      socket.userId = decoded.id.toString();
    } catch (err) {
      // Invalid/expired token: continue unauthenticated
    }
    next();
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    if (socket.userId) {
      socket.join(socket.userId);
      activeSockets.set(socket.id, { userId: socket.userId });
    }

    // Legacy event kept for compatibility - only honoured for the verified user
    socket.on('setupUser', (userId) => {
      if (userId && socket.userId && socket.userId === userId.toString()) {
        socket.join(userId.toString());
      }
    });

    // Join project room for project-specific chat
    socket.on('joinProject', async ({ projectId, user }) => {
      if (!projectId) return;

      socket.join(projectId);

      if (user && user._id) {
        const userInfo = {
          userId: user._id,
          username: user.username,
          fullName: user.fullName,
          currentProject: projectId
        };
        activeSockets.set(socket.id, userInfo);

        if (!projectUsers.has(projectId)) {
          projectUsers.set(projectId, new Set());
        }
        projectUsers.get(projectId).add(user._id.toString());

        // Broadcast updated online count for this project
        io.to(projectId).emit('projectOnlineUsers', {
          projectId,
          onlineCount: projectUsers.get(projectId).size,
          onlineUserIds: Array.from(projectUsers.get(projectId))
        });
      }
    });

    // Leave project room
    socket.on('leaveProject', ({ projectId, userId }) => {
      socket.leave(projectId);
      if (projectId && projectUsers.has(projectId) && userId) {
        projectUsers.get(projectId).delete(userId.toString());
        io.to(projectId).emit('projectOnlineUsers', {
          projectId,
          onlineCount: projectUsers.get(projectId).size,
          onlineUserIds: Array.from(projectUsers.get(projectId))
        });
      }
    });

    // Send and broadcast message
    socket.on('sendMessage', async ({ projectId, senderId, text }) => {
      try {
        if (!projectId || !senderId || !text || !text.trim()) return;

        // Save message to MongoDB
        const newMessage = await Message.create({
          project: projectId,
          sender: senderId,
          text: text.trim()
        });

        await newMessage.populate('sender', 'fullName username profilePicture');

        // Broadcast to all clients in the project room
        io.to(projectId).emit('receiveMessage', newMessage);
      } catch (error) {
        console.error('Socket sendMessage error:', error.message);
      }
    });

    // Typing indicator
    socket.on('typing', ({ projectId, username, fullName }) => {
      socket.to(projectId).emit('userTyping', {
        projectId,
        username,
        fullName: fullName || username
      });
    });

    // Stop typing indicator
    socket.on('stopTyping', ({ projectId, username }) => {
      socket.to(projectId).emit('userStoppedTyping', {
        projectId,
        username
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      const userInfo = activeSockets.get(socket.id);
      if (userInfo && userInfo.currentProject) {
        const { currentProject, userId } = userInfo;
        if (projectUsers.has(currentProject) && userId) {
          projectUsers.get(currentProject).delete(userId);
          io.to(currentProject).emit('projectOnlineUsers', {
            projectId: currentProject,
            onlineCount: projectUsers.get(currentProject).size,
            onlineUserIds: Array.from(projectUsers.get(currentProject))
          });
        }
      }
      activeSockets.delete(socket.id);
      console.log(`[Socket Disconnected]: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
