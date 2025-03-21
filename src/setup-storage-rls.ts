import { supabaseAdmin } from './database';
import { FOLDERS } from './services/storageService';

async function setupStorageRLS() {
  console.log('Setting up Storage RLS policies with admin client...');
  
  // Check if we have admin access
  if (!supabaseAdmin) {
    console.error('No admin client available. Add SUPABASE_SERVICE_KEY to your .env file.');
    process.exit(1);
  }
  
  // Get the bucket ID for the storage bucket
  console.log('Getting bucket information...');
  const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
  
  if (listError) {
    console.error('Error listing buckets:', listError.message);
    process.exit(1);
  }
  
  const storageBucket = buckets.find(bucket => bucket.name === 'storage');
  
  if (!storageBucket) {
    console.error('Storage bucket not found. Please run setup-storage-admin.ts first.');
    process.exit(1);
  }
  
  console.log('Found storage bucket:', storageBucket.id);
  
  // Update policies for the objects table
  // For this we need to use raw SQL queries since the JavaScript API doesn't expose policy management
  
  // Enable RLS on the objects table
  console.log('\nEnabling Row Level Security on storage.objects table...');
  const { error: rlsError } = await supabaseAdmin.rpc('test_enable_storage_rls', {});
  
  if (rlsError) {
    console.error('Error enabling RLS:', rlsError.message);
    console.log('This is expected if RLS is already enabled.');
  } else {
    console.log('RLS enabled successfully');
  }
  
  // Create a function to generate storage object policies
  async function createPolicy(
    policyName: string, 
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE', 
    folder: string, 
    check: string
  ): Promise<void> {
    // We know supabaseAdmin is not null here because we checked above
    const { error } = await supabaseAdmin!.rpc('test_create_storage_policy', {
      policy_name: policyName,
      bucket_name: 'storage',
      operation: operation,
      path_prefix: folder,
      policy_check: check
    });
    
    if (error) {
      console.error(`Error creating ${operation} policy for ${folder}:`, error.message);
      console.log('This might be expected if policy already exists or has a different name.');
    } else {
      console.log(`Created ${operation} policy for ${folder}`);
    }
  }
  
  // Create policies for each folder
  console.log('\nCreating storage policies...');
  
  // All authenticated users can read from READ folder
  await createPolicy(
    'allow_read_authenticated',
    'SELECT',
    `${FOLDERS.READ}`,
    'auth.role() = \'authenticated\''
  );
  
  // All authenticated users can upload to UPLOAD folder
  await createPolicy(
    'allow_insert_authenticated',
    'INSERT',
    `${FOLDERS.UPLOAD}`,
    'auth.role() = \'authenticated\''
  );
  
  // All authenticated users can update in UPDATE folder
  await createPolicy(
    'allow_update_authenticated',
    'UPDATE',
    `${FOLDERS.UPDATE}`,
    'auth.role() = \'authenticated\''
  );
  
  // All authenticated users can delete from DELETE folder
  await createPolicy(
    'allow_delete_authenticated',
    'DELETE',
    `${FOLDERS.DELETE}`,
    'auth.role() = \'authenticated\''
  );
  
  console.log('\nPolicy setup completed!');
  console.log('You may need to check the Supabase dashboard to verify the policies are set correctly.');
}

// Run the setup
setupStorageRLS()
  .catch(err => {
    console.error('Unexpected error during setup:', err);
    process.exit(1);
  }); 