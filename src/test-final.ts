import { supabase, supabaseAdmin } from './database';
import { 
  initializeStorage, 
  uploadFile, 
  getFileList, 
  deleteFile, 
  FOLDERS 
} from './services/storageService';
import * as fs from 'fs';
import * as path from 'path';

// Test the complete storage workflow
const runStorageTest = async () => {
  try {
    console.log('==== STORAGE SERVICE TEST ====');
    
    // Step 1: Initialize storage
    console.log('\n1. Initializing storage...');
    const initResult = await initializeStorage();
    
    if (!initResult.success) {
      console.error('Storage initialization failed:', initResult.error);
      return;
    }
    
    console.log('Storage initialization successful');
    
    // Step 2: Test file upload
    console.log('\n2. Testing file upload...');
    
    // Read a sample file from disk
    const testFilePath = path.resolve(__dirname, '../sample-logo.png');
    let fileBuffer: Buffer;
    
    try {
      fileBuffer = fs.readFileSync(testFilePath);
      console.log(`Read sample file: ${testFilePath} (${fileBuffer.length} bytes)`);
    } catch (error) {
      console.error('Error reading sample file:', error);
      console.log('Using a small test buffer instead');
      // Create a small test buffer
      fileBuffer = Buffer.from('Test file content for Supabase storage');
    }
    
    // Upload the file
    const uploadResult = await uploadFile(
      fileBuffer,
      'test-logo.png',
      'image/png'
    );
    
    if (!uploadResult.url) {
      console.error('File upload failed:', uploadResult.error);
      return;
    }
    
    console.log('File uploaded successfully!');
    console.log('File URL:', uploadResult.url);
    
    // Step 3: List files
    console.log('\n3. Listing files in upload folder...');
    const listResult = await getFileList(FOLDERS.UPLOAD);
    
    if (!listResult.files) {
      console.error('File listing failed:', listResult.error);
    } else {
      console.log(`Found ${listResult.files.length} files in ${FOLDERS.UPLOAD} folder:`);
      listResult.files.forEach((file, index) => {
        console.log(`${index + 1}. ${file.name} (${file.metadata?.size || 'unknown'} bytes) - ${file.url}`);
      });
    }
    
    // Extract file path from URL for deletion
    if (uploadResult.url) {
      const urlParts = new URL(uploadResult.url);
      const pathParts = urlParts.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      const filePath = `${FOLDERS.UPLOAD}/${fileName}`;
      
      // Step 4: Delete the file
      console.log(`\n4. Deleting file: ${filePath}...`);
      const deleteResult = await deleteFile(filePath);
      
      if (!deleteResult.success) {
        console.error('File deletion failed:', deleteResult.error);
      } else {
        console.log('File deleted successfully!');
      }
    }
    
    console.log('\nStorage test completed successfully.');
  } catch (error) {
    console.error('Storage test error:', error);
  } finally {
    // Always close the Supabase connection
    console.log('\nClosing Supabase connection...');
    await supabase.auth.signOut();
    console.log('Done.');
  }
};

// Run the test
runStorageTest(); 