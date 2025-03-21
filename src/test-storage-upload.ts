import { initializeStorage, uploadFile } from './services/storageService';
import { supabase } from './database';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get the folder names from the service
import { FOLDERS } from './services/storageService';

// Admin email and password from .env
const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';

async function testStorageUpload() {
  console.log('Testing Supabase Storage upload with policy folders...');
  
  // First authenticate with Supabase
  console.log(`Authenticating with Supabase as ${adminEmail}...`);
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword
  });
  
  if (authError) {
    console.error('Authentication failed:', authError.message);
    console.log('Creating a test user instead...');
    
    // Try to create a test user
    const { data: signupData, error: signupError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword
    });
    
    if (signupError) {
      console.error('Failed to create test user:', signupError.message);
      console.log('Will continue without authentication, but storage operations may fail');
    } else {
      console.log('Test user created successfully');
    }
  } else {
    console.log('Authentication successful!');
  }
  
  // Initialize storage
  const { success, error } = await initializeStorage();
  
  if (!success) {
    console.error('Failed to initialize storage:', error);
    process.exit(1);
  }
  
  console.log('Storage initialization successful');
  console.log('Using policy-configured folders:');
  console.log('- READ folder:', FOLDERS.READ);
  console.log('- UPLOAD folder:', FOLDERS.UPLOAD);
  console.log('- UPDATE folder:', FOLDERS.UPDATE);
  console.log('- DELETE folder:', FOLDERS.DELETE);
  
  // Create a simple test file
  const testFilePath = path.join(__dirname, '../test-upload.txt');
  const testContent = 'This is a test file for Supabase storage upload. Created at: ' + new Date().toISOString();
  
  try {
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Created test file at ${testFilePath}`);
    
    // Read the file
    const fileBuffer = fs.readFileSync(testFilePath);
    
    // Upload the file
    console.log(`Uploading file to Supabase storage in ${FOLDERS.UPLOAD} folder...`);
    const { url, error: uploadError } = await uploadFile(
      fileBuffer,
      'test-upload.txt',
      'text/plain'
    );
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      process.exit(1);
    }
    
    console.log('File uploaded successfully!');
    console.log(`File URL: ${url}`);
    
    // List files in the READ folder
    console.log(`\nListing files in the ${FOLDERS.READ} folder:`);
    const { data: readFiles, error: readError } = await supabase.storage
      .from('storage')
      .list(FOLDERS.READ);
      
    if (readError) {
      console.error('Error listing files in READ folder:', readError);
    } else {
      if (readFiles.length === 0) {
        console.log('No files found in the READ folder.');
      } else {
        readFiles.forEach(file => {
          console.log(`- ${file.name}`);
        });
      }
    }
    
    // List files in the UPLOAD folder
    console.log(`\nListing files in the ${FOLDERS.UPLOAD} folder:`);
    const { data: uploadFiles, error: uploadListError } = await supabase.storage
      .from('storage')
      .list(FOLDERS.UPLOAD);
      
    if (uploadListError) {
      console.error('Error listing files in UPLOAD folder:', uploadListError);
    } else {
      if (uploadFiles.length === 0) {
        console.log('No files found in the UPLOAD folder.');
      } else {
        uploadFiles.forEach(file => {
          console.log(`- ${file.name}`);
        });
      }
    }
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log(`Removed test file from local filesystem`);
    
  } catch (err) {
    console.error('File operation error:', err);
    process.exit(1);
  }
  
  console.log('\nStorage upload test completed!');
}

// Run the test
testStorageUpload()
  .catch(err => {
    console.error('Unexpected error during storage test:', err);
    process.exit(1);
  }); 