-- Make stripe_session_id nullable for test/manual orders
ALTER TABLE orders ALTER COLUMN stripe_session_id DROP NOT NULL;

-- Drop the unique constraint on stripe_session_id since NULL values can exist
ALTER TABLE orders DROP CONSTRAINT IF EXISTS purchases_stripe_session_id_key;
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_stripe_session_id_key;

-- Recreate the unique constraint but allow NULL values
-- Note: In PostgreSQL, multiple NULL values are allowed with a unique constraint
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session_id_unique
  ON orders(stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
