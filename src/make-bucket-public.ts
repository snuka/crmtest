import { supabaseAdmin } from './database';

const BUCKET_NAME = 'storage';

const makeBucketPublic = async () => {
  try {
    console.log(`Making bucket "${BUCKET_NAME}" public...`);
    
    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Admin client not available. Make sure SUPABASE_SERVICE_KEY is set in .env');
      return;
    }
    
    // First, verify bucket exists
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    const bucket = buckets.find(b => b.name === BUCKET_NAME);
    
    if (!bucket) {
      console.error(`Bucket "${BUCKET_NAME}" not found!`);
      return;
    }
    
    console.log(`Bucket found: ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    
    if (bucket.public) {
      console.log('Bucket is already public. No changes needed.');
      return;
    }
    
    // Update the bucket to be public
    const { data, error } = await supabaseAdmin.storage.updateBucket(BUCKET_NAME, {
      public: true
    });
    
    if (error) {
      console.error('Error updating bucket:', error);
      return;
    }
    
    console.log(`Bucket "${BUCKET_NAME}" is now public!`);
    
    // Verify the update
    const { data: verifyBuckets, error: verifyError } = await supabaseAdmin.storage.listBuckets();
    
    if (verifyError || !verifyBuckets) {
      console.error('Error verifying bucket update:', verifyError);
      return;
    }
    
    const updatedBucket = verifyBuckets.find(b => b.name === BUCKET_NAME);
    console.log(`Verification: ${updatedBucket?.name} is now ${updatedBucket?.public ? 'public' : 'private'}`);
    
  } catch (error) {
    console.error('Error:', error);
  }
};

makeBucketPublic(); 