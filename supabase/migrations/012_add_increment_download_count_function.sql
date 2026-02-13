-- Add RPC function to increment download count
-- This is called by the download API to track pattern downloads

CREATE OR REPLACE FUNCTION increment_download_count(pattern_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET times_downloaded = COALESCE(times_downloaded, 0) + 1
  WHERE id = pattern_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_download_count(uuid) TO anon;
