-- Update handle_new_user function to migrate guest library entries
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- 1. Create profile for new user
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Migrate any guest library entries to the new user
  -- This finds all patterns claimed by this email as a guest and links them to the user account
  -- Using a subquery to avoid conflicts if somehow the pattern already exists for this user
  UPDATE public.library
  SET
    user_id = NEW.id,
    email = NULL
  WHERE
    email = NEW.email
    AND user_id IS NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.library l2
      WHERE l2.user_id = NEW.id
        AND l2.product_id = library.product_id
    );

  RETURN NEW;
END;
$$;
