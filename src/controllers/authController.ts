import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { UserRegistration, UserLogin, UserUpdate } from '../models/user';

/**
 * Register a new user
 */
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role }: UserRegistration = req.body;
    
    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Validate role
    const validRoles = ['admin', 'manager', 'sales_rep'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const { user, error } = await authService.registerUser(
      email,
      password,
      first_name,
      last_name,
      role as 'admin' | 'manager' | 'sales_rep'
    );
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Registration failed' });
    }
    
    return res.status(201).json({ user });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password }: UserLogin = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    
    const { user, token, error } = await authService.loginUser(email, password);
    
    if (error) {
      return res.status(401).json({ error: error.message || 'Authentication failed' });
    }
    
    // Set JWT as HTTP-only cookie for better security
    if (token) {
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
    }
    
    return res.status(200).json({ user, token });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req: Request, res: Response) => {
  try {
    // User ID should be added by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { user, error } = await authService.getUserById(userId);
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to get user profile' });
    }
    
    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req: Request, res: Response) => {
  try {
    // User ID should be added by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const updates: UserUpdate = req.body;
    
    // Prevent role updates through this endpoint for security
    if (updates.role) {
      delete updates.role;
    }
    
    const { user, error } = await authService.updateUser(userId, updates);
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to update profile' });
    }
    
    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Change user password
 */
export const changePassword = async (req: Request, res: Response) => {
  try {
    // User ID should be added by the auth middleware
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    // Validate required fields
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    
    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }
    
    const { success, error } = await authService.changePassword(userId, currentPassword, newPassword);
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to change password' });
    }
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (err: any) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Logout user
 */
export const logout = (req: Request, res: Response) => {
  try {
    // Clear the JWT cookie
    res.clearCookie('token');
    
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (err: any) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 