-- Create a function that allows executing SQL commands
-- This is needed because the Supabase client can't directly execute multi-statement SQL
CREATE OR REPLACE FUNCTION pgclient_exec(query text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- This will execute with the privileges of the user who created it
AS $$
BEGIN
  EXECUTE query;
END;
$$; 