-- Fix all function security warnings by setting search_path
-- This prevents privilege escalation attacks

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- 2. Fix update_product_rating function
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  UPDATE public.products
  SET
    average_rating = (
      SELECT AVG(rating)::DECIMAL(2,1)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE product_id = COALESCE(NEW.product_id, OLD.product_id)
    )
  WHERE id = COALESCE(NEW.product_id, OLD.product_id);

  RETURN NEW;
END;
$$;

-- 3. Fix link_guest_orders_to_user function
-- This runs AFTER a profile is created and migrates guest data
CREATE OR REPLACE FUNCTION link_guest_orders_to_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Link guest orders to new user
  UPDATE public.orders
  SET user_id = NEW.id, guest_email = NULL
  WHERE guest_email = NEW.email AND user_id IS NULL;

  -- Link guest library items to new user
  -- Using a subquery to avoid conflicts if somehow the pattern already exists
  UPDATE public.library
  SET user_id = NEW.id, email = NULL
  WHERE email = NEW.email
    AND user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.library l2
      WHERE l2.user_id = NEW.id
        AND l2.product_id = library.product_id
    );

  RETURN NEW;
END;
$$;
