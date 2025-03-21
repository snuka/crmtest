import fs from 'fs';
import path from 'path';
import { supabase } from './database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeDatabaseStepByStep() {
  try {
    console.log('Starting database initialization step by step...');
    
    // Define the SQL files in the order they should be executed
    const sqlFiles = [
      'create-users-table.sql',
      'alter-customers-table.sql',
      'create-remaining-tables.sql'
    ];
    
    // Execute each SQL file
    for (const file of sqlFiles) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
      
      const { error } = await supabase.rpc('pgclient_exec', { query: sql });
      
      if (error) {
        console.error(`Error executing ${file}:`, error);
        // Continue with the next file even if this one fails
      } else {
        console.log(`Successfully executed ${file}`);
      }
    }
    
    // Insert sample data
    console.log('Populating database with sample data...');
    const sampleDataSQL = fs.readFileSync(path.join(__dirname, '../sample-data-fixed.sql'), 'utf8');
    
    const { error: dataError } = await supabase.rpc('pgclient_exec', { query: sampleDataSQL });
    
    if (dataError) {
      console.error('Error inserting sample data:', dataError);
    } else {
      console.log('Sample data inserted successfully!');
    }
    
    console.log('Database initialization completed.');
    
    // Verify some data was inserted by counting rows in key tables
    const tables = ['users', 'customers', 'contacts', 'opportunities', 'tasks', 'subscription_plans'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count');
      if (error) {
        console.error(`Error counting ${table}:`, error);
      } else {
        console.log(`${table}: ${data.length > 0 ? data[0].count : 0} records`);
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Execute the initialization
initializeDatabaseStepByStep(); 