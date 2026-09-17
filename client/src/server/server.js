const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config/env');
const initializeDatabase = require('./db/initDb');
const initializeWebSockets = require('./websocket/socketManager');
const errorHandler = require('./middleware/errorHandler');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// Security & Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline styles/scripts for local client dev
}));
app.use(cors({
  origin: config.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// Register API Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspaces', workspaceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Initialize WebSockets
const io = initializeWebSockets(server, config.CLIENT_URL);
app.set('io', io);

// Start Server and Database Init
async function startServer() {
  try {
    await initializeDatabase();

    server.listen(config.PORT, () => {
      console.log(`==================================================`);
      console.log(`🚀 Server running on port ${config.PORT}`);
      console.log(`📡 Real-Time WebSockets initialized`);
      console.log(`🌍 Client URL: ${config.CLIENT_URL}`);
      console.log(`==================================================`);
    });
  } catch (error) {
    console.error('❌ Failed to start backend server:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
} else {
  initializeDatabase().catch(() => {});
}

module.exports = { app, server };
