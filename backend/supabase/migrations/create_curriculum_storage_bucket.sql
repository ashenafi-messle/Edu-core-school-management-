-- Migration: Create curriculum documents storage bucket
-- This script creates the Supabase Storage bucket for curriculum documents

-- Note: This migration needs to be run manually in Supabase SQL editor
-- or through the Supabase dashboard, as storage buckets cannot be
-- created through regular SQL migrations.

-- Run the following in Supabase SQL Editor:

-- Insert storage bucket record
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'curriculum-documents',
  'curriculum-documents',
  true,
  52428800, -- 50MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Create storage policies for the bucket
-- Policy: Allow public read access to all files
CREATE POLICY "Public Access Curriculum Documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'curriculum-documents');

-- Policy: Allow authenticated users to upload files
CREATE POLICY "Authenticated Upload Curriculum Documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'curriculum-documents' AND
  auth.role() = 'authenticated'
);

-- Policy: Allow teachers to update their own files
CREATE POLICY "Teachers Update Own Curriculum Documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'curriculum-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'curriculum-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Allow teachers to delete their own files
CREATE POLICY "Teachers Delete Own Curriculum Documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'curriculum-documents' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA storage TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO authenticated;