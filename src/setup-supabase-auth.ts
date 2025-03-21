import { supabase } from './database';
import dotenv from 'dotenv';
import { FOLDERS } from './services/storageService';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Admin credentials - using a more standard email format
const adminEmail = 'test.user@gmail.com';
const adminPassword = 'TestPassword123!';

async function setupSupabaseAuth() {
  console.log('Setting up Supabase Auth and testing storage access...');
  
  // Step 1: Check if the user already exists in Supabase Auth
  console.log(`Checking if Supabase Auth user ${adminEmail} exists...`);
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });
  
  if (signInError) {
    console.log('User does not exist or credentials are invalid, creating new user...');
    
    // Step 2: Create a new user in Supabase Auth
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signUpError) {
      console.error('Failed to create user in Supabase Auth:', signUpError.message);
      process.exit(1);
    }
    
    console.log('User created successfully in Supabase Auth');
    console.log('User ID:', newUser?.id);
    console.log('You may need to verify the email address before proceeding');
    
    // Exit here and wait for email verification if required
    if (newUser?.identities?.length === 0) {
      console.log('Please check your email to confirm your account, then run this script again');
      process.exit(0);
    }
  } else {
    console.log('Successfully authenticated with Supabase Auth');
    console.log('User ID:', user?.id);
  }
  
  // Step 3: Test storage access
  console.log('\nTesting access to each folder with proper permissions...');
  
  // Test READ folder
  console.log(`\nListing files in ${FOLDERS.READ} folder (SELECT policy)...`);
  const { data: readFiles, error: readError } = await supabase.storage
    .from('storage')
    .list(FOLDERS.READ);
    
  if (readError) {
    console.error('READ folder error:', readError.message);
  } else {
    console.log('READ folder access successful');
    console.log(`Files in folder: ${readFiles.length > 0 ? readFiles.length : 'none'}`);
  }
  
  // Create a test file
  const testFilePath = path.join(__dirname, '../test-upload.txt');
  const testContent = 'This is a test file for Supabase storage. Created at: ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    // Test UPLOAD folder
    console.log(`\nUploading file to ${FOLDERS.UPLOAD} folder (INSERT policy)...`);
    const fileBuffer = fs.readFileSync(testFilePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('storage')
      .upload(`${FOLDERS.UPLOAD}/test-upload.txt`, fileBuffer, {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      });
      
    if (uploadError) {
      console.error('UPLOAD folder error:', uploadError.message);
    } else {
      console.log('File uploaded successfully to UPLOAD folder');
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('storage')
        .getPublicUrl(`${FOLDERS.UPLOAD}/test-upload.txt`);
        
      console.log('File URL:', urlData.publicUrl);
      
      // Test UPDATE folder by copying the file there
      console.log(`\nCopying file to ${FOLDERS.UPDATE} folder (UPDATE policy)...`);
      
      const { data: copyData, error: copyError } = await supabase.storage
        .from('storage')
        .copy(`${FOLDERS.UPLOAD}/test-upload.txt`, `${FOLDERS.UPDATE}/test-upload.txt`);
        
      if (copyError) {
        console.error('UPDATE folder error:', copyError.message);
      } else {
        console.log('File copied successfully to UPDATE folder');
        
        // Test DELETE folder
        console.log(`\nDeleting file from ${FOLDERS.DELETE} folder (DELETE policy)...`);
        
        // First copy to delete folder
        const { error: copyToDeleteError } = await supabase.storage
          .from('storage')
          .copy(`${FOLDERS.UPDATE}/test-upload.txt`, `${FOLDERS.DELETE}/test-upload.txt`);
          
        if (copyToDeleteError) {
          console.error('Failed to copy to DELETE folder:', copyToDeleteError.message);
        } else {
          console.log('File copied to DELETE folder');
          
          // Now delete from there
          const { error: deleteError } = await supabase.storage
            .from('storage')
            .remove([`${FOLDERS.DELETE}/test-upload.txt`]);
            
          if (deleteError) {
            console.error('DELETE folder error:', deleteError.message);
          } else {
            console.log('File deleted successfully from DELETE folder');
          }
        }
      }
    }
    
    // Clean up local test file
    fs.unlinkSync(testFilePath);
    console.log('Removed local test file');
    
  } catch (err) {
    console.error('File operation error:', err);
  }
  
  console.log('\nSupabase Auth and Storage test completed!');
}

// Run the setup and test
setupSupabaseAuth()
  .catch(err => {
    console.error('Unexpected error during setup:', err);
    process.exit(1);
  }); 