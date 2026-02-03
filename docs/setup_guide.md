# 🚀 Setup Guide for Garrett Guerrero Knits

This guide will walk you through setting up all the required services for your knitting pattern shop.

## 📋 Prerequisites

- A GitHub account
- A credit card (for Stripe & Resend, both have generous free tiers)

---

## 1️⃣ Supabase Setup (Database & Authentication)

### Step 1: Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** (or sign in if you have an account)
3. Click **"New project"**
4. Fill in:
   - **Name**: `garrett-guerrero-knits` (or any name you like)
   - **Database Password**: Generate a strong password (save this!)
   - **Region**: Choose closest to your users (e.g., US East)
   - **Pricing Plan**: Free tier is perfect to start
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Get Your API Keys

1. Once created, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

### Step 3: Enable Email Authentication

1. Go to **Authentication** → **Providers**
2. Make sure **Email** is enabled (should be by default)
3. Optionally configure:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`

### Step 4: Create Database Tables

We'll create SQL migration files that you can run. I'll generate these in the next step.

---

## 2️⃣ Stripe Setup (Payments)

### Step 1: Create a Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Sign up"** or **"Sign in"**
3. Complete the registration (you won't need to activate your account for testing)

### Step 2: Get Test API Keys

1. Make sure you're in **Test mode** (toggle in top right should say "Test")
2. Go to **Developers** → **API keys**
3. Copy:
   - **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (starts with `pk_test_`)
   - **Secret key** → `STRIPE_SECRET_KEY` (starts with `sk_test_`, click "Reveal test key")

### Step 3: Set Up Webhook (Later, After First Deploy)

We'll set this up after deploying because Stripe needs a public URL. For now:
1. Go to **Developers** → **Webhooks**
2. Click **"Add endpoint"** (we'll do this in Sprint 4)
3. You'll add: `https://your-domain.com/api/webhooks/stripe`
4. Select event: `checkout.session.completed`

**Note:** For local testing, you can use the Stripe CLI: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

---

## 3️⃣ Resend Setup (Email)

### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click **"Sign up"** (can use GitHub)
3. Verify your email

### Step 2: Get API Key

1. Once logged in, go to **API Keys**
2. Click **"Create API Key"**
3. Name it: `development` or `garrett-guerrero-knits`
4. Copy the key → `RESEND_API_KEY` (starts with `re_`)
5. ⚠️ Save it immediately (you can't see it again)

### Step 3: Verify Sending Domain (Optional for Now)

For development, Resend lets you send from `onboarding@resend.dev`. For production:
1. Go to **Domains**
2. Click **"Add Domain"**
3. Add your domain (e.g., `garrettguerrero.com`)
4. Follow DNS verification steps

**Note:** You can test with the default sending domain first!

---

## 4️⃣ Create Your .env.local File

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Fill in all the values you collected:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... (leave empty for now)

# Resend
RESEND_API_KEY=re_...

# Admin
ADMIN_EMAIL=your-email@example.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Save the file

---

## 5️⃣ Verify Installation

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - you should see your Next.js app running!

---

## 🆘 Troubleshooting

### Supabase Connection Issues
- Double-check your URL and keys are correct
- Make sure `NEXT_PUBLIC_` prefix is on public keys
- Restart your dev server after changing `.env.local`

### Stripe Webhook Testing Locally
- Install Stripe CLI: `brew install stripe/stripe-cli/stripe` (Mac)
- Login: `stripe login`
- Forward webhooks: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### Email Not Sending
- Verify your Resend API key is correct
- Check Resend dashboard for error logs
- Make sure you're sending from `onboarding@resend.dev` in development

---

## ✅ Next Steps

Once you have all credentials in `.env.local`, let me know and I'll:
1. Create the Supabase database schema (SQL migrations)
2. Build the authentication system
3. Create the layout components
4. Set up protected routes

Let me know when you're ready to continue! 🎉
