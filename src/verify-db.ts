import { supabase } from './database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function verifyDatabase() {
  try {
    console.log('Starting database verification...');
    
    // Define all the tables we want to check
    const tables = [
      'users',
      'customers',
      'contacts',
      'pipeline_stages',
      'opportunities',
      'tasks',
      'task_comments',
      'activity_logs',
      'subscription_plans',
      'customer_subscriptions',
      'payments'
    ];
    
    // Check each table exists and count records
    console.log('Table counts:');
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count');
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.error(`❌ Table '${table}' does not exist`);
        } else {
          console.error(`❌ Error checking table '${table}': ${error.message}`);
        }
      } else {
        const count = data.length > 0 ? data[0].count : 0;
        if (count > 0) {
          console.log(`✅ Table '${table}': ${count} records`);
        } else {
          console.warn(`⚠️ Table '${table}' exists but has no records`);
        }
      }
    }
    
    // Sample a random record from each table to verify data structure
    console.log('\nSample data verification:');
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Could not retrieve sample from '${table}': ${error.message}`);
      } else if (data && data.length > 0) {
        console.log(`✅ Sample from '${table}': Record ID ${data[0].id}`);
        
        // For selected tables, verify relationships
        if (table === 'customers') {
          const customerId = data[0].id;
          // Check for related contacts
          const { data: contacts, error: contactsError } = await supabase
            .from('contacts')
            .select('id, first_name, last_name')
            .eq('customer_id', customerId);
          
          if (contactsError) {
            console.error(`❌ Error retrieving contacts for customer: ${contactsError.message}`);
          } else {
            console.log(`✅ Customer has ${contacts.length} related contacts`);
          }
        }
      } else {
        console.warn(`⚠️ No sample data found in '${table}'`);
      }
    }
    
    console.log('\nDatabase verification completed.');
  } catch (error) {
    console.error('Database verification failed:', error);
  }
}

// Execute the verification
verifyDatabase(); 