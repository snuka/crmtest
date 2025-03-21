import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './database';
import cookieParser from 'cookie-parser';
import customerRoutes from './routes/customerRoutes';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import { initializeAdminUser } from './services/adminService';
import { initializeStorage } from './services/storageService';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(express.json());
app.use(cookieParser());

// Enable CORS for frontend development
app.use((req, res, next) => {
  // In production, CORS isn't needed as both frontend and backend are served from the same origin
  if (!isProduction) {
    // Get origin from request
    const origin = req.headers.origin;
    
    // Allow the origin that sent the request
    if (origin) {
      res.header('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
  }
  next();
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Test endpoint
app.get('/api/health', async (_req, res) => {
  const connectionResult = await testConnection();
  res.json({
    status: 'ok',
    database: connectionResult
  });
});

// Serve static frontend files in production
if (isProduction) {
  // Serve static files from the React frontend app
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Handle any requests that don't match the API routes
  app.get('*', (_req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: !isProduction ? err.message : undefined 
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  
  // Test database connection on startup
  const connectionResult = await testConnection();
  console.log('Database connection test:', connectionResult);
  
  // Initialize storage bucket
  try {
    const { success, error } = await initializeStorage();
    if (success) {
      console.log('Storage bucket initialized successfully');
    } else {
      console.error('Error initializing storage bucket:', error);
    }
  } catch (err) {
    console.error('Failed to initialize storage bucket:', err);
  }
  
  // Initialize admin user if no users exist
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
  
  try {
    const { success, error } = await initializeAdminUser(
      adminEmail,
      adminPassword,
      'Admin',
      'User'
    );
    
    if (success) {
      console.log(`Admin user initialized with email: ${adminEmail}`);
    } else if (error && error.message !== 'Users already exist, admin not created') {
      console.error('Error initializing admin user:', error);
    }
  } catch (err) {
    console.error('Failed to initialize admin user:', err);
  }
}); 