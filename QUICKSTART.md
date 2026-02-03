# 🚀 Quick Start Guide

Get your knitting pattern shop running in 15 minutes!

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier)
- A Stripe account (test mode)
- A Resend account (free tier)

---

## Step 1: Install Dependencies (Already Done ✅)

```bash
npm install
```

---

## Step 2: Get Your API Keys

### Supabase (5 minutes)
1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New project"
3. Choose a name, generate password, select region
4. Wait 2 minutes for project to be created
5. Go to **Settings** → **API**
6. Copy:
   - `Project URL` → Your `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → Your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → Your `SUPABASE_SERVICE_ROLE_KEY`

### Stripe (3 minutes)
1. Go to [stripe.com](https://stripe.com) and sign up
2. Make sure you're in **Test mode** (toggle in top right)
3. Go to **Developers** → **API keys**
4. Copy:
   - `Publishable key` → Your `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `Secret key` → Your `STRIPE_SECRET_KEY`

### Resend (2 minutes)
1. Go to [resend.com](https://resend.com) and sign up
2. Go to **API Keys**
3. Click "Create API Key"
4. Name it "development"
5. Copy the key → Your `RESEND_API_KEY`

---

## Step 3: Configure Environment

Create your `.env.local` file:

```bash
cp .env.local.example .env.local
```

Then edit `.env.local` and paste your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=  # Leave empty for now

# Resend
RESEND_API_KEY=re_...

# Admin
ADMIN_EMAIL=your-email@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Step 4: Set Up Database

1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New query**
4. Open `supabase/migrations/001_initial_schema.sql` in your code editor
5. Copy ALL the content
6. Paste into Supabase SQL Editor
7. Click **Run** (or press Cmd/Ctrl + Enter)
8. Wait for success message ✅
9. Repeat steps 3-7 for `supabase/migrations/002_storage_setup.sql`

### Make Yourself Admin

Run this query in Supabase SQL Editor (replace with your email):

```sql
-- First, create an account through your app, then run this:
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

---

## Step 5: Start the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🎉 You Should See

- ✅ Home page with hero section
- ✅ Navbar with "Sign In" and "Sign Up" buttons
- ✅ Footer with newsletter signup

---

## 🧪 Test It Out

### 1. Create an Account
1. Click "Sign Up" in navbar
2. Fill in your email and password
3. Click "Create account"
4. You should be redirected to `/library`

### 2. Check Your Profile in Supabase
1. Go to Supabase → **Table Editor** → `profiles`
2. You should see your new profile row

### 3. Make Yourself Admin
```sql
UPDATE profiles
SET is_admin = TRUE
WHERE email = 'your-email@example.com';
```

### 4. Test Protected Routes
1. Sign out
2. Try visiting `http://localhost:3000/library`
3. You should be redirected to login ✅
4. Log in → redirected back to library

### 5. Test Password Reset
1. Sign out
2. Click "Forgot password?"
3. Enter your email
4. Check your email for reset link
5. Click link and set new password

---

## 🐛 Troubleshooting

### "Can't connect to Supabase"
- Check that your URL and keys are correct in `.env.local`
- Restart dev server after changing `.env.local`
- Make sure keys have `NEXT_PUBLIC_` prefix where needed

### "Table doesn't exist"
- Make sure you ran BOTH migration files
- Check Supabase SQL Editor for error messages
- Try running migrations again

### "Auth callback error"
- Check that redirect URL is set in Supabase:
  - Go to **Authentication** → **URL Configuration**
  - Add `http://localhost:3000/auth/callback` to Redirect URLs

### "Email not sending"
- For development, Supabase uses their email service by default
- Check your spam folder
- For production, you'll need to configure SMTP

---

## ✅ Sprint 1 is Working If...

- [ ] You can sign up for an account
- [ ] You can log in
- [ ] You can visit `/library` when logged in
- [ ] You get redirected when visiting `/library` logged out
- [ ] You can reset your password
- [ ] Navbar shows your auth state correctly
- [ ] Toast notifications appear

---

## 📚 Learn More

- [Implementation Plan](docs/implementation_plan.md) - Full 12-sprint roadmap
- [Setup Guide](docs/setup_guide.md) - Detailed setup instructions
- [Sprint 1 Completion](docs/sprint1_completion.md) - What we built

---

## 🆘 Need Help?

If you get stuck:
1. Check the browser console for errors (F12 → Console)
2. Check the terminal for server errors
3. Review [docs/setup_guide.md](docs/setup_guide.md) for troubleshooting
4. Check Supabase logs: **Logs** → **Postgres Logs** / **Auth Logs**

---

## 🎯 Next Steps

Once Sprint 1 is working:
1. Test all authentication flows
2. Verify database tables exist in Supabase
3. Confirm you're marked as admin
4. Ready to build Sprint 2: Admin Panel! 🚀

**Estimated time to complete:** 15-30 minutes (including account creation)

Let's build something amazing! 🧶✨
