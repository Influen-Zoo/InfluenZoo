const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { requestLogger } = require('./middleware/common/logger.middleware');
const { errorMiddleware, notFoundHandler } = require('./middleware/common/error.middleware');

dotenv.config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(requestLogger);

// Routes
app.use('/api/auth', require('./routes/auth/auth.routes'));
app.use('/api/brand', require('./routes/brand/brand.routes'));
app.use('/api/influencer', require('./routes/influencer/influencer.routes'));
app.use('/api/users', require('./routes/common/user.routes'));
app.use('/api/admin', require('./routes/admin/admin.routes'));
app.use('/api/admin/wallet', require('./routes/admin/wallet.admin.routes'));
app.use('/api/chatbot', require('./routes/common/chatbot.routes'));
app.use('/api/posts', require('./routes/common/post.routes'));
app.use('/api/messages', require('./routes/common/chat.routes'));
app.use('/api/notifications', require('./routes/common/notification.routes'));
app.use('/api/analytics', require('./routes/common/analytics.routes.js'));
app.use('/api/wallet', require('./routes/wallet'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), database: 'connected' });
});

// API Documentation - List all available endpoints
app.get('/api', (req, res) => {
  const apiEndpoints = {
    health: {
      method: 'GET',
      path: '/api/health',
      description: 'Health check and database connection status',
    },
    auth: {
      register: { method: 'POST', path: '/api/auth/register', description: 'Register new user' },
      login: { method: 'POST', path: '/api/auth/login', description: 'Login user' },
      refresh: { method: 'POST', path: '/api/auth/refresh', description: 'Refresh access token' },
      logout: { method: 'POST', path: '/api/auth/logout', description: 'Logout user' },
    },
    campaigns: {
      list: { method: 'GET', path: '/api/campaigns', description: 'Get all campaigns' },
      create: { method: 'POST', path: '/api/campaigns', description: 'Create campaign (brand only)' },
      getById: { method: 'GET', path: '/api/campaigns/:id', description: 'Get campaign by ID' },
      update: { method: 'PUT', path: '/api/campaigns/:id', description: 'Update campaign' },
      delete: { method: 'DELETE', path: '/api/campaigns/:id', description: 'Delete campaign' },
    },
    applications: {
      list: { method: 'GET', path: '/api/applications', description: 'Get all applications' },
      create: { method: 'POST', path: '/api/applications', description: 'Create application' },
      getById: { method: 'GET', path: '/api/applications/:id', description: 'Get application by ID' },
      update: { method: 'PUT', path: '/api/applications/:id', description: 'Update application status' },
      delete: { method: 'DELETE', path: '/api/applications/:id', description: 'Delete application' },
    },
    users: {
      list: { method: 'GET', path: '/api/users', description: 'Get all users' },
      search: { method: 'GET', path: '/api/users/search?q=query', description: 'Search users' },
      getById: { method: 'GET', path: '/api/users/:id', description: 'Get user by ID' },
      update: { method: 'PUT', path: '/api/users/:id', description: 'Update user profile' },
      delete: { method: 'DELETE', path: '/api/users/:id', description: 'Delete user' },
    },
    admin: {
      stats: { method: 'GET', path: '/api/admin/stats', description: 'Get platform statistics' },
      users: { method: 'GET', path: '/api/admin/users', description: 'Get all users (admin)' },
      campaigns: { method: 'GET', path: '/api/admin/campaigns', description: 'Get all campaigns (admin)' },
      analytics: { method: 'GET', path: '/api/admin/analytics', description: 'Get platform analytics' },
    },
    analytics: {
      list: { method: 'GET', path: '/api/analytics', description: 'Get analytics events' },
      create: { method: 'POST', path: '/api/analytics', description: 'Log analytics event' },
      stats: { method: 'GET', path: '/api/analytics/stats/:campaignId', description: 'Get campaign stats' },
    },
    chatbot: {
      chat: { method: 'POST', path: '/api/chatbot/chat', description: 'Send message to chatbot' },
      history: { method: 'GET', path: '/api/chatbot/history', description: 'Get chat history' },
    },
    messages: {
      conversations: { method: 'GET', path: '/api/messages/conversations', description: 'Get conversations' },
      initiate: { method: 'POST', path: '/api/messages/initiate/:userId', description: 'Brand starts chat' },
      getHistory: { method: 'GET', path: '/api/messages/:id', description: 'Get chat messages' },
      reply: { method: 'POST', path: '/api/messages/:id', description: 'Reply to chat' },
    },
    notifications: {
      list: { method: 'GET', path: '/api/notifications', description: 'Get notifications' },
      markRead: { method: 'PUT', path: '/api/notifications/:id/read', description: 'Mark as read' },
    },
  };

  res.json({
    message: 'InfluenZoo API Endpoints',
    timestamp: new Date().toISOString(),
    baseUrl: `http://localhost:${process.env.PORT || 5000}`,
    endpoints: apiEndpoints,
  });
});

// error and 404 handlers
app.use(errorMiddleware);
app.use(notFoundHandler);

/**
 * Parse MongoDB connection details from URI
 */
const parseMongoDBUri = (uri) => {
  try {
    // Parse mongodb+srv://user:pass@cluster.mongodbatlas.net/dbname or mongodb://host:port/dbname
    const url = new URL(uri);
    const hostname = url.hostname;
    const pathname = url.pathname;
    
    let clusterName = 'Local';
    let dbName = 'influenZoo';
    let port = '27017';
    
    // Extract database name
    if (pathname && pathname !== '/') {
      dbName = pathname.substring(1); // Remove leading /
    }
    
    // Extract cluster name and detect if it's MongoDB Atlas
    if (hostname.includes('mongodb.net')) {
      clusterName = hostname.split('.')[0]; // e.g., "cluster0" from "cluster0.xxxx.mongodb.net"
      port = 'MongoDB Atlas (Cloud)';
    } else {
      clusterName = hostname;
      port = url.port || '27017';
    }
    
    return { clusterName, dbName, port };
  } catch (error) {
    return { clusterName: 'Unknown', dbName: 'Unknown', port: 'Unknown' };
  }
};

const PORT = process.env.PORT || 5000;
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/influenZoo';
const { clusterName, dbName, port } = parseMongoDBUri(mongoUri);

let server = null;

const handleServerStart = () => {
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║          🚀 InfluenZoo API Server - STARTED              ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  // Server Information
  console.log('📡 SERVER INFORMATION');
  console.log('├─ 🌐 Server URL:       http://localhost:' + PORT);
  console.log('├─ 📍 Environment:      ' + (process.env.NODE_ENV || 'development'));
  console.log('└─ 📚 API Docs:         http://localhost:' + PORT + '/api\n');
  
  // Database Information
  console.log('🗄️  DATABASE INFORMATION');
  console.log('├─ 📊 Database Name:    ' + dbName);
  console.log('├─ 🏢 Cluster Name:     ' + clusterName);
  console.log('└─ 🔌 Port/Connection: ' + port + '\n');
  
  // API Routes Box
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                  📋 AVAILABLE API ROUTES                 ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log('║                                                          ║');
  console.log('║  🔐 AUTHENTICATION                                       ║');
  console.log('║    POST   /api/auth/register                             ║');
  console.log('║    POST   /api/auth/login                                ║');
  console.log('║    POST   /api/auth/refresh                              ║');
  console.log('║    POST   /api/auth/logout                               ║');
  console.log('║                                                          ║');
  console.log('║  📢 CAMPAIGNS                                            ║');
  console.log('║    GET    /api/campaigns                                 ║');
  console.log('║    GET    /api/campaigns/:id                             ║');
  console.log('║    POST   /api/campaigns                                 ║');
  console.log('║    PUT    /api/campaigns/:id                             ║');
  console.log('║    DELETE /api/campaigns/:id                             ║');
  console.log('║                                                          ║');
  console.log('║  📝 APPLICATIONS                                         ║');
  console.log('║    GET    /api/applications                              ║');
  console.log('║    GET    /api/applications/:id                          ║');
  console.log('║    POST   /api/applications                              ║');
  console.log('║    PUT    /api/applications/:id                          ║');
  console.log('║    DELETE /api/applications/:id                          ║');
  console.log('║                                                          ║');
  console.log('║  👥 USERS                                                ║');
  console.log('║    GET    /api/users                                     ║');
  console.log('║    GET    /api/users/:id                                 ║');
  console.log('║    GET    /api/users/search?q=query                      ║');
  console.log('║    PUT    /api/users/:id                                 ║');
  console.log('║    DELETE /api/users/:id                                 ║');
  console.log('║                                                          ║');
  console.log('║  👨‍💼 ADMIN                                              ║');
  console.log('║    GET    /api/admin/stats                               ║');
  console.log('║    GET    /api/admin/users                               ║');
  console.log('║    GET    /api/admin/campaigns                           ║');
  console.log('║    GET    /api/admin/analytics                           ║');
  console.log('║                                                          ║');
  console.log('║  📊 ANALYTICS                                            ║');
  console.log('║    GET    /api/analytics                                 ║');
  console.log('║    POST   /api/analytics                                 ║');
  console.log('║    GET    /api/analytics/stats/:campaignId               ║');
  console.log('║                                                          ║');
  console.log('║  🤖 CHATBOT                                              ║');
  console.log('║    POST   /api/chatbot/chat                              ║');
  console.log('║    GET    /api/chatbot/history                           ║');
  console.log('║                                                          ║');
  console.log('║  ❤️  HEALTH CHECK                                         ║');
  console.log('║    GET    /api/health                                    ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');
  
  console.log('✅ Ready to accept requests!');
  console.log('🔄 Auto-restart: ENABLED (watching for file changes)\n');
};

// Start server and handle errors
server = app.listen(PORT, handleServerStart);

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`\n⚠️  Port ${PORT} is already in use. Retrying...`);
    setTimeout(() => {
      if (server) server.close();
      server = app.listen(PORT, handleServerStart);
    }, 1000);
  } else {
    console.error('❌ Server error:', err);
    process.exit(1);
  }
});

// Graceful shutdown - SIGTERM
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

// Graceful shutdown - SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n📴 SIGINT signal received: closing HTTP server');
  if (server) {
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
});

module.exports = app;
