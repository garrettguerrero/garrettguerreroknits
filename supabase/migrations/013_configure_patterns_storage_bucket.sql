-- Configure Supabase Storage bucket for pattern PDFs
-- This migration documents the required configuration
-- NOTE: Storage buckets must be created via Supabase Dashboard

-- MANUAL SETUP REQUIRED via Supabase Dashboard:
-- 1. Go to Storage → Create bucket
-- 2. Bucket name: "patterns"
-- 3. Public: false (Private bucket)
-- 4. File size limit: 50MB (52428800 bytes)
-- 5. Allowed MIME types: application/pdf
-- 6. Do NOT create any RLS policies - access is controlled via API-generated signed URLs

-- This ensures:
-- - All downloads go through /api/download/[productId] endpoint
-- - Ownership is verified before generating signed URLs
-- - Download counts are tracked
-- - Secure, time-limited access to PDFs (60 second expiry)

-- No SQL statements needed - this is purely documentation
