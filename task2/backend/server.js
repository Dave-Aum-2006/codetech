import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import User from './models/User.js';

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Set up __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);

// Setup Socket.IO
const io = new Server(httpServer, {
  pingTimeout: 60000,
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log('Connected to socket.io');

  // Set up personal room and online status
  socket.on('setup', async (userData) => {
    if (!userData || !userData._id) return;
    socket.join(userData._id);
    socket.userId = userData._id;
    
    try {
      await User.findByIdAndUpdate(userData._id, { status: 'online' });
      socket.broadcast.emit('user-online', userData._id);
    } catch (err) {
      console.error('Error updating user online status:', err);
    }
    
    socket.emit('connected');
  });

  socket.on('join-chat', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('typing', (room) => {
    socket.in(room).emit('typing', room);
  });

  socket.on('stop-typing', (room) => {
    socket.in(room).emit('stop-typing', room);
  });

  socket.on('new-message', (newMessageReceived) => {
    const chat = newMessageReceived.chat;
    if (!chat || !chat.users) return console.log('chat.users not defined');

    chat.users.forEach((user) => {
      // Exclude sender
      const userId = typeof user === 'string' ? user : user._id;
      if (userId === newMessageReceived.sender._id) return;

      socket.in(userId).emit('message-received', newMessageReceived);
    });
  });

  // Handle read receipt status update
  socket.on('read-chat', async ({ chatId, userId }) => {
    socket.in(chatId).emit('chat-read-by-user', { chatId, userId });
  });

  socket.on('disconnect', async () => {
    console.log('User disconnected from socket');
    if (socket.userId) {
      try {
        await User.findByIdAndUpdate(socket.userId, {
          status: 'offline',
          lastSeen: new Date(),
        });
        socket.broadcast.emit('user-offline', socket.userId);
      } catch (err) {
        console.error('Error updating user offline status:', err);
      }
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
