import { supabase, supabaseAdmin } from './database';
import fs from 'fs';
import path from 'path';

// Test credentials
const testEmail = 'test.user2@gmail.com';
const testPassword = 'TestPassword123!';

/**
 * A simplified test that tries to upload to the root of the storage bucket
 */
async function testDirectUpload() {
  console.log('Testing direct upload to Supabase Storage...');
  
  // Authenticate
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
  
  // Get bucket info from admin
  const { data: buckets, error: listError } = await supabaseAdmin!.storage.listBuckets();
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }
  
  const storageBucket = buckets.find(bucket => bucket.name === 'storage');
  if (!storageBucket) {
    console.error('Storage bucket not found!');
    process.exit(1);
  }
  
  console.log('Storage bucket ID:', storageBucket.id);
  
  // Try a direct upload to the root of the bucket
  console.log('\nTesting direct upload to root...');
  
  // Create a simple test file
  const testFilePath = path.join(__dirname, '../test-direct.txt');
  const testContent = 'This is a direct upload test. Created at: ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    const fileBuffer = fs.readFileSync(testFilePath);
    
    // Try different approaches
    console.log('\nApproach 1: Using authenticated client with path');
    const { data: upload1, error: error1 } = await supabase.storage
      .from('storage')
      .upload(`direct-test-${Date.now()}.txt`, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (error1) {
      console.error('Upload failed (approach 1):', error1.message);
    } else {
      console.log('Upload successful!');
      console.log('Path:', upload1.path);
    }
    
    // Check if admin client works
    console.log('\nApproach 2: Using admin client for comparison');
    const { data: adminUpload, error: adminError } = await supabaseAdmin!.storage
      .from('storage')
      .upload(`admin-test-${Date.now()}.txt`, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (adminError) {
      console.error('Admin upload failed:', adminError.message);
    } else {
      console.log('Admin upload successful!');
      console.log('Path:', adminUpload.path);
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\nRemoved local test file');
    
  } catch (err) {
    console.error('File operation error:', err);
  }
  
  console.log('\nTest completed!');
}

// Run the test
testDirectUpload()
  .catch(err => {
    console.error('Unexpected error during test:', err);
    process.exit(1);
  }); 