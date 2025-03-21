# CRM Database Setup

This guide will help you set up the PostgreSQL database tables and sample data for the CRM application.

## Prerequisites

Before you begin, make sure you have:
1. A Supabase account and project created
2. Your Supabase URL and anon key added to the `.env` file
3. Node.js and npm installed on your machine

## Option 1: Execute SQL Directly in Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. First, execute the `setup-pgclient-exec.sql` script to create the SQL execution function
4. Then, execute the `database-schema.sql` script to create all the tables
5. Finally, execute the `sample-data.sql` script to populate the tables with sample data

## Option 2: Using the Automated Setup Script

1. Make sure you've created the SQL execution function in Supabase first (Option 1, step 3)
2. Run the database initialization script:
   ```
   npm run db-init
   ```
   This will:
   - Create all required tables in your Supabase database
   - Populate the tables with sample data
   - Display counts of records in key tables to verify the setup

## Troubleshooting

If you encounter errors during the database setup:

1. Check that your Supabase URL and anon key in `.env` are correct
2. Ensure you have created the `pgclient_exec` function in Supabase
3. Try executing the SQL scripts one section at a time directly in the Supabase SQL Editor to identify any issues
4. For permission errors, check that your Supabase user has the necessary rights to create tables and functions

## Database Schema Overview

The CRM database includes tables for:

- `users`: User accounts and authentication
- `customers`: Main customer records
- `contacts`: Individual contact people at customer companies
- `pipeline_stages`: Sales pipeline stages
- `opportunities`: Sales opportunities/deals
- `tasks`: To-do items and follow-ups
- `task_comments`: Comments on tasks
- `activity_logs`: Record of customer interactions
- `subscription_plans`: Available subscription plans
- `customer_subscriptions`: Customer subscriptions to plans
- `payments`: Payment records

Each table is properly indexed and includes appropriate relationships to other tables. 