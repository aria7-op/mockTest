require('express-async-errors');
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const morgan = require('morgan');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path'); // Added for static file serving

const database = require('./config/database');
const logger = require('./config/logger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const { auth } = require('./middleware/auth');
const AdvancedNotificationService = require('./services/advancedNotificationService');
const NotificationSchedulerService = require('./services/notificationSchedulerService');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const examCategoryRoutes = require('./routes/examCategories');
const questionRoutes = require('./routes/questions');
const examRoutes = require('./routes/exams');
const bookingRoutes = require('./routes/bookings');
const attemptRoutes = require('./routes/attempts');
const paymentRoutes = require('./routes/payments');
const billingRoutes = require('./routes/billing');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

const app = express();
const server = http.createServer(app);

// Trust proxy - needed when running behind nginx/load balancer
app.set('trust proxy', true);

// Middleware to ensure proper IP detection for logging and rate limiting
app.use((req, res, next) => {
  // Ensure req.ip is properly set from X-Forwarded-For header
  req.realIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  next();
});
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Log all incoming origins for debugging
      console.log('🔌 WebSocket CORS request from origin:', origin);
      console.log('✅ Allowed WebSocket origins:', allowedOrigins);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        console.log('✅ WebSocket CORS allowed for origin:', origin);
        callback(null, true);
      } else {
        console.log('🚫 WebSocket CORS blocked origin:', origin);
        callback(new Error('Not allowed by WebSocket CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
  }
});

const PORT = process.env.PORT || 5050;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration - More permissive for development
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [
      'https://examinations.ariadelta.af',
      'https://31.97.70.79:5050',
      'https://31.97.70.79:2021',
      'https://31.97.70.79:3000',
      'https://31.97.70.79:5173'
    ]
  : [
      'http://localhost:3000', 
      'http://localhost:5173', 
      'http://192.168.0.7:3000', 
      'http://127.0.0.1:3000',
      'https://31.97.70.79:5050',
      'http://31.97.70.79:5050',
      'https://31.97.70.79:3000',
      'http://31.97.70.79:3000',
      'https://31.97.70.79:5173',
      'http://31.97.70.79:5173',
      'http://localhost:2020',
      'https://31.97.70.79:2021',
      // Add any other origins you might be using
      'http://31.97.70.79:2020',
      'https://31.97.70.79:2020'
    ];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Log all incoming origins for debugging
    console.log('🌐 CORS request from origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      // For development, be more permissive
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️ Development mode: Allowing blocked origin:', origin);
        callback(null, true);
      } else {
        console.log('🚫 CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// Handle preflight requests explicitly with more comprehensive CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Origin, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  res.status(200).end();
});

// Rate limiting - Development-friendly configuration
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per 15 minutes
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000),
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Trust proxy headers for accurate IP detection
  trustProxy: true,
  // Use X-Forwarded-For header when available
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  },
  // Skip rate limiting for health checks and OPTIONS requests
  skip: (req) => {
    return req.path === '/health' || req.method === 'OPTIONS';
  }
});

// Slow down requests - Development-friendly configuration
const speedLimiter = slowDown({
  windowMs: parseInt(process.env.SLOW_DOWN_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  delayAfter: parseInt(process.env.SLOW_DOWN_DELAY_AFTER) || 500, // allow 500 requests per 15 minutes, then...
  delayMs: () => parseInt(process.env.SLOW_DOWN_DELAY_MS) || 500, // begin adding 500ms of delay per request above 500
  // Trust proxy headers for accurate IP detection
  trustProxy: true,
  // Use X-Forwarded-For header when available
  keyGenerator: (req) => {
    return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket?.remoteAddress;
  },
  // Skip slow down for health checks and OPTIONS requests
  skip: (req) => {
    return req.path === '/health' || req.method === 'OPTIONS';
  }
});

// Commented out rate limiting to prevent 429 errors during development
// app.use(limiter);
// app.use(speedLimiter);

// Compression
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Logging middleware
app.use(morgan('combined', { stream: logger.stream }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  
  // Log detailed request information for debugging
  console.log(`🌐 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'No origin'} - IP: ${req.ip}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`✅ ${req.method} ${req.path} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    logger.logRequest(req, res, duration);
  });
  
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const dbHealth = await database.healthCheck();
    
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      database: dbHealth
    });
  } catch (error) {
    console.log('💥 Health check failed:', error);
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Debug endpoint to check CORS and request details
app.get('/debug/cors', (req, res) => {
  res.json({
    message: 'CORS Debug Info',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    origin: req.headers.origin,
    referer: req.headers.referer,
    host: req.headers.host,
    'user-agent': req.headers['user-agent'],
    allowedOrigins: allowedOrigins,
    nodeEnv: process.env.NODE_ENV
  });
});

// WebSocket event handlers
io.on('connection', (socket) => {
  logger.info(`🔌 WebSocket connected: ${socket.id}`);
  console.log('🔌 New WebSocket connection:', socket.id);
  console.log('🔌 Socket headers:', socket.handshake.headers);
  console.log('🔌 Socket auth:', socket.handshake.auth);

  // Join admin room for real-time updates
  socket.on('join-admin', (data) => {
    console.log('🔐 Admin join request:', data);
    console.log('🔐 Socket ID:', socket.id);
    console.log('🔐 User ID:', data.userId);
    console.log('🔐 User Role:', data.userRole);
    
    socket.join('admin-room');
    logger.info(`👤 Admin joined: ${data.userId}`);
    
    // Debug: Check room membership
    const rooms = Array.from(socket.rooms);
    console.log('🔐 Admin rooms after join:', rooms);
    
    // Debug: Check how many users are in admin room
    const adminRoom = io.sockets.adapter.rooms.get('admin-room');
    const adminCount = adminRoom ? adminRoom.size : 0;
    console.log('👥 Total users in admin-room:', adminCount);
    
    // Send a welcome notification to test the connection
    socket.emit('notification', {
      id: 'admin-welcome-' + Date.now(),
      type: 'ADMIN_ANNOUNCEMENT',
      title: '🔌 Admin Connected',
      message: 'You are now connected to the admin notification system',
      priority: 'high',
      timestamp: new Date().toISOString()
    });
  });

  // Join user room for personal updates
  socket.on('join-user', (data) => {
    socket.join(`user-${data.userId}`);
    logger.info(`👤 User joined personal room: user-${data.userId}`);
    
    // Debug: Check room membership
    const rooms = Array.from(socket.rooms);
    logger.info(`👤 User ${data.userId} is now in rooms:`, rooms);
    
    // Debug: Check how many users are in this specific room
    const userRoom = io.sockets.adapter.rooms.get(`user-${data.userId}`);
    const userCount = userRoom ? userRoom.size : 0;
    logger.info(`👥 Total users in user-${data.userId}: ${userCount}`);
    
    // Send a welcome notification to test the connection
    socket.emit('notification', {
      id: 'welcome-' + Date.now(),
      type: 'SYSTEM_ANNOUNCEMENT',
      title: '🔌 Connected',
      message: 'You are now connected to the notification system',
      priority: 'low',
      timestamp: new Date().toISOString()
    });
  });

  // Handle exam attempts
  socket.on('exam-attempt-started', (data) => {
    socket.to('admin-room').emit('exam-attempt-started', data);
  });

  socket.on('exam-attempt-completed', (data) => {
    socket.to('admin-room').emit('exam-attempt-completed', data);
    socket.to(`user-${data.userId}`).emit('exam-result-ready', data);
  });

  // Handle new bookings
  socket.on('booking-created', (data) => {
    socket.to('admin-room').emit('booking-created', data);
  });

  // Handle payments
  socket.on('payment-processed', (data) => {
    socket.to('admin-room').emit('payment-processed', data);
    socket.to(`user-${data.userId}`).emit('payment-confirmed', data);
  });

  // Handle user activity
  socket.on('user-login', (data) => {
    socket.to('admin-room').emit('user-login', data);
  });

  socket.on('user-logout', (data) => {
    socket.to('admin-room').emit('user-logout', data);
  });

  // Handle real-time notifications
  socket.on('send-notification', (data) => {
    socket.to(`user-${data.userId}`).emit('notification-received', data);
  });

  // Test notification handler
  socket.on('test-notification', (data) => {
    logger.info(`🧪 Test notification received from socket ${socket.id}:`, data);
    // Send back a test response
    socket.emit('test-notification-response', {
      message: 'Test response received',
      timestamp: new Date().toISOString(),
      socketId: socket.id
    });
  });

  socket.on('disconnect', () => {
    logger.info(`🔌 WebSocket disconnected: ${socket.id}`);
  });
});

// Initialize notification services
const notificationService = new AdvancedNotificationService();
const notificationScheduler = new NotificationSchedulerService();

notificationService.setSocketIO(io);

// Make services available globally
global.io = io;
global.notificationService = notificationService;
global.notificationScheduler = notificationScheduler;

// Debug: Log notification service initialization
logger.info('🔔 Notification service initialized:', {
  hasIO: !!global.io,
  hasNotificationService: !!global.notificationService,
  hasNotificationScheduler: !!global.notificationScheduler
});

// Test endpoint for notifications (remove in production)
app.get('/api/v1/test/notification', (req, res) => {
  try {
    if (global.notificationService && global.io) {
      // Get all connected student users and send individual notifications
      const connectedSockets = Array.from(global.io.sockets.sockets.values());
      const studentSockets = connectedSockets.filter(socket => 
        socket.rooms.has('user-') && !socket.rooms.has('admin-room')
      );
      
      if (studentSockets.length > 0) {
        const testNotification = {
          type: 'NEW_EXAM_AVAILABLE',
          title: '🧪 Test Notification',
          message: 'This is a test notification to verify WebSocket functionality.',
          priority: 'normal',
          timestamp: new Date().toISOString(),
          data: { 
            examId: 'test-123',
            examTitle: 'Test Exam',
            examCategory: 'Testing',
            scheduledStart: new Date().toISOString()
          }
        };

        // Send to each student individually
        studentSockets.forEach(socket => {
          const userId = Array.from(socket.rooms).find(room => room.startsWith('user-'))?.replace('user-', '');
          if (userId) {
            global.io.to(`user-${userId}`).emit('new-exam-available', testNotification);
          }
        });
        
        res.json({ 
          success: true, 
          message: `Test notification sent to ${studentSockets.length} connected students`,
          timestamp: new Date().toISOString()
        });
      } else {
        res.json({ 
          success: true, 
          message: 'No connected students found',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      res.status(500).json({ 
        success: false, 
        error: 'Notification service not available' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// WebSocket test endpoint
app.get('/websocket-test', (req, res) => {
  const adminRoom = io.sockets.adapter.rooms.get('admin-room');
  const userRooms = Array.from(io.sockets.adapter.rooms.keys()).filter(room => room.startsWith('user-'));
  
  res.status(200).json({
    message: 'WebSocket status',
    timestamp: new Date().toISOString(),
    adminRoom: {
      exists: !!adminRoom,
      userCount: adminRoom ? adminRoom.size : 0
    },
    userRooms: userRooms.length,
    totalConnections: io.engine.clientsCount
  });
});

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', auth, userRoutes);
app.use('/api/v1/exam-categories', examCategoryRoutes);
app.use('/api/v1/questions', auth, questionRoutes);
app.use('/api/v1/exams', examRoutes);
app.use('/api/v1/bookings', auth, bookingRoutes);
app.use('/api/v1/attempts', auth, attemptRoutes);
app.use('/api/v1/payments', auth, paymentRoutes);
app.use('/api/v1/billing', auth, billingRoutes);
app.use('/api/v1/analytics', auth, analyticsRoutes);
app.use('/api/v1/admin', auth, adminRoutes);
app.use('/api/v1/notifications', auth, notificationRoutes);

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  notificationScheduler.stop();
  await database.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully');
  notificationScheduler.stop();
  await database.disconnect();
  process.exit(0);
});

// Unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await database.connect();
    
    // Start notification scheduler
    notificationScheduler.start();
    
    // Start the server
    server.listen(PORT, '0.0.0.0', () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 Network access: http://192.168.0.7:${PORT}/health`);
      logger.info(`🔌 WebSocket: ws://localhost:${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api/v1/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app; 