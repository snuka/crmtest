import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Ensure environment variables are set
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

// Test the connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('customers').select('count').single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Connected to Supabase successfully, but the "customers" table does not exist yet.');
        return { success: true, message: 'Connected to Supabase but customers table not found' };
      }
      throw error;
    }
    
    return { success: true, message: 'Connected to Supabase successfully', data };
  } catch (error) {
    console.error('Failed to connect to Supabase:', error);
    return { success: false, message: `Connection failed: ${error}` };
  }
}; 