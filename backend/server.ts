import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import childrenRoutes from './routes/children';
import activitiesRoutes from './routes/activities';
import attendanceRoutes from './routes/attendance';
import messagesRoutes from './routes/messages';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/children', childrenRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/messages', messagesRoutes);

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  // Join room for a specific child (for parents to receive updates)
  socket.on('join:child', (childId: string) => {
    socket.join(`child:${childId}`);
    console.log(`Socket ${socket.id} joined child:${childId}`);
  });

  // Join room for a specific user (for direct messages)
  socket.on('join:user', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`Socket ${socket.id} joined user:${userId}`);
  });

  // Join room for a classroom (for classroom-wide updates)
  socket.on('join:classroom', (classroomId: string) => {
    socket.join(`classroom:${classroomId}`);
    console.log(`Socket ${socket.id} joined classroom:${classroomId}`);
  });

  // Activity created event
  socket.on('activity:created', (data: { childId: string; activity: any }) => {
    io.to(`child:${data.childId}`).emit('activity:new', data.activity);
    console.log(`Activity broadcast to child:${data.childId}`);
  });

  // Message sent event
  socket.on('message:sent', (data: { recipientId: string; message: any }) => {
    io.to(`user:${data.recipientId}`).emit('message:new', data.message);
    console.log(`Message broadcast to user:${data.recipientId}`);
  });

  // Attendance update event
  socket.on('attendance:update', (data: { classroomId: string; childId: string; status: string }) => {
    io.to(`classroom:${data.classroomId}`).emit('attendance:changed', data);
    console.log(`Attendance update broadcast to classroom:${data.classroomId}`);
  });

  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`
🚀 Child Care Compass Server Started
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HTTP Server: http://localhost:${PORT}
🔌 WebSocket: ws://localhost:${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  `);
});

export { io };
