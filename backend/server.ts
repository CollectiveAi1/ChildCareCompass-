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

if (!process.env.JWT_SECRET) {
  console.error('❌ FATAL: JWT_SECRET is not set in environment variables');
  process.exit(1);
}

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io);

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || ['http://localhost:3000', 'http://localhost:5173'],
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
