import { supabase } from './database';
import fs from 'fs';
import path from 'path';

// Test credentials
const testEmail = 'test.user2@gmail.com';
const testPassword = 'TestPassword123!';

async function testSimpleStorage() {
  console.log('Testing simple Supabase Storage operations...');
  
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
  
  // List bucket contents
  console.log('\nListing bucket contents...');
  const { data: rootList, error: rootError } = await supabase.storage
    .from('storage')
    .list('');
    
  if (rootError) {
    console.error('Error listing bucket:', rootError.message);
  } else {
    console.log('Root contents:');
    if (rootList.length === 0) {
      console.log('No files or folders found');
    } else {
      rootList.forEach(item => {
        console.log(`- ${item.name} ${item.id ? `(${item.id})` : ''}`);
      });
    }
  }
  
  // Create a test file
  console.log('\nTesting file upload...');
  const testFilePath = path.join(__dirname, '../test-simple.txt');
  const testContent = 'This is a simple test file. Created at: ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    // Try to upload the file directly to the root
    const fileBuffer = fs.readFileSync(testFilePath);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('storage')
      .upload(`test-simple-${Date.now()}.txt`, fileBuffer, {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError.message);
    } else {
      console.log('File uploaded successfully!');
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('storage')
        .getPublicUrl(uploadData.path);
        
      console.log('File URL:', urlData.publicUrl);
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log('Removed local test file');
    
  } catch (err) {
    console.error('File operation error:', err);
  }
  
  console.log('\nSimple storage test completed!');
}

// Run the test
testSimpleStorage()
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  }); 