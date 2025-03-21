import { 
  FOLDERS, 
  initializeStorage, 
  authenticateWithSupabase,
  isAuthenticated,
  getAuthUser
} from './services/storageService';
import { supabase } from './database';
import fs from 'fs';
import path from 'path';

// Test credentials - using a different email
const testEmail = 'test.user2@gmail.com';
const testPassword = 'TestPassword123!';

async function testAuthenticatedStorage() {
  console.log('Testing Supabase Storage with authenticated user...');
  
  // Step 1: Check if already authenticated
  let authenticated = await isAuthenticated();
  
  if (!authenticated) {
    console.log(`Authenticating with Supabase as ${testEmail}...`);
    const { success, error } = await authenticateWithSupabase(testEmail, testPassword);
    
    if (!success) {
      console.log('Authentication failed:', error.message);
      console.log('Attempting to sign up...');
      
      // Try to sign up the user
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword
      });
      
      if (signUpError) {
        console.error('Failed to sign up:', signUpError.message);
        process.exit(1);
      }
      
      console.log('Successfully signed up new user:', user?.id);
      
      // Try to authenticate again
      console.log('Attempting to authenticate with new user...');
      const { success: authSuccess, error: authError } = await authenticateWithSupabase(testEmail, testPassword);
      
      if (!authSuccess) {
        console.error('Still cannot authenticate after signup:', authError.message);
        process.exit(1);
      }
      
      authenticated = true;
    } else {
      authenticated = true;
    }
  }
  
  // Get current user
  const user = await getAuthUser();
  console.log(`Authenticated as ${user?.email} (ID: ${user?.id})`);
  
  // Step 2: Initialize storage
  const { success, error } = await initializeStorage();
  
  if (!success) {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  }
  
  // Step 3: Test storage operations with each policy folder
  console.log('\nTesting policy-based storage operations...');
  
  // Create a test file
  const testFilePath = path.join(__dirname, '../test-upload.txt');
  const testContent = 'This is an authenticated test file. Created at: ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    // Test READ folder
    console.log(`\nListing files in ${FOLDERS.READ} folder (SELECT policy)...`);
    const { data: readFiles, error: readError } = await supabase.storage
      .from('storage')
      .list(FOLDERS.READ);
      
    if (readError) {
      console.error('READ operation failed:', readError.message);
    } else {
      console.log('READ operation successful!');
      console.log(`Files in folder: ${readFiles.length}`);
    }
    
    // Test UPLOAD folder
    console.log(`\nUploading file to ${FOLDERS.UPLOAD} folder (INSERT policy)...`);
    const fileBuffer = fs.readFileSync(testFilePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('storage')
      .upload(`${FOLDERS.UPLOAD}/test-file-${Date.now()}.txt`, fileBuffer, {
        contentType: 'text/plain',
        upsert: false
      });
      
    if (uploadError) {
      console.error('UPLOAD operation failed:', uploadError.message);
    } else {
      console.log('UPLOAD operation successful!');
      const { data: urlData } = supabase.storage
        .from('storage')
        .getPublicUrl(`${FOLDERS.UPLOAD}/${uploadData.path.split('/').pop()}`);
        
      console.log('Uploaded file URL:', urlData.publicUrl);
      
      // Test UPDATE folder
      console.log(`\nUpdating file in ${FOLDERS.UPDATE} folder (UPDATE policy)...`);
      
      // First copy the file to UPDATE folder
      const { data: copyData, error: copyError } = await supabase.storage
        .from('storage')
        .copy(
          `${FOLDERS.UPLOAD}/${uploadData.path.split('/').pop()}`, 
          `${FOLDERS.UPDATE}/test-update-${Date.now()}.txt`
        );
        
      if (copyError) {
        console.error('UPDATE operation failed (copy):', copyError.message);
      } else {
        console.log('UPDATE operation successful!');
        
        // Test DELETE folder
        console.log(`\nDeleting file from ${FOLDERS.DELETE} folder (DELETE policy)...`);
        
        // First copy to DELETE folder
        const { data: copyToDeleteData, error: copyToDeleteError } = await supabase.storage
          .from('storage')
          .copy(
            `${FOLDERS.UPDATE}/${copyData.path.split('/').pop()}`,
            `${FOLDERS.DELETE}/test-delete-${Date.now()}.txt`
          );
          
        if (copyToDeleteError) {
          console.error('DELETE operation failed (copy):', copyToDeleteError.message);
        } else {
          // Now try to delete
          const { data: deleteData, error: deleteError } = await supabase.storage
            .from('storage')
            .remove([`${FOLDERS.DELETE}/${copyToDeleteData.path.split('/').pop()}`]);
            
          if (deleteError) {
            console.error('DELETE operation failed:', deleteError.message);
          } else {
            console.log('DELETE operation successful!');
          }
        }
      }
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log(`\nRemoved local test file`);
    
  } catch (err) {
    console.error('File operation error:', err);
  }
  
  console.log('\nAuthenticated storage test completed!');
}

// Run the test
testAuthenticatedStorage()
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 