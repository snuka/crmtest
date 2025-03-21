-- Check if customers table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'customers') THEN
    -- Check if the assigned_to column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'assigned_to') THEN
      -- Add the assigned_to column
      ALTER TABLE customers ADD COLUMN assigned_to UUID REFERENCES users(id) ON DELETE SET NULL;
    END IF;
    
    -- Check if the updated_at column exists
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'updated_at') THEN
      -- Add the updated_at column
      ALTER TABLE customers ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
  ELSE
    -- Create the customers table if it doesn't exist
    CREATE TABLE customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      company TEXT,
      status TEXT CHECK (status IN ('active', 'inactive', 'lead')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      assigned_to UUID REFERENCES users(id) ON DELETE SET NULL
    );
  END IF;
END $$; 