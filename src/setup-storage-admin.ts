import { supabaseAdmin } from './database';
import { FOLDERS } from './services/storageService';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function setupStorageAdmin() {
  console.log('Setting up Supabase Storage using admin client...');
  
  // Check if we have admin access
  if (!supabaseAdmin) {
    console.error('No admin client available. Add SUPABASE_SERVICE_KEY to your .env file.');
    console.log('You can find the service role key in your Supabase dashboard under Project Settings > API');
    process.exit(1);
  }
  
  // Check if bucket exists, create if needed
  console.log('Checking storage bucket...');
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }
  
  const bucketExists = buckets.some(bucket => bucket.name === 'storage');
  
  if (!bucketExists) {
    console.log('Creating "storage" bucket...');
    const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket('storage', {
      public: true
    });
    
    if (createError) {
      console.error('Error creating bucket:', createError.message);
      process.exit(1);
    }
    
    console.log('Bucket created successfully');
  } else {
    console.log('Bucket "storage" already exists');
  }
  
  // Create each folder
  console.log('\nCreating required folders...');
  
  for (const [folderType, folderName] of Object.entries(FOLDERS)) {
    console.log(`Creating ${folderType} folder: ${folderName}`);
    
    // Create a placeholder file to ensure the folder exists
    const { data: folderData, error: folderError } = await supabaseAdmin.storage
      .from('storage')
      .upload(`${folderName}/.placeholder`, new Uint8Array(0), {
        contentType: 'text/plain',
        upsert: true
      });
      
    if (folderError) {
      console.error(`Error creating ${folderType} folder:`, folderError.message);
    } else {
      console.log(`${folderType} folder created successfully`);
    }
  }
  
  // List bucket contents
  console.log('\nListing bucket contents after setup...');
  const { data: rootList, error: rootError } = await supabaseAdmin.storage
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
        console.log(`- ${item.name}`);
      });
    }
  }
  
  console.log('\nStorage setup completed!');
  console.log('Now you should be able to use the storage service with your policies.');
}

// Run the setup
setupStorageAdmin()
  .catch(err => {
    console.error('Unexpected error during setup:', err);
    process.exit(1);
  }); 