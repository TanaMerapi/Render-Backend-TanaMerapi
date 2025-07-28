// Updated index.js with improved CORS configuration

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import db from './config/database.js';
import AuthRoute from './routes/AuthRoute.js';
import SlideRoute from './routes/SlideRoute.js';
import MenuItemRoute from './routes/MenuItemRoute.js';
import PackageRoute from './routes/PackageRoute.js';
import PromotionRoute from './routes/PromotionRoute.js';
import PromotionPackageRoute from './routes/PromotionPackageRoute.js';
import SocialMediaRoute from './routes/SocialMediaRoute.js';
import FileUploadRoute from './routes/FileUploadRoute.js';
import SiteSettingRoute from './routes/SiteSettingRoute.js';
import initPromotionScheduler from './utils/PromotionScheduler.js';
import { verifyCloudinaryConnection } from './config/cloudinary.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dotenv
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.static('public'));

// Get allowed origins from environment or set defaults
const getAllowedOrigins = () => {
  const origins = [];
  
  // Add production frontend URL
  if (process.env.CLIENT_URL) {
    origins.push(process.env.CLIENT_URL);
  }
  
  // Add Vercel frontend explicitly
  origins.push('https://vercel-frontend-tana-merapi.vercel.app');
  
  // Add localhost for development
  if (process.env.NODE_ENV !== 'production') {
    origins.push('http://localhost:3000');
  }
  
  // Make sure we have at least one origin
  if (origins.length === 0) {
    origins.push('*'); // Allow all origins as fallback (not recommended for production)
  }
  
  console.log('Allowed CORS origins:', origins);
  return origins;
};

// Configure CORS with proper credentials support
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Origin',
    'Accept',
    'X-Requested-With',
    'Cookie',
    'Set-Cookie',
    'Access-Control-Allow-Credentials'
  ],
  exposedHeaders: ['Set-Cookie']
};

// Apply CORS middleware
app.use(cors(corsOptions));

// CORS pre-flight for all routes
app.options('*', cors(corsOptions));

// Diagnostic route to check API status
app.get('/', (req, res) => {
  res.json({ 
    message: 'Tanah Merapi API is running',
    env: process.env.NODE_ENV,
    version: '1.0.0',
    clientUrl: process.env.CLIENT_URL,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', AuthRoute);
app.use('/api/slides', SlideRoute);
app.use('/api/menu-items', MenuItemRoute);
app.use('/api/packages', PackageRoute);
app.use('/api/promotions', PromotionRoute);
app.use('/api/promotion-packages', PromotionPackageRoute);
app.use('/api/social-media', SocialMediaRoute);
app.use('/api/upload', FileUploadRoute);
app.use('/api/site-settings', SiteSettingRoute);

// Debug route for checking request headers
app.get('/api/debug/headers', (req, res) => {
  res.json({
    headers: req.headers,
    origin: req.headers.origin,
    host: req.headers.host,
    method: req.method
  });
});

// Debug route for Cloudinary
app.get('/api/debug/cloudinary', async (req, res) => {
  const isConnected = await verifyCloudinaryConnection();
  res.json({
    connected: isConnected,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKeySet: !!process.env.CLOUDINARY_API_KEY,
    apiSecretSet: !!process.env.CLOUDINARY_API_SECRET
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  
  // Handle file size limits exceeded
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ 
      message: 'File too large, maximum size is 5MB' 
    });
  }
  
  // Handle multer errors
  if (err.name === 'MulterError') {
    return res.status(400).json({ 
      message: `Upload error: ${err.message}` 
    });
  }
  
  // Handle CORS errors
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      message: 'CORS policy violation',
      error: err.message
    });
  }
  
  // Default error response
  res.status(500).json({ 
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Database connection and server start
(async () => {
  try {
    // Connect to database
    await db.authenticate();
    console.log('PostgreSQL database connected...');

    // Sync models (in development mode)
    if (process.env.NODE_ENV !== 'production') {
      // Force: true will drop tables, use with caution
      // alter: true will apply changes but preserve data
      await db.sync({ alter: true });
      console.log('Database models synchronized');
    }
    
    // Initialize promotion scheduler
    initPromotionScheduler();
    console.log('Promotion scheduler initialized');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Frontend URL: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
      console.log('Image storage: Cloudinary');
    });
  } catch (error) {
    console.error('Connection error:', error);
    process.exit(1); // Exit with error code
  }
})();

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Application specific logging, throwing an error, or other logic here
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Application specific logging, throwing an error, or other logic here
  process.exit(1); // Exit with error code
});