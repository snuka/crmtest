import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import { FileObject } from '@supabase/storage-js';
import { supabase, supabaseAdmin } from '../database';

// Storage configuration
const BUCKET_NAME = 'storage';

// Folder names that match the policy configurations
export const FOLDERS = {
  READ: '13e9lr7_0',    // SELECT policy
  UPLOAD: '13e9lr7_1',  // INSERT policy
  UPDATE: '13e9lr7_2',  // UPDATE policy
  DELETE: '13e9lr7_3',   // DELETE policy
  OUTPUT: 'output'      // For processed outputs
};

/**
 * Check if a user is authenticated with Supabase Auth
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
};

/**
 * Get the current authenticated user
 */
export const getAuthUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

/**
 * Authenticate with Supabase Auth
 */
export const authenticateWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error: any }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Initialize the storage bucket if it doesn't exist
 */
export const initializeStorage = async (): Promise<{ success: boolean; error: any }> => {
  try {
    // First check if the user is authenticated
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      console.warn('User is not authenticated with Supabase Auth. Storage operations may fail.');
    } else {
      const user = await getAuthUser();
      console.log('Authenticated as:', user?.email);
    }
    
    console.log('Attempting to connect to Supabase storage bucket:', BUCKET_NAME);
    
    // Use admin client to check the bucket
    if (!supabaseAdmin) {
      console.warn('No admin client available. Using regular client which may have limited permissions.');
      
      // First try to directly use the bucket without checking if it exists
      const { data: testFiles, error: testError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(FOLDERS.READ, { limit: 1 });
        
      if (!testError) {
        console.log(`Successfully connected to bucket '${BUCKET_NAME}'`);
        return { success: true, error: null };
      } else if (testError.message?.includes('The resource was not found')) {
        console.error(`Bucket '${BUCKET_NAME}' not found`);
        console.log('Please create the bucket in the Supabase dashboard');
        return { success: false, error: 'Bucket not found' };
      } else {
        console.warn(`Could not list files due to permission error, but bucket might still exist: ${testError.message}`);
        // Continue to try other operations
      }
      
      // Optional: Try to get bucket info if listing files failed
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('Error listing buckets:', listError.message);
        console.log('Could not verify bucket existence. Will try to use it anyway.');
        
        // If we can't list buckets, we'll assume the bucket exists and try to use it anyway
        return { success: true, error: null };
      }
      
      // Check if our bucket already exists
      const bucketExists = buckets.some((bucket: { name: string }) => bucket.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.error(`Bucket '${BUCKET_NAME}' not found in your Supabase project.`);
        console.log('Please create the "storage" bucket manually in the Supabase dashboard:');
        console.log('1. Go to your Supabase project dashboard');
        console.log('2. Navigate to "Storage" in the left sidebar');
        console.log('3. Click "New Bucket" and create one named "storage"');
        console.log('4. Set the bucket to public or configure appropriate RLS policies');
        return { success: false, error: 'Bucket not found' };
      } else {
        console.log(`Bucket '${BUCKET_NAME}' found and ready to use.`);
      }
    } else {
      // Use the admin client to verify bucket exists
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error('Admin error listing buckets:', listError.message);
        return { success: false, error: listError };
      }
      
      const bucketExists = buckets.some((bucket: { name: string }) => bucket.name === BUCKET_NAME);
      
      if (!bucketExists) {
        console.error(`Bucket '${BUCKET_NAME}' not found, attempting to create it...`);
        
        const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(BUCKET_NAME, {
          public: true
        });
        
        if (createError) {
          console.error('Error creating bucket:', createError.message);
          return { success: false, error: createError };
        }
        
        console.log(`Bucket '${BUCKET_NAME}' created successfully.`);
      } else {
        console.log(`Bucket '${BUCKET_NAME}' found and ready to use.`);
      }
      
      // Make sure the folder structure exists
      for (const [folderType, folderName] of Object.entries(FOLDERS)) {
        console.log(`Checking ${folderType} folder: ${folderName}`);
        
        try {
          // First check if folder exists
          const { data, error: listError } = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .list(folderName);
            
          if (listError) {
            console.log(`Creating ${folderType} folder: ${folderName}`);
            
            // Create a placeholder file to ensure the folder exists
            const { error: folderError } = await supabaseAdmin.storage
              .from(BUCKET_NAME)
              .upload(`${folderName}/.placeholder`, new Uint8Array(0), {
                contentType: 'text/plain',
                upsert: true
              });
              
            if (folderError) {
              console.error(`Error creating ${folderType} folder:`, folderError.message);
            }
          } else {
            console.log(`${folderType} folder exists`);
          }
        } catch (folderError) {
          console.error(`Error checking/creating ${folderType} folder:`, folderError);
        }
      }
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Storage initialization error:', error);
    return { success: false, error };
  }
};

/**
 * Upload a file to storage
 */
export const uploadFile = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ url: string | null; error: any }> => {
  try {
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.warn('Admin client not available. Upload may fail due to RLS policies.');
    }
    
    // Use admin client if available, otherwise fallback to regular client
    const storageClient = supabaseAdmin || supabase;
    
    // Generate a unique file name to prevent collisions
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    
    // Upload path using the policy-compliant folder
    const filePath = `${FOLDERS.UPLOAD}/${uniqueFileName}`;
    
    // Upload the file
    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .upload(filePath, fileBuffer, {
        contentType,
        cacheControl: '3600',
        upsert: true, // Allow overwriting if needed
      });
    
    if (error) {
      console.error('File upload error:', error);
      return { url: null, error };
    }
    
    // Get the public URL for the file
    const { data: urlData } = storageClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);
    
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Exception during file upload:', error);
    return { url: null, error };
  }
};

/**
 * Get a list of files in a folder
 */
export const getFileList = async (
  folder: string = FOLDERS.OUTPUT
): Promise<{ files: (FileObject & { url: string })[] | null; error: any }> => {
  try {
    // Use admin client if available, otherwise fallback to regular client
    const storageClient = supabaseAdmin || supabase;
    
    const { data, error } = await storageClient.storage
      .from(BUCKET_NAME)
      .list(folder);
    
    if (error) {
      console.error('File list error:', error);
      return { files: null, error };
    }
    
    // Add public URL to each file
    const filesWithUrls = data.map((file: FileObject) => {
      const { data: urlData } = storageClient.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${folder}/${file.name}`);
      
      return {
        ...file,
        url: urlData.publicUrl,
      };
    });
    
    return { files: filesWithUrls, error: null };
  } catch (error) {
    console.error('Exception during file listing:', error);
    return { files: null, error };
  }
};

/**
 * Delete a file from storage
 */
export const deleteFile = async (
  filePath: string
): Promise<{ success: boolean; error: any }> => {
  try {
    // Use admin client if available, otherwise fallback to regular client
    const storageClient = supabaseAdmin || supabase;
    
    const { error } = await storageClient.storage
      .from(BUCKET_NAME)
      .remove([filePath]);
    
    if (error) {
      console.error('File deletion error:', error);
      return { success: false, error };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception during file deletion:', error);
    return { success: false, error };
  }
};

/**
 * Move a file between folders (useful for complying with different operation policies)
 */
export const moveFile = async (sourceUrl: string, targetFolder: string): Promise<{ url: string | null; error: any }> => {
  try {
    // Extract the file name from the URL
    const urlObj = new URL(sourceUrl);
    const pathParts = urlObj.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    if (!fileName) {
      return { url: null, error: 'Invalid file URL' };
    }
    
    // Source and target paths
    const sourcePath = pathParts.slice(-2).join('/');
    const targetPath = `${targetFolder}/${fileName}`;
    
    // Use admin client if available to bypass RLS policies
    const storageClient = supabaseAdmin || supabase;
    
    // Move the file to the target folder
    const { error: moveError } = await storageClient.storage
      .from(BUCKET_NAME)
      .move(sourcePath, targetPath);
      
    if (moveError) {
      console.error('File move error:', moveError);
      return { url: null, error: moveError };
    }
    
    // Get the new URL
    const { data: urlData } = storageClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(targetPath);
      
    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    console.error('Exception during file move:', error);
    return { url: null, error };
  }
}; 