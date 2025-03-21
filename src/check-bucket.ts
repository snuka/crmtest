import { supabaseAdmin, supabase } from './database';

const checkBuckets = async () => {
  try {
    console.log('Checking storage buckets...');
    
    // Check with regular client first
    console.log('\nUsing regular client:');
    const { data: regularBuckets, error: regularError } = await supabase.storage.listBuckets();
    
    if (regularError) {
      console.error('Error listing buckets with regular client:', regularError);
    } else {
      console.log(`Found ${regularBuckets.length} buckets:`);
      regularBuckets.forEach(bucket => {
        console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });
    }
    
    // Check with admin client
    if (supabaseAdmin) {
      console.log('\nUsing admin client:');
      const { data: adminBuckets, error: adminError } = await supabaseAdmin.storage.listBuckets();
      
      if (adminError) {
        console.error('Error listing buckets with admin client:', adminError);
      } else {
        console.log(`Found ${adminBuckets.length} buckets:`);
        adminBuckets.forEach(bucket => {
          console.log(`- ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
        });
      }
    }
    
    // Get bucket used in code
    const BUCKET_NAME = 'storage';
    console.log(`\nBucket name used in code: "${BUCKET_NAME}"`);
    
    // Get URL base
    const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl('test.txt');
    console.log('URL base:', urlData.publicUrl.replace('/test.txt', ''));
  } catch (error) {
    console.error('Error:', error);
  }
};

checkBuckets(); 