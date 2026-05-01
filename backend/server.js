const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const { requestLogger } = require('./middleware/common/logger.middleware');
const { errorMiddleware, notFoundHandler } = require('./middleware/common/error.middleware');
const { startAnalyticsWorker, stopAnalyticsWorker } = require('./services/common/analyticsWorker.service');

dotenv.config();

const app = express();
const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Connect to database
connectDB();
startAnalyticsWorker();

// Middleware
app.use(cors({
  origin: corsOrigins.length === 1 ? corsOrigins[0] : corsOrigins,
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
app.use('/api/admin', require('./routes/admin/admin.routes')); // Badge routes included here
app.use('/api/admin/wallet', require('./routes/admin/wallet.admin.routes'));
app.use('/api/chatbot', require('./routes/common/chatbot.routes'));
app.use('/api/brand-logos', require('./routes/common/brandLogo.routes'));
app.use('/api/posts', require('./routes/common/post.routes'));
app.use('/api/messages', require('./routes/common/chat.routes'));
app.use('/api/notifications', require('./routes/common/notification.routes'));
app.use('/api/analytics', require('./routes/common/analytics.routes.js'));
app.use('/api/wallet', require('./routes/wallet'));

// Direct mount for brand logos to ensure they work if routes fail
const brandLogoController = require('./controllers/admin/brandLogo.controller');
app.get('/api/brand-logos/settings', brandLogoController.getBrandLogoSettings);
app.get('/api/brand-logos', brandLogoController.getPublicBrandLogos);

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
    }
  };

  res.json({
    message: 'Welcome to Influnzoo API',
    version: '1.0.0',
    endpoints: apiEndpoints,
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
