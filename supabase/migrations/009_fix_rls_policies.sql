-- Fix overly permissive RLS policies
-- These policies currently allow anyone to insert/update data
-- We'll replace them with proper policies that only allow authenticated operations
-- Note: Service role key (used by API routes) bypasses RLS automatically

-- 1. Drop overly permissive policies
DROP POLICY IF EXISTS "API can create orders" ON orders;
DROP POLICY IF EXISTS "API can update orders" ON orders;
DROP POLICY IF EXISTS "API can create order items" ON order_items;
DROP POLICY IF EXISTS "API can create library items" ON library;

-- 2. Create proper policies for orders table
-- Allow authenticated users and service role to create orders
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL -- Can create for self or as guest
  );

-- Allow users to update their own orders
CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Create proper policies for order_items table
-- Allow authenticated users to create order items
CREATE POLICY "Authenticated users can create order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR orders.user_id IS NULL)
    )
  );

-- 4. Create proper policies for library table
-- Allow authenticated users to add to their library
CREATE POLICY "Authenticated users can add to library"
  ON library FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR user_id IS NULL -- Can create for self or as guest
  );

-- Note: The service role key (used by your API routes) automatically bypasses
-- all RLS policies, so your API routes will still work for guest checkouts
