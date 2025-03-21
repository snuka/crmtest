import { supabase } from '../database';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

// Constants
const SALT_ROUNDS = 10;

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (): Promise<{ users: User[] | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at, updated_at');
    
    if (error) {
      return { users: null, error };
    }
    
    return { users: data as User[], error: null };
  } catch (error) {
    return { users: null, error };
  }
};

/**
 * Create a new user (admin only)
 */
export const createUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'admin' | 'manager' | 'sales_rep'
): Promise<{ user: User | null; error: any }> => {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (existingUser) {
      return { user: null, error: { message: 'User with this email already exists' } };
    }
    
    // Insert the new user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName,
        last_name: lastName,
        role,
        created_at: new Date(),
        updated_at: new Date()
      })
      .select('id, email, first_name, last_name, role, created_at, updated_at')
      .single();
    
    if (error) {
      return { user: null, error };
    }
    
    return { user: data as User, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

/**
 * Update a user (admin only)
 */
export const updateUserById = async (
  id: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>> & { password_hash?: string }
): Promise<{ user: User | null; error: any }> => {
  try {
    // Handle password update separately if it's included
    if ('password' in updates && updates.password) {
      const password = updates.password;
      delete updates.password;
      
      // Hash the password and add it to updates
      updates.password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    }
    
    updates.updated_at = new Date();
    
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select('id, email, first_name, last_name, role, created_at, updated_at')
      .single();
    
    if (error) {
      return { user: null, error };
    }
    
    return { user: data as User, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

/**
 * Delete a user (admin only)
 */
export const deleteUserById = async (id: string): Promise<{ success: boolean; error: any }> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Initialize admin user if no users exist
 */
export const initializeAdminUser = async (
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; error: any }> => {
  try {
    // Check if any users exist
    const { data, error } = await supabase
      .from('users')
      .select('count');
    
    if (error) {
      return { success: false, error };
    }
    
    // Only create admin if no users exist
    const userCount = data.length > 0 ? data[0].count : 0;
    
    if (userCount === 0) {
      const { user, error: createError } = await createUser(
        email,
        password,
        firstName,
        lastName,
        'admin'
      );
      
      if (createError) {
        return { success: false, error: createError };
      }
      
      return { success: true, error: null };
    }
    
    return { success: false, error: { message: 'Users already exist, admin not created' } };
  } catch (error) {
    return { success: false, error };
  }
}; 