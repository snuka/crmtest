import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// JWT secret key (should be in environment variables for production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  // Get token from Authorization header or cookies
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  const tokenFromCookie = req.cookies && req.cookies.token;
  
  const token = tokenFromHeader || tokenFromCookie;
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as User;
    
    // Add the user to the request object
    req.user = decoded;
    
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Admin role required.' });
  }
  
  next();
};

/**
 * Middleware to check if user has manager or admin role
 */
export const isManagerOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Manager or admin role required.' });
  }
  
  next();
}; 