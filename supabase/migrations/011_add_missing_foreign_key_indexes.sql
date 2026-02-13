-- Add missing indexes on foreign key columns
-- This improves JOIN, DELETE CASCADE, and referential integrity check performance

-- 1. bundle_items.product_id
CREATE INDEX IF NOT EXISTS idx_bundle_items_product_id ON bundle_items(product_id);

-- 2. cart_items.bundle_id
CREATE INDEX IF NOT EXISTS idx_cart_items_bundle_id ON cart_items(bundle_id);

-- 3. cart_items.product_id
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- 4. favorites.product_id
CREATE INDEX IF NOT EXISTS idx_favorites_product_id ON favorites(product_id);

-- 5. order_items.bundle_id
CREATE INDEX IF NOT EXISTS idx_order_items_bundle_id ON order_items(bundle_id);

-- 6. order_items.product_id
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- 7. orders.discount_code_id
CREATE INDEX IF NOT EXISTS idx_orders_discount_code_id ON orders(discount_code_id);

-- These indexes will significantly improve:
-- - JOIN performance when querying related data
-- - DELETE CASCADE operations
-- - Foreign key constraint validation
-- - Overall query performance for common operations
