import { supabase } from '../database';
import bcrypt from 'bcrypt';
import { User } from '../models/user';

// Constants
const SALT_ROUNDS = 10;

/**
 * Register a new user in our users table (not using Supabase Auth)
 */
export const registerUser = async (
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
      .select()
      .single();
    
    if (error) {
      return { user: null, error };
    }
    
    // Strip password hash before returning user object
    const { password_hash, ...userWithoutPassword } = data;
    
    return { user: userWithoutPassword as User, error: null };
  } catch (error) {
    return { user: null, error };
  }
};

/**
 * Login a user with email and password
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User | null; token: string | null; error: any }> => {
  try {
    // Find the user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      return { user: null, token: null, error: { message: 'Invalid email or password' } };
    }
    
    // Compare password with stored hash
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!passwordMatch) {
      return { user: null, token: null, error: { message: 'Invalid email or password' } };
    }
    
    // Use Supabase to create a custom JWT token
    // Note: In a production app, you might use a proper JWT library
    // This is a simplified version for the demo
    const { data: { session }, error: sessionError } = await supabase.auth.signInWithPassword({
      email, 
      password
    });
    
    if (sessionError) {
      // Fall back to a session without using Supabase Auth directly
      // In a real app, you'd handle this more robustly
      const dummyToken = btoa(JSON.stringify({
        user_id: user.id,
        email: user.email,
        role: user.role,
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
      }));
      
      // Strip password hash before returning user object
      const { password_hash, ...userWithoutPassword } = user;
      
      return { 
        user: userWithoutPassword as User, 
        token: dummyToken, 
        error: null 
      };
    }
    
    // Strip password hash before returning user object
    const { password_hash, ...userWithoutPassword } = user;
    
    return { 
      user: userWithoutPassword as User, 
      token: session?.access_token || null,
      error: null 
    };
  } catch (error) {
    return { user: null, token: null, error };
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id: string): Promise<{ user: User | null; error: any }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at, updated_at')
      .eq('id', id)
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
 * Update user information
 */
export const updateUser = async (
  id: string,
  updates: Partial<Omit<User, 'id' | 'created_at'>>
): Promise<{ user: User | null; error: any }> => {
  try {
    // Handle password update separately if it's included
    if ('password' in updates) {
      const password = updates.password as string;
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
 * Change user password
 */
export const changePassword = async (
  id: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error: any }> => {
  try {
    // Get the current user including password hash
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (userError || !user) {
      return { success: false, error: { message: 'User not found' } };
    }
    
    // Verify current password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
    
    if (!passwordMatch) {
      return { success: false, error: { message: 'Current password is incorrect' } };
    }
    
    // Hash the new password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    
    // Update the password
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: newPasswordHash,
        updated_at: new Date()
      })
      .eq('id', id);
    
    if (updateError) {
      return { success: false, error: updateError };
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Delete user
 */
export const deleteUser = async (id: string): Promise<{ success: boolean; error: any }> => {
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