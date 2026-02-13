-- Fix RLS performance issues by wrapping auth.uid() with SELECT
-- This prevents re-evaluation for each row, improving query performance at scale
-- See: https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select

-- Helper: Drop and recreate policies with optimized auth checks
-- This fixes the "auth_rls_initplan" warnings

-- 1. PROFILES TABLE
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING ((select auth.uid()) = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING ((select auth.uid()) = id);

-- 2. PRODUCTS TABLE
DROP POLICY IF EXISTS "Admins can view all products" ON products;
CREATE POLICY "Admins can view all products"
  ON products FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 3. REVIEWS TABLE
DROP POLICY IF EXISTS "Users can insert own reviews if they own the product" ON reviews;
CREATE POLICY "Users can insert own reviews if they own the product"
  ON reviews FOR INSERT
  WITH CHECK (
    user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM library
      WHERE library.user_id = (select auth.uid())
        AND library.product_id = reviews.product_id
    )
  );

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Admins can delete any review" ON reviews;
CREATE POLICY "Admins can delete any review"
  ON reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 4. BUNDLES TABLE
DROP POLICY IF EXISTS "Admins can manage bundles" ON bundles;
CREATE POLICY "Admins can manage bundles"
  ON bundles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 5. BUNDLE_ITEMS TABLE
DROP POLICY IF EXISTS "Admins can manage bundle items" ON bundle_items;
CREATE POLICY "Admins can manage bundle items"
  ON bundle_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 6. LIBRARY TABLE
DROP POLICY IF EXISTS "Users can view own library" ON library;
CREATE POLICY "Users can view own library"
  ON library FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all libraries" ON library;
CREATE POLICY "Admins can view all libraries"
  ON library FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can add to library" ON library;
CREATE POLICY "Authenticated users can add to library"
  ON library FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id OR user_id IS NULL
  );

-- 7. CART_ITEMS TABLE
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
CREATE POLICY "Users can manage own cart"
  ON cart_items FOR ALL
  USING (user_id = (select auth.uid()));

-- 8. FAVORITES TABLE
DROP POLICY IF EXISTS "Users can manage own favorites" ON favorites;
CREATE POLICY "Users can manage own favorites"
  ON favorites FOR ALL
  USING (user_id = (select auth.uid()));

-- 9. EMAIL_CAPTURES TABLE
DROP POLICY IF EXISTS "Admins can view email captures" ON email_captures;
CREATE POLICY "Admins can view email captures"
  ON email_captures FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 10. DISCOUNT_CODES TABLE
DROP POLICY IF EXISTS "Admins can manage discount codes" ON discount_codes;
CREATE POLICY "Admins can manage discount codes"
  ON discount_codes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

-- 11. ORDERS TABLE
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
CREATE POLICY "Admins can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Admins can update orders" ON orders;
CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create orders" ON orders;
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    (select auth.uid()) = user_id OR user_id IS NULL
  );

DROP POLICY IF EXISTS "Users can update own orders" ON orders;
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- 12. ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admins can view all order items" ON order_items;
CREATE POLICY "Admins can view all order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = (select auth.uid())
        AND profiles.is_admin = true
    )
  );

DROP POLICY IF EXISTS "Authenticated users can create order items" ON order_items;
CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = (select auth.uid()) OR orders.user_id IS NULL)
    )
  );

-- Note: This fixes 29 auth_rls_initplan warnings
-- Multiple permissive policies warnings remain but are generally acceptable
-- for cases where you need "admin OR owner" access patterns
