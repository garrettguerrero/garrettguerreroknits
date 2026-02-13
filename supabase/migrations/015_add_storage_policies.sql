-- Add RLS policies for Supabase Storage buckets
-- This allows admin users to upload files while keeping downloads secure via API

-- Drop existing policies if they exist (to allow re-running migration)
DROP POLICY IF EXISTS "Admins can upload pattern PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update pattern PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete pattern PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;

-- Patterns bucket policies (private bucket for PDFs)
-- Admin users can upload/update/delete pattern PDFs
CREATE POLICY "Admins can upload pattern PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'patterns'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update pattern PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'patterns'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete pattern PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'patterns'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

-- Note: No SELECT policy - downloads happen via API-generated signed URLs only
-- This ensures ownership verification and download tracking

-- Product images bucket policies (public bucket for cover images)
-- Anyone can view public images
CREATE POLICY "Anyone can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Admins can upload/update/delete product images
CREATE POLICY "Admins can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can update product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

CREATE POLICY "Admins can delete product images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'product-images'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = (SELECT auth.uid())
      AND profiles.is_admin = true
  )
);

-- Avatars bucket policies (public bucket for user avatars)
-- Anyone can view avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Users can upload/update their own avatar
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
);
