const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config();

const app = express();

// ============================================
// ✅ CORS - Allow both local and production
// ============================================
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:3004',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5500',
  'http://localhost:8080',
  // Add your Render frontend URL after deployment
  'https://citizen-management-frontend.onrender.com',
  'https://village-citizen-frontend.onrender.com',
  'https://citizen-management-systems.onrender.com'
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS blocked request from origin: ${origin}`);
      callback(null, true); // Still allow but log warning
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ============================================
// ✅ Middleware
// ============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ============================================
// ✅ Health Check Endpoints
// ============================================

// Root health check - works at /health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5001,
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API health check - works at /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'API Server running',
    port: process.env.PORT || 5001,
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV
  });
});

// Root endpoint - basic welcome message
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Village Citizen Management System API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      auth: '/api/auth',
      families: '/api/families',
      members: '/api/members',
      schemes: '/api/schemes',
      reports: '/api/reports',
      dashboard: '/api/dashboard'
    },
    documentation: 'https://github.com/your-repo/backend'
  });
});

// ============================================
// ✅ Routes
// ============================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/families', require('./routes/familyRoutes'));
app.use('/api/members', require('./routes/memberRoutes'));
app.use('/api/schemes', require('./routes/schemeRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// ============================================
// ✅ Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// ✅ 404 Handler
// ============================================
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.originalUrl}`,
    availableEndpoints: [
      '/',
      '/health',
      '/api/health',
      '/api/auth/*',
      '/api/families/*',
      '/api/members/*',
      '/api/schemes/*',
      '/api/reports/*',
      '/api/dashboard/*'
    ]
  });
});

// ============================================
// ✅ Database Connection & Server Start
// ============================================
const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/citizen_data';

// Log environment on startup
console.log('='.repeat(60));
console.log('🚀 Starting Village Citizen Management Backend');
console.log('='.repeat(60));
console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 PORT: ${PORT}`);
console.log(`🗄️  MongoDB URI: ${MONGO_URI ? MONGO_URI.replace(/\/\/(.*):(.*)@/, '//***:***@') : 'Not set'}`);
console.log('='.repeat(60));

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
.then(() => {
  console.log('✅ MongoDB Connected successfully');
  console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
  
  // ✅ CRITICAL FOR RENDER: Bind to '0.0.0.0'
  app.listen(PORT, '0.0.0.0', () => {
    console.log('='.repeat(60));
    console.log(`✅ Server started successfully!`);
    console.log(`🚀 Server running on port: ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: https://citizen-management-systems.onrender.com/health`);
    console.log(`🔗 API Health check: https://citizen-management-systems.onrender.com/api/health`);
    
    if (process.env.NODE_ENV === 'production') {
      console.log(`🌐 API URL: https://citizen-management-systems.onrender.com/api`);
    } else {
      console.log(`🌐 Local API URL: http://localhost:${PORT}/api`);
    }
    console.log('='.repeat(60));
  });
})
.catch(err => {
  console.error('='.repeat(60));
  console.error('❌ MongoDB Connection Error:');
  console.error(`   Message: ${err.message}`);
  console.error('='.repeat(60));
  console.error('💡 Troubleshooting tips:');
  console.error('   1. Check if MONGO_URI environment variable is set correctly');
  console.error('   2. Verify your MongoDB Atlas IP whitelist includes 0.0.0.0/0');
  console.error('   3. Check if username/password are correct');
  console.error('   4. Make sure the database name exists');
  console.error('='.repeat(60));
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('⚠️  Received SIGINT. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('⚠️  Received SIGTERM. Closing MongoDB connection...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});