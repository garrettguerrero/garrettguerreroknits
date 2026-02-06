-- ============================================
-- RENAME PURCHASES TO ORDERS
-- ============================================

-- Drop existing RLS policies on purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON purchases;
DROP POLICY IF EXISTS "Admins can view all purchases" ON purchases;

-- Drop existing RLS policies on purchase_items
DROP POLICY IF EXISTS "Users can view own purchase items" ON purchase_items;
DROP POLICY IF EXISTS "Admins can view all purchase items" ON purchase_items;

-- Rename the tables
ALTER TABLE purchases RENAME TO orders;
ALTER TABLE purchase_items RENAME TO order_items;

-- Rename columns in order_items
ALTER TABLE order_items RENAME COLUMN purchase_id TO order_id;
ALTER TABLE order_items RENAME COLUMN price_paid TO price_at_purchase;

-- Update order_items to add quantity column (default 1 for digital products)
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1 NOT NULL;

-- Rename indexes
ALTER INDEX IF EXISTS idx_purchases_user_id RENAME TO idx_orders_user_id;
ALTER INDEX IF EXISTS idx_purchases_stripe_session_id RENAME TO idx_orders_stripe_session_id;
ALTER INDEX IF EXISTS idx_purchases_created_at RENAME TO idx_orders_created_at;
ALTER INDEX IF EXISTS idx_purchase_items_purchase_id RENAME TO idx_order_items_order_id;

-- Update orders table to match expected schema
ALTER TABLE orders RENAME COLUMN amount_paid TO total_amount;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0 NOT NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS final_amount DECIMAL(10, 2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code_id UUID REFERENCES discount_codes(id) ON DELETE SET NULL;

-- Calculate final_amount from existing data
UPDATE orders
SET final_amount = total_amount
WHERE final_amount IS NULL;

-- Make final_amount NOT NULL after populating
ALTER TABLE orders ALTER COLUMN final_amount SET NOT NULL;

-- Create new RLS policies on orders
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Create new RLS policies on order_items
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );
