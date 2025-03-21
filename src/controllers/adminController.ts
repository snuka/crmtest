import { Request, Response } from 'express';
import * as adminService from '../services/adminService';

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { users, error } = await adminService.getAllUsers();
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to get users' });
    }
    
    return res.status(200).json({ users });
  } catch (err: any) {
    console.error('Get all users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create new user (admin only)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, last_name, role } = req.body;
    
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
    
    const { user, error } = await adminService.createUser(
      email,
      password,
      first_name,
      last_name,
      role as 'admin' | 'manager' | 'sales_rep'
    );
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to create user' });
    }
    
    return res.status(201).json({ user });
  } catch (err: any) {
    console.error('Create user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update user by ID (admin only)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Prevent empty updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    
    const { user, error } = await adminService.updateUserById(id, updates);
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to update user' });
    }
    
    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Update user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete user by ID (admin only)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { success, error } = await adminService.deleteUserById(id);
    
    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to delete user' });
    }
    
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (err: any) {
    console.error('Delete user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 