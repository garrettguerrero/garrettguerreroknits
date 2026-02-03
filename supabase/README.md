# Supabase Database Migrations

This folder contains SQL migration files for setting up your Supabase database.

## Running Migrations

### Option 1: Using Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **"New query"**
4. Copy and paste the content of `migrations/001_initial_schema.sql`
5. Click **"Run"** (or press Cmd/Ctrl + Enter)
6. Wait for it to complete
7. Repeat steps 3-6 for `migrations/002_storage_setup.sql`

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## What Each Migration Does

### 001_initial_schema.sql
- Creates all core tables (profiles, products, bundles, purchases, reviews, etc.)
- Sets up Row Level Security (RLS) policies for data access
- Creates indexes for performance
- Sets up triggers for automatic profile creation and rating updates
- Defines CHECK constraints for data validation

### 002_storage_setup.sql
- Creates storage buckets:
  - `patterns` (private) - for PDF files
  - `product-images` (public) - for product photos
  - `avatars` (public) - for user avatars
- Sets up storage policies for secure file access

## Setting Up Your First Admin User

After running migrations, you need to mark yourself as an admin:

1. Sign up through your app (or directly in Supabase Auth)
2. Go to **SQL Editor** in Supabase Dashboard
3. Run this query (replace with your email):

```sql
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

4. You now have admin access! 🎉

## Verifying Setup

To verify everything is set up correctly:

```sql
-- Check that all tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Check your admin status
SELECT id, email, is_admin FROM profiles WHERE email = 'your-email@example.com';
```

## Troubleshooting

### "relation already exists" error
- This means the table was already created
- You can drop it first: `DROP TABLE table_name CASCADE;`
- Or skip that part of the migration

### Storage bucket already exists
- Go to **Storage** in Supabase Dashboard
- Delete the existing bucket
- Re-run the storage migration

### RLS prevents data access
- Check your policies match your use case
- You can temporarily disable RLS for testing:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- Remember to re-enable it before production!

## Need Help?

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
