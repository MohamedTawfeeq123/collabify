const http = require('http');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const app = require('./app');
const initSocket = require('./sockets/socket');
const { setIO } = require('./utils/socketRegistry');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Pass Socket.IO instance to Express app for use in controllers
app.set('io', io);
setIO(io);

// Initialize Socket.IO event listeners
initSocket(io);

// Start Server
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Collabify Server running in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📡 Listening on http://localhost:${PORT}`);
  console.log(`💬 WebSocket ready for real-time collaboration`);
  console.log(`===============================================`);
});
