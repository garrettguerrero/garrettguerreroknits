-- Add version tracking to library table
-- This allows us to notify users when patterns are updated

-- Add column to track the version the user last viewed/downloaded
ALTER TABLE library
ADD COLUMN IF NOT EXISTS last_viewed_version text;

-- Update existing records to set last_viewed_version to current product version
UPDATE library
SET last_viewed_version = products.version
FROM products
WHERE library.product_id = products.id
  AND library.last_viewed_version IS NULL;

-- Create function to mark pattern version as viewed
CREATE OR REPLACE FUNCTION mark_pattern_version_viewed(
  p_user_id uuid,
  p_product_id uuid,
  p_version text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.library
  SET last_viewed_version = p_version
  WHERE user_id = p_user_id
    AND product_id = p_product_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION mark_pattern_version_viewed(uuid, uuid, text) TO authenticated;

-- Create a view to easily check if patterns have updates
CREATE OR REPLACE VIEW library_with_updates AS
SELECT
  l.*,
  p.version as current_version,
  p.changelog,
  CASE
    WHEN p.version IS NOT NULL
      AND l.last_viewed_version IS NOT NULL
      AND p.version != l.last_viewed_version
    THEN true
    ELSE false
  END as has_update
FROM library l
JOIN products p ON l.product_id = p.id;

-- Grant access to view
GRANT SELECT ON library_with_updates TO authenticated;

COMMENT ON COLUMN library.last_viewed_version IS 'The version of the pattern the user last viewed/downloaded. Used to show update notifications.';
COMMENT ON VIEW library_with_updates IS 'View that shows library items with update status';
