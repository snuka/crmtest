import fs from 'fs';
import path from 'path';
import { supabase } from './database';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Starting database initialization...');
    
    // Read the schema SQL file
    const schemaSQL = fs.readFileSync(path.join(__dirname, '../database-schema.sql'), 'utf8');
    
    console.log('Executing schema creation...');
    const { error: schemaError } = await supabase.rpc('pgclient_exec', { query: schemaSQL });
    
    if (schemaError) {
      throw new Error(`Error creating schema: ${schemaError.message}`);
    }
    
    console.log('Schema created successfully! Tables are ready.');
    
    // Read the sample data SQL file
    const sampleDataSQL = fs.readFileSync(path.join(__dirname, '../sample-data.sql'), 'utf8');
    
    console.log('Populating database with sample data...');
    const { error: dataError } = await supabase.rpc('pgclient_exec', { query: sampleDataSQL });
    
    if (dataError) {
      throw new Error(`Error inserting sample data: ${dataError.message}`);
    }
    
    console.log('Sample data inserted successfully!');
    console.log('Database initialization completed.');
    
    // Verify some data was inserted by counting rows in key tables
    const tables = ['users', 'customers', 'contacts', 'opportunities', 'tasks', 'subscription_plans'];
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count');
      if (error) {
        console.error(`Error counting ${table}: ${error.message}`);
      } else {
        console.log(`${table}: ${data.length > 0 ? data[0].count : 0} records`);
      }
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Execute the initialization
initializeDatabase(); 