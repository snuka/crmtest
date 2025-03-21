import { supabaseAdmin } from './database';

const runMigration = async () => {
  try {
    console.log('Adding document_url column to customers table...');
    
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Admin client not available. Make sure SUPABASE_SERVICE_KEY is set in .env');
      return;
    }
    
    // Execute raw SQL to add the column if it doesn't exist
    const { data, error } = await supabaseAdmin.from('customers').select('*').limit(1);
    
    if (error) {
      console.error('Error accessing customers table:', error);
      return;
    }
    
    // Check if document_url column already exists
    const hasDocumentUrl = data.length > 0 && 'document_url' in data[0];
    
    if (hasDocumentUrl) {
      console.log('document_url column already exists in customers table');
      return;
    }
    
    // Add the document_url column
    console.log('Adding document_url column...');
    const { error: alterError } = await supabaseAdmin.rpc('pgclient_exec', {
      query: 'ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_url TEXT;'
    });
    
    if (alterError) {
      console.error('Error adding column:', alterError);
      
      // If RPC method failed, try querying directly
      console.log('Trying direct query...');
      const { error: directError } = await supabaseAdmin.auth.admin.getUserById('00000000-0000-0000-0000-000000000000');
      
      // Using .auth.admin is just to check if admin access works
      if (directError) {
        console.error('Admin client not properly authorized:', directError);
        console.log('\nSolution 1: Try adding the column manually through the Supabase dashboard SQL editor:');
        console.log('ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_url TEXT;');
        console.log('\nSolution 2: Make sure your SUPABASE_SERVICE_KEY is correctly set in .env file');
      }
      return;
    }
    
    console.log('document_url column has been added to the customers table.');
  } catch (error) {
    console.error('Migration failed:', error);
    console.log('\nPlease add the column manually through the Supabase dashboard SQL editor:');
    console.log('ALTER TABLE customers ADD COLUMN IF NOT EXISTS document_url TEXT;');
  }
};

runMigration(); 