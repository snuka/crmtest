import { supabase } from './database';
import { FOLDERS } from './services/storageService';

// Test credentials
const testEmail = 'test.user2@gmail.com';
const testPassword = 'TestPassword123!';

async function createFolderStructure() {
  console.log('Creating folder structure in Supabase storage...');
  
  // First authenticate
  console.log(`Authenticating with Supabase as ${testEmail}...`);
  const { data, error } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword
  });
  
  if (error) {
    console.error('Authentication failed:', error.message);
    process.exit(1);
  }
  
  console.log('Authentication successful');
  console.log('User ID:', data.user?.id);
  
  // Create empty files in each folder to ensure they exist
  console.log('\nCreating folders...');
  
  for (const [folderType, folderName] of Object.entries(FOLDERS)) {
    console.log(`Creating ${folderType} folder: ${folderName}`);
    
    // Creating an empty placeholder file in each folder
    const { data: folderData, error: folderError } = await supabase.storage
      .from('storage')
      .upload(`${folderName}/.placeholder`, new Uint8Array(0), {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (folderError) {
      console.error(`Error creating ${folderType} folder:`, folderError.message);
    } else {
      console.log(`Successfully created ${folderType} folder`);
    }
  }
  
  console.log('\nListing all folders in the bucket...');
  const { data: rootList, error: rootError } = await supabase.storage
    .from('storage')
    .list('');
    
  if (rootError) {
    console.error('Error listing root folder:', rootError.message);
  } else {
    console.log('Root folder contents:');
    if (rootList.length === 0) {
      console.log('No files or folders found in root');
    } else {
      rootList.forEach(item => {
        console.log(`- ${item.name} (${item.id})`);
      });
    }
  }
  
  console.log('\nFolder structure creation completed!');
}

// Run the script
createFolderStructure()
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 