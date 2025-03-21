-- Add document_url column to customers table
ALTER TABLE customers ADD COLUMN document_url TEXT;

-- Add a comment to the document_url column
COMMENT ON COLUMN customers.document_url IS 'URL to the customer document stored in Supabase storage';

-- Ensure existing rows have null value for the new column
UPDATE customers SET document_url = NULL WHERE document_url IS NULL; 