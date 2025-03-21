import { initializeStorage } from './services/storageService';
import { supabase } from './database';

async function testStorage() {
  console.log('Testing Supabase Storage connection...');
  
  // Initialize storage
  const { success, error } = await initializeStorage();
  
  if (!success) {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  }
  
  console.log('Storage initialization successful');
  
  // List files in the storage bucket
  const { data: files, error: listError } = await supabase.storage
    .from('storage')
    .list('customers');
    
  if (listError) {
    console.error('Error listing files:', listError);
    process.exit(1);
  }
  
  console.log('Files in the storage bucket:');
  if (files.length === 0) {
    console.log('No files found in the bucket.');
  } else {
    files.forEach(file => {
      console.log(`- ${file.name} (${file.metadata?.size || 'unknown size'})`);
    });
  }
  
  console.log('\nStorage test completed successfully!');
}

// Run the test
testStorage()
  .catch(err => {
    console.error('Unexpected error during storage test:', err);
    process.exit(1);
  }); 