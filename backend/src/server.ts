// ===========================================
// LIFELINK MENTAL MEDICAL CENTER
// Main Server Entry Point
// ===========================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

import config from './config';
import logger from './config/logger';
import prisma from './config/database';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { AutomationEngine } from './services/automation.service';

const app = express();
const httpServer = createServer(app);

// Trust proxy (required for Render, Railway, etc.)
if (config.app.trustProxy) {
  app.set('trust proxy', 1);
}

// Build allowed origins list from config
const allowedOrigins = [config.app.url, 'http://localhost:3000'];
if (process.env.RENDER_EXTERNAL_URL) {
  allowedOrigins.push(process.env.RENDER_EXTERNAL_URL);
}
if (process.env.CORS_ORIGINS) {
  allowedOrigins.push(...process.env.CORS_ORIGINS.split(',').map(s => s.trim()));
}

// Socket.IO for real-time features
const io = new SocketServer(httpServer, {
  cors: {
    origin: allowedOrigins.filter(Boolean),
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ===== SECURITY MIDDLEWARE =====
app.use(helmet({
  contentSecurityPolicy: config.app.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: allowedOrigins.filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Stricter rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.',
    code: 'AUTH_RATE_LIMIT',
  },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ===== BODY PARSING =====
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// ===== LOGGING =====
if (!config.app.isProduction) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message: string) => logger.info(message.trim()) },
  }));
}

// ===== SERVE UPLOADED FILES =====
import path from 'path';
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// ===== HEALTH CHECK =====
app.get('/health', async (_req, res) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  const healthy = dbStatus === 'connected';
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    service: 'LifeLink API',
    status: healthy ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.app.env,
    database: dbStatus,
    uptime: process.uptime(),
  });
});

// ===== API ROUTES =====
app.use('/api', routes);

// ===== SOCKET.IO HANDLERS =====
io.on('connection', (socket) => {
  logger.debug(`Socket connected: ${socket.id}`);

  // Join user-specific room for notifications
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
  });

  // Telehealth signaling
  socket.on('telehealth:join', (roomId: string) => {
    socket.join(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('telehealth:user-joined', socket.id);
  });

  socket.on('telehealth:signal', (data: { roomId: string; signal: unknown; to: string }) => {
    socket.to(data.to).emit('telehealth:signal', { signal: data.signal, from: socket.id });
  });

  socket.on('telehealth:leave', (roomId: string) => {
    socket.leave(`room:${roomId}`);
    socket.to(`room:${roomId}`).emit('telehealth:user-left', socket.id);
  });

  // Chat typing indicator
  socket.on('chat:typing', (conversationId: string) => {
    socket.to(`conversation:${conversationId}`).emit('chat:typing', socket.id);
  });

  socket.on('disconnect', () => {
    logger.debug(`Socket disconnected: ${socket.id}`);
  });
});

// Make io accessible in routes
app.set('io', io);

// ===== ERROR HANDLING =====
app.use(notFoundHandler);
app.use(errorHandler);

// ===== START SERVER =====
const start = async () => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('✅ Database connected successfully');

    // Initialize automation engine
    AutomationEngine.init();

    httpServer.listen(config.app.port, () => {
      logger.info(`
╔══════════════════════════════════════════════════╗
║                                                  ║
║    🏥 LIFELINK MENTAL MEDICAL CENTER            ║
║    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━             ║
║                                                  ║
║    API Server running on port ${String(config.app.port).padEnd(5)}            ║
║    Environment: ${config.app.env.padEnd(12)}                   ║
║    API URL: ${config.app.apiUrl.padEnd(30)}   ║
║                                                  ║
║    Modules:                                      ║
║    ✅ Authentication & 2FA                       ║
║    ✅ Patient Management System                  ║
║    ✅ Appointment Scheduling                     ║
║    ✅ Telehealth Video System                    ║
║    ✅ AI Chat & Crisis Detection                 ║
║    ✅ M-Pesa & Card Payments                    ║
║    ✅ Business Intelligence Dashboard            ║
║    ✅ Corporate Wellness Module                  ║
║    ✅ Webinar & Teaching Hub                     ║
║    ✅ Automation Engine                          ║
║    ✅ Real-time Notifications                    ║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received. Shutting down gracefully...`);
  httpServer.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
  // Force exit after 30s
  setTimeout(() => process.exit(1), 30000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

start();

export { app, io };
