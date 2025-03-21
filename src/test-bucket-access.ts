import { supabase } from './database';
import fs from 'fs';
import path from 'path';

/**
 * Simple test that checks bucket accessibility and uploads to root
 */
async function testBucketAccess() {
  console.log('Testing basic bucket access...');
  
  // Check if we're authenticated
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    console.log('Not authenticated. Authenticating with test user...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test.user2@gmail.com',
      password: 'TestPassword123!'
    });
    
    if (error) {
      console.error('Authentication failed:', error.message);
      process.exit(1);
    }
    
    console.log('Authenticated as:', data.user.email);
  } else {
    console.log('Already authenticated as:', session.session.user.email);
  }
  
  // List all buckets
  console.log('\nListing all available buckets:');
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  
  if (bucketsError) {
    console.error('Error listing buckets:', bucketsError.message);
  } else {
    buckets.forEach(bucket => {
      console.log(`- ${bucket.name} (${bucket.id})`);
    });
  }
  
  // List files in the storage bucket
  console.log('\nListing files in root of "storage" bucket:');
  const { data: rootFiles, error: rootError } = await supabase.storage
    .from('storage')
    .list();
    
  if (rootError) {
    console.error('Error listing files in root:', rootError.message);
  } else {
    if (rootFiles.length === 0) {
      console.log('No files or folders found in root.');
    } else {
      rootFiles.forEach(item => {
        console.log(`- ${item.name} (${item.id ? item.id : 'folder'})`);
      });
    }
  }
  
  // Create and upload a test file
  console.log('\nTrying to upload a file to root:');
  const testFilePath = path.join(__dirname, '../test-bucket.txt');
  const testContent = 'Testing bucket access - ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    const fileBuffer = fs.readFileSync(testFilePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('storage')
      .upload(`test-${Date.now()}.txt`, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      
      // Check if we can upload to a specific folder
      console.log('\nTrying to upload to 13e9lr7_1 folder:');
      const { data: folderData, error: folderError } = await supabase.storage
        .from('storage')
        .upload(`13e9lr7_1/test-${Date.now()}.txt`, fileBuffer, {
          contentType: 'text/plain',
          upsert: true
        });
        
      if (folderError) {
        console.error('Folder upload error:', folderError.message);
      } else {
        console.log('Folder upload successful!');
        console.log('Path:', folderData.path);
      }
      
    } else {
      console.log('Upload successful!');
      console.log('Path:', uploadData.path);
    }
    
    // Cleanup
    fs.unlinkSync(testFilePath);
    console.log('\nRemoved local test file');
    
  } catch (err) {
    console.error('File operation error:', err);
  }
  
  console.log('\nBucket access test completed!');
}

// Run the test
testBucketAccess()
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 