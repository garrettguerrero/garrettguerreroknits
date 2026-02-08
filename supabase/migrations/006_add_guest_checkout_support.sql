-- ============================================
-- ADD GUEST CHECKOUT SUPPORT
-- ============================================

-- Make user_id nullable in orders table for guest orders
ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;

-- Add guest_email column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email TEXT;

-- Add constraint: either user_id or guest_email must be present
ALTER TABLE orders ADD CONSTRAINT orders_user_or_guest_email_check
  CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  );

-- Create index for guest email lookups
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email) WHERE guest_email IS NOT NULL;

-- Update library table to support guest purchases
ALTER TABLE library ADD COLUMN IF NOT EXISTS email TEXT;

-- Update unique constraint to allow either user_id or email
ALTER TABLE library DROP CONSTRAINT IF EXISTS library_user_id_product_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_library_user_product ON library(user_id, product_id) WHERE user_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_library_email_product ON library(email, product_id) WHERE email IS NOT NULL;

-- Add constraint: either user_id or email must be present
ALTER TABLE library ADD CONSTRAINT library_user_or_email_check
  CHECK (
    (user_id IS NOT NULL AND email IS NULL) OR
    (user_id IS NULL AND email IS NOT NULL)
  );

-- Make user_id nullable in library table
ALTER TABLE library ALTER COLUMN user_id DROP NOT NULL;

-- Update RLS policies for orders to support guest access
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND guest_email = auth.jwt()->>'email')
  );

-- Allow guests to view their orders by email in a secure way (via API only)
-- Note: We'll handle guest access through API routes, not direct RLS

-- Update RLS policies for library
DROP POLICY IF EXISTS "Users can view own library" ON library;

CREATE POLICY "Users can view own library"
  ON library FOR SELECT
  USING (
    auth.uid() = user_id OR
    (user_id IS NULL AND email = auth.jwt()->>'email')
  );

-- Function to link guest orders to user account when they sign up
CREATE OR REPLACE FUNCTION link_guest_orders_to_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Link guest orders to new user
  UPDATE orders
  SET user_id = NEW.id, guest_email = NULL
  WHERE guest_email = NEW.email;

  -- Link guest library items to new user
  UPDATE library
  SET user_id = NEW.id, email = NULL
  WHERE email = NEW.email;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to link guest data when user signs up
DROP TRIGGER IF EXISTS on_user_signup_link_guest_data ON profiles;
CREATE TRIGGER on_user_signup_link_guest_data
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION link_guest_orders_to_user();

-- Add policy for admins to create orders (for API)
CREATE POLICY "API can create orders"
  ON orders FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "API can update orders"
  ON orders FOR UPDATE
  USING (TRUE);

-- Add policy for API to create library items
CREATE POLICY "API can create library items"
  ON library FOR INSERT
  WITH CHECK (TRUE);

-- Add policy for order_items
CREATE POLICY "API can create order items"
  ON order_items FOR INSERT
  WITH CHECK (TRUE);

-- Add comments for documentation
COMMENT ON COLUMN orders.guest_email IS 'Email address for guest checkout. Either user_id or guest_email must be set.';
COMMENT ON COLUMN library.email IS 'Email address for guest purchases. Either user_id or email must be set. Linked to user_id when account is created.';
