-- Supabase Storage Simple Policy Setup Script
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create a simple policy that allows authenticated users to do anything with the storage bucket
-- This is useful for testing. In production, you'd want more restrictive policies.

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow authenticated users full access" ON storage.objects;

-- Create a policy that allows authenticated users to perform any operation on the 'storage' bucket
CREATE POLICY "Allow authenticated users full access"
ON storage.objects
FOR ALL
USING (
  bucket_id = 'storage'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'storage' 
  AND auth.role() = 'authenticated'
);

-- Verify the policies
SELECT
  policyname,
  permissive,
  roles,
  cmd,
  REGEXP_REPLACE(qual, '[(\s+)]', ' ', 'g') as qual,
  REGEXP_REPLACE(with_check, '[(\s+)]', ' ', 'g') as with_check
FROM
  pg_policies
WHERE
  tablename = 'objects'
  AND schemaname = 'storage'
ORDER BY
  policyname; 