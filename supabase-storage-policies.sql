-- Supabase Storage Policies Setup Script
-- Run this in your Supabase SQL Editor (Database > SQL Editor)

-- Enable RLS on storage.objects table if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Give users authenticated access to folder 13e9lr7_0" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder 13e9lr7_1" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder 13e9lr7_2" ON storage.objects;
DROP POLICY IF EXISTS "Give users authenticated access to folder 13e9lr7_3" ON storage.objects;

-- Create SELECT policy for READ folder (13e9lr7_0)
CREATE POLICY "Give users authenticated access to folder 13e9lr7_0"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'storage'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = '13e9lr7_0'
);

-- Create INSERT policy for UPLOAD folder (13e9lr7_1)
CREATE POLICY "Give users authenticated access to folder 13e9lr7_1"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'storage'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = '13e9lr7_1'
);

-- Create UPDATE policy for UPDATE folder (13e9lr7_2)
CREATE POLICY "Give users authenticated access to folder 13e9lr7_2"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'storage'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = '13e9lr7_2'
);

-- Create DELETE policy for DELETE folder (13e9lr7_3)
CREATE POLICY "Give users authenticated access to folder 13e9lr7_3"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'storage'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = '13e9lr7_3'
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