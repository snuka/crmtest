import { supabaseAdmin } from './database';
import { supabase } from './database';
import { FOLDERS } from './services/storageService';
import fs from 'fs';
import path from 'path';

// Test credentials
const testEmail = 'test.user2@gmail.com';
const testPassword = 'TestPassword123!';

/**
 * This script performs a simpler test of storage permissions after
 * the folder structure has been created by the admin
 */
async function testStoragePolicies() {
  console.log('Testing Supabase Storage policies with authenticated user...');
  
  // Step 1: Authenticate
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
  
  // Step 2: Create a test file for each operation
  const testFilePath = path.join(__dirname, '../test-policy.txt');
  const testContent = 'Testing storage policies - ' + new Date().toISOString();
  
  fs.writeFileSync(testFilePath, testContent);
  const fileBuffer = fs.readFileSync(testFilePath);
  
  console.log('\nTesting READ policy...');
  // Use admin client to add a file to the READ folder
  const { data: readFileData, error: readUploadError } = await supabaseAdmin!.storage
    .from('storage')
    .upload(`${FOLDERS.READ}/admin-created-file.txt`, fileBuffer, {
      contentType: 'text/plain',
      upsert: true
    });
    
  if (readUploadError) {
    console.error('Error uploading test file to READ folder:', readUploadError.message);
  } else {
    console.log('Admin uploaded file to READ folder');
    
    // Now try to read it with the normal authenticated client
    const { data: readResult, error: readError } = await supabase.storage
      .from('storage')
      .list(FOLDERS.READ);
      
    if (readError) {
      console.error('READ policy test failed:', readError.message);
    } else {
      console.log('READ policy test successful!');
      console.log('Files in READ folder:', readResult.map(f => f.name).join(', '));
    }
  }
  
  // Test UPLOAD policy
  console.log('\nTesting UPLOAD policy...');
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('storage')
    .upload(`${FOLDERS.UPLOAD}/user-created-file.txt`, fileBuffer, {
      contentType: 'text/plain'
    });
    
  if (uploadError) {
    console.error('UPLOAD policy test failed:', uploadError.message);
  } else {
    console.log('UPLOAD policy test successful!');
    console.log('Uploaded file path:', uploadData.path);
    
    // Verify with admin client
    const { data: uploadVerify, error: verifyError } = await supabaseAdmin!.storage
      .from('storage')
      .list(FOLDERS.UPLOAD);
      
    if (verifyError) {
      console.error('Error verifying upload:', verifyError.message);
    } else {
      console.log('Files in UPLOAD folder:', uploadVerify.map(f => f.name).join(', '));
    }
  }
  
  // Cleanup
  fs.unlinkSync(testFilePath);
  console.log('\nTest completed');
}

// Run the test
testStoragePolicies()
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 