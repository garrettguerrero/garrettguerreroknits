Perfect! Let me create a streamlined, developer-agent-friendly implementation plan.

---

# 🧶 **Knitting Pattern Shop: Developer Implementation Plan**

## **Project Overview**
Solo designer selling knitting/crochet patterns. All patterns include PDFs + rich blog-style content (embedded videos, images, links). Some patterns free (email capture), most paid. Mobile-first design with minimalist serif/sans aesthetic.

---

## **Tech Stack**
- **Frontend:** Next.js 14 (App Router), Tailwind CSS, TypeScript
- **Backend:** Supabase (Auth, Database, Storage)
- **Payments:** Stripe Checkout + Webhooks
- **Email:** Resend
- **Hosting:** Vercel

---

## **Database Schema**

```sql
-- Core Tables
profiles (extends auth.users)
  - id, email, display_name, avatar_url, is_admin, newsletter_subscribed, created_at

products
  - id, title, slug, description, short_description
  - price, is_free, category, skill_level, yarn_weight, finished_size
  - pdf_storage_path, cover_image_url, thumbnail_url
  - mdx_content_path, has_video_content
  - average_rating, total_reviews, times_downloaded
  - version, changelog, is_published, created_at, updated_at

bundles
  - id, title, slug, description, price, discount_percentage
  - cover_image_url, is_published, created_at

bundle_items
  - bundle_id, product_id

purchases
  - id, user_id, stripe_session_id, stripe_payment_intent_id
  - amount_paid, status, created_at

purchase_items
  - purchase_id, product_id, bundle_id, price_paid

library (what users own)
  - user_id, product_id, acquired_via (purchase/free_download/bundle), created_at

cart_items (persistent cart)
  - user_id, product_id, bundle_id, created_at

reviews
  - id, user_id, product_id, rating, title, comment
  - is_verified_purchase, created_at, updated_at

favorites
  - user_id, product_id, created_at

email_captures (for non-authenticated free downloads)
  - email, product_id, created_at, converted_to_user

discount_codes
  - code, discount_type (percentage/fixed), discount_value
  - valid_from, valid_until, max_uses, times_used, is_active

-- Pattern Content (MDX files stored in repo, not DB)
/patterns-content/[slug]/index.mdx
```

**RLS Policies Required:**
- Users read own profiles, library, purchases, cart, favorites
- Public read on published products, bundles, reviews
- Admin full access to all tables

---

## **Sprint Breakdown**

### **Sprint 1: Foundation (Week 1)**
**Setup & Authentication**

1. Initialize Next.js with TypeScript, Tailwind, App Router
2. Install dependencies: `@supabase/supabase-js`, `@supabase/auth-helpers-nextjs`, `stripe`, `resend`, `react-hot-toast`, `@headlessui/react`, `lucide-react`, `next-mdx-remote`
3. Configure Playfair Display (serif) + Inter (sans) in Tailwind config
4. Set up Supabase: Create project, enable auth, create all tables with RLS
5. Build auth flows:
   - `/auth/login` - email/password login
   - `/auth/signup` - registration
   - `/auth/callback` - OAuth callback handler
   - `/auth/reset-password` - password reset
6. Create layout components:
   - `Navbar` (with cart icon showing item count, auth button)
   - `Footer` (newsletter signup form)
   - `AuthButton` component
7. Set up `middleware.js` to protect routes: `/library`, `/admin`, `/checkout`

**Deliverable:** Authentication works. Protected routes redirect to login.

---

### **Sprint 2: Admin Panel (Week 2)**
**Content Management System**

Build admin dashboard at `/admin/*` (protected by `is_admin` check):

1. **Dashboard** (`/admin`)
   - Stats cards: Total revenue (month), new customers (week), email list size
   - Recent orders table
   - Top 5 selling patterns

2. **Pattern Manager** (`/admin/patterns`)
   - Table view: All patterns with quick filters (published/draft, category)
   - Search by title
   - Quick actions: Publish/unpublish, delete
   - "Add New Pattern" button

3. **Pattern Editor** (`/admin/patterns/new` & `/admin/patterns/[id]/edit`)
   - Form fields:
     - Title, slug (auto-generate from title)
     - Short description (for cards), full description
     - Price (0 for free), category, skill level, yarn weight, size
     - Cover image upload (drag-drop to Supabase Storage)
     - PDF upload (to private `patterns` bucket)
     - MDX file upload or editor
     - Version number, changelog textarea
     - SEO: Meta title, meta description
     - Toggle: Published/Draft, Featured, Has Video Content
   - Save button, "Save & Publish" button
   - Image preview, PDF preview

4. **Bundle Manager** (`/admin/bundles`)
   - Create bundles: Select multiple patterns
   - Set bundle price, calculate discount percentage
   - Upload bundle cover image

5. **Discount Codes** (`/admin/discounts`)
   - Create codes: Type (percentage/fixed), value, expiry, usage limit
   - Activate/deactivate codes
   - View usage stats

6. **Orders** (`/admin/orders`)
   - List all purchases with search/filter
   - View order details
   - Refund button (Stripe API integration)

**Deliverable:** Admin can manage entire shop without touching database or code.

---

### **Sprint 3: Marketplace & Product Pages (Week 3)**
**Customer-Facing Shopping Experience**

1. **Marketplace** (`/marketplace`)
   - Fetch all published products (server component)
   - Hero section: Featured pattern (large image, auto-select newest or admin-flagged)
   - Multi-select filters sidebar:
     - Category (checkboxes: Knit, Crochet)
     - Skill level (Beginner, Intermediate, Advanced)
     - Yarn weight (Fingering, Sport, DK, Worsted, Bulky)
     - Price (Free, Under $10, $10-20, $20+)
   - Filter logic: Products match ALL selected filters within a category, ANY across categories
   - Grid layout: 3 cols desktop, 2 tablet, 1 mobile
   - Sort dropdown: Newest, Price (low-high), Price (high-low), Most Popular

2. **ProductCard Component**
   - Cover image (lazy load)
   - "Free" badge or price
   - Title, category badge
   - Star rating (if reviews exist)
   - Heart icon (add to favorites, toggle state)
   - "Add to Cart" button
   - Hover: Quick view of short description

3. **Pattern Page** (`/patterns/[slug]`)
   - Hero: Large cover image, title, price, average rating
   - Sticky sidebar (desktop):
     - Price, "Add to Cart" button
     - "Add to Favorites" heart
     - Pattern details card (skill level, yarn weight, size, category)
   - Tabs:
     - Overview: Full description
     - Details: Materials needed, gauge, abbreviations
     - Reviews: Display all with sort (newest, highest rated)
   - Related patterns section (same category, exclude current)
   - If owned: "Download PDF" + "Read Pattern" buttons appear

4. **Bundles Page** (`/bundles`)
   - Grid of bundles
   - Bundle card shows: Cover, title, "Save X%" badge, price, included pattern count
   
5. **Bundle Detail** (`/bundles/[slug]`)
   - Show all included patterns
   - Total value vs. bundle price (savings highlighted)
   - "Add Bundle to Cart" button

**Deliverable:** Beautiful marketplace with filtering. Individual pattern pages render correctly.

---

### **Sprint 4: Cart & Checkout (Week 4)**
**Payment Flow**

1. **Cart System**
   - Global cart context (or Zustand store)
   - Persist cart to database for logged-in users
   - LocalStorage fallback for guests
   - Merge guest cart on login

2. **Cart UI**
   - Drawer component (slides from right on desktop, bottom on mobile)
   - Line items: Thumbnail, title, price, remove button
   - Subtotal, discount (if code applied), total
   - Discount code input with "Apply" button (validate via API)
   - "Checkout" button
   - Empty state: "Your cart is empty" with link to marketplace

3. **Checkout Flow**
   - User must be logged in (redirect to signup/login if not)
   - `/checkout` page: Review items, apply discount, confirm
   - API route: `/api/checkout` (POST)
     - Validate user authentication
     - Fetch cart items from database
     - Apply discount code if valid
     - Create Stripe Checkout Session
     - Metadata: `{ userId, cartItems: [{productId, price}], discountCode }`
     - Set `success_url`: `/checkout/success?session_id={CHECKOUT_SESSION_ID}`
     - Set `cancel_url`: `/checkout/cancel`
     - Return session URL

4. **Stripe Webhook** (`/api/webhooks/stripe`)
   - Verify webhook signature
   - On `checkout.session.completed`:
     - Extract metadata (userId, cartItems)
     - Create `purchase` record
     - Create `purchase_items` records
     - Add products to user's `library` table
     - Clear user's cart
     - Send confirmation email (Resend):
       - Order summary
       - "View Your Library" button
       - Individual download links for each pattern
   - Return 200 OK

5. **Success/Cancel Pages**
   - `/checkout/success`: "Thank you!" message, order summary, link to library
   - `/checkout/cancel`: "Checkout cancelled" message, link back to cart

**Deliverable:** Full checkout flow with Stripe. Purchased patterns appear in library.

---

### **Sprint 5: Free Patterns & Email Capture (Week 5)**
**Lead Generation**

1. **Free Pattern Flow**
   - **Logged-in users:** Click "Download" → instant add to library → toast notification
   - **Guest users:** Click "Download" → modal appears
     - Email input field
     - Checkbox: "Send me newsletter & pattern updates"
     - "Get Free Pattern" button
     - On submit:
       - Save to `email_captures` table
       - Add email to Resend audience (tag: "free_download")
       - Generate 1-hour signed URL for PDF
       - Send email with:
         - Download link
         - CTA: "Create account to save to your library forever"
       - Show success message: "Check your email!"

2. **Newsletter Signup**
   - Footer form (email input + submit)
   - `/newsletter` dedicated page
   - Add to Resend audience (tag: "newsletter")
   - Confirmation email

3. **Email Templates** (Resend)
   - Free pattern delivery
   - Purchase confirmation
   - Password reset
   - Newsletter (manual send for now)

**Deliverable:** Free patterns drive email signups. Emails deliver reliably.

---

### **Sprint 6: User Library & Downloads (Week 6)**
**Secure Content Delivery**

1. **Library Page** (`/library`)
   - Fetch owned patterns: JOIN `library` with `products`
   - Search bar (filter by title client-side)
   - Filter: Category, show only free/paid
   - Sort: Recently added, alphabetical
   - Grid layout (same as marketplace)

2. **LibraryCard Component**
   - Cover image
   - Title, category
   - "Download PDF" button
   - "Read Pattern" button (opens blog reader)
   - Version number badge
   - If new version available: "Updated!" badge

3. **Download API** (`/api/download/[productId]`)
   - Verify user owns pattern (check `library` table)
   - Generate signed URL from Supabase Storage (60 second expiry)
   - Increment `products.times_downloaded`
   - Redirect to signed URL (forces download)
   - Return 403 if unauthorized

4. **Supabase Storage Setup**
   - Create `patterns` bucket (private, no public access)
   - RLS policy: Only allow downloads via signed URLs
   - Organize: `/patterns/{product-id}/pattern.pdf`

5. **Version Management**
   - When admin updates pattern version in admin panel:
     - Update `version` and `changelog` fields
     - Find all users who own pattern
     - Send "Pattern Updated" email
     - Badge in library until user acknowledges/downloads

**Deliverable:** Users can access their library. Downloads are secure and tracked.

---

### **Sprint 7: Blog-Style Pattern Reader (Week 7)**
**Rich Content Patterns**

1. **MDX Setup**
   - Store MDX files in `/patterns-content/[slug]/index.mdx`
   - Store pattern images in `/patterns-content/[slug]/images/`
   - Configure `next-mdx-remote` with plugins: `remark-gfm`, `rehype-highlight`

2. **Pattern Reader** (`/patterns/[slug]/read`)
   - Check if user owns pattern (redirect to pattern purchase page if not)
   - Fetch MDX file server-side
   - Render with custom components:
     - `<Step number="1">` - Styled step blocks with auto-numbering
     - `<Video src="youtube-url" />` - Embedded responsive video
     - `<Image />` - Optimized Next.js images from pattern folder
     - `<Materials>` - Formatted materials list
     - `<Gauge>` - Highlighted gauge info box
     - `<Note>` - Callout boxes for tips
     - `<Link>` - External helpful links (opens new tab)

3. **Reader Features**
   - Sticky table of contents (desktop, auto-generated from headings)
   - Progress bar (scroll depth indicator)
   - Font size controls (+/- buttons)
   - Print button (optimized print stylesheet)
   - "Download PDF" button (links to download API)

4. **Mobile Optimizations**
   - Larger base font size (18px)
   - Bottom nav: Previous step, Next step
   - Sticky "Mark Complete" checkbox per step (save state in localStorage)
   - Keep screen awake while reading (Screen Wake Lock API)

5. **Paywall for Non-Owners**
   - Show first 20% of content
   - Blur overlay on rest
   - "Purchase to Read Full Pattern" CTA button

**Deliverable:** Blog patterns render beautifully with videos/images. Mobile experience is excellent.

---

### **Sprint 8: Reviews & Ratings (Week 8)**
**Social Proof**

1. **Review Form** (on pattern page, below description)
   - Only show if user owns pattern
   - Check if user already reviewed (show edit form instead)
   - Fields: Star rating (1-5), title (optional), comment
   - Submit button

2. **Review Display**
   - Show all reviews on pattern page
   - Display: Star rating, title, comment, user display name, date, "Verified Purchase" badge
   - Sort: Most recent, highest rated, lowest rated
   - Pagination (10 per page)

3. **Review API** (`/api/reviews`)
   - POST: Create review (verify ownership)
   - PATCH: Edit own review
   - DELETE: Delete own review (or admin can delete any)

4. **Rating Aggregation**
   - After any review change, recalculate `products.average_rating` and `products.total_reviews`
   - Use database function or run in webhook

5. **Admin Moderation** (in admin panel)
   - View all reviews
   - Delete inappropriate ones
   - No approval flow (trust users, moderate reactively)

**Deliverable:** Review system works. Ratings display on product cards and pages.

---

### **Sprint 9: Favorites & Recommendations (Week 9)**
**User Engagement**

1. **Favorites System**
   - Heart icon on all product cards
   - Toggle favorite (API route: POST/DELETE `/api/favorites`)
   - Update UI optimistically
   - Must be logged in (show login prompt if not)

2. **Favorites Page** (`/favorites`)
   - Grid of favorited patterns
   - "Add to Cart" button on each
   - "Remove" button
   - Empty state: "No favorites yet. Start browsing!"

3. **Recommendations** (on pattern page)
   - "You Might Also Like" section
   - Logic: Same category + similar skill level, exclude current pattern
   - Show 4 patterns in grid
   - Fallback: Most popular patterns if no matches

4. **Recently Viewed** (optional)
   - Track last 5 viewed patterns in localStorage
   - Show in account dropdown or dedicated page

**Deliverable:** Users can save favorites. Recommendations appear on pattern pages.

---

### **Sprint 10: SEO & Performance (Week 10)**
**Optimization**

1. **SEO Implementation**
   - Add `metadata` export to all pages (dynamic for patterns/bundles)
   - Generate OG images using `@vercel/og` (pattern cover + title overlay)
   - Structured data (JSON-LD) for products:
     - Product schema
     - AggregateRating schema (if reviews exist)
   - Generate `sitemap.xml` (dynamic, includes all patterns/bundles)
   - `robots.txt`

2. **Image Optimization**
   - Use Next.js `<Image>` component everywhere
   - Serve WebP format
   - Lazy loading (default behavior)
   - Blur placeholders (from Supabase Storage or local)

3. **Performance Tuning**
   - Use Server Components for data fetching (default in App Router)
   - Client Components only for interactivity (cart, filters, forms)
   - Database indexes on: `products.slug`, `products.category`, `products.is_published`
   - Enable Postgres connection pooling in Supabase

4. **Social Sharing**
   - Open Graph meta tags (all pages)
   - Twitter Card meta tags
   - "Pin It" button on pattern images (Pinterest integration)

5. **Analytics**
   - Install Vercel Analytics (or Plausible for privacy-friendly)
   - Track key events: Page views, add-to-cart, purchases, signups

**Deliverable:** Site is fast, SEO-optimized, shareable on social media.

---

### **Sprint 11: Polish & Testing (Week 11)**
**Quality Assurance**

1. **Loading States**
   - Skeleton screens for: Marketplace grid, pattern page, library, cart
   - Loading spinners for: Button actions, form submissions
   - Optimistic UI: Cart add/remove, favorites toggle

2. **Empty States**
   - Empty cart: "Start shopping!" with featured patterns
   - Empty library: "Browse patterns to get started"
   - No search results: "Try different filters" with suggestion
   - No reviews yet: "Be the first to review!"

3. **Error Handling**
   - Custom 404 page (branded design)
   - Custom 500 page
   - Toast notifications for all errors (user-friendly messages)
   - Retry buttons on failed API calls
   - Form validation with helpful error messages

4. **Accessibility**
   - Keyboard navigation (tab through all interactive elements)
   - ARIA labels on icons (heart, cart, etc.)
   - Color contrast checks (WCAG AA minimum)
   - Focus indicators
   - Alt text on all images

5. **Mobile Testing**
   - Test on real devices: iOS Safari, Android Chrome
   - Touch target sizes (minimum 44x44px)
   - Responsive breakpoints: 640px, 768px, 1024px, 1280px
   - Bottom sheet modals on mobile (cart, filters)

6. **Payment Testing**
   - Test Stripe flow with test cards
   - Test discount codes
   - Test bundle purchases
   - Test free pattern downloads
   - Test email delivery (all templates)

7. **Cross-Browser Testing**
   - Chrome, Firefox, Safari, Edge
   - Test pattern reader (MDX rendering)
   - Test video embeds

**Deliverable:** Polished, accessible, tested site ready for launch.

---

### **Sprint 12: Legal & Launch (Week 12)**
**Go Live**

1. **Legal Pages**
   - Terms of Service (`/terms`)
   - Privacy Policy (`/privacy`)
   - Refund Policy (`/refunds`)
   - Contact page (`/contact`) with form (sends to your email via Resend)

2. **Pre-Launch Checklist**
   - [ ] Seed database with real patterns (at least 10)
   - [ ] Test all user flows end-to-end
   - [ ] Set up custom domain
   - [ ] Switch Stripe to production mode
   - [ ] Configure Resend DNS (SPF, DKIM)
   - [ ] Add environment variables to Vercel
   - [ ] Set up error monitoring (Sentry optional)
   - [ ] Create backup strategy (Supabase auto-backups)

3. **Deployment**
   - Push to GitHub
   - Connect to Vercel
   - Deploy production build
   - Test on production URL
   - Set up automatic deployments (main branch)

4. **Soft Launch**
   - Launch to email list (if you have one)
   - Share on social media
   - Monitor error logs first 48 hours
   - Fix any critical bugs immediately

**Deliverable:** Site is live and generating sales!

---

## **Post-Launch Roadmap**

### **Month 2-3:**
- Newsletter automation (weekly pattern highlights via Resend)
- Gift cards (Stripe Product type: gift card)
- Customer support widget (Intercom or plain email)
- Advanced analytics dashboard in admin

### **Month 4-6:**
- Pattern quiz ("Find your next project")
- Yarn substitution tool
- Community features (comments on blog patterns)
- Subscription model (monthly pattern club)

---

## **Key Technical Decisions**

1. **Server Components by Default:** Use Client Components only for forms, interactivity (cart, filters)
2. **Database-First:** All content in database, not hardcoded
3. **MDX for Rich Content:** Allows flexibility for pattern presentation
4. **Signed URLs:** Critical for secure PDF delivery
5. **Webhook-Driven:** Stripe webhooks handle all post-payment logic
6. **Mobile-First CSS:** Design for mobile, enhance for desktop
7. **No Auth on Free Patterns:** Lower barrier to email capture

---

## **Environment Variables Needed**

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Admin
ADMIN_EMAIL= # For first admin user setup
```

---

## **Success Metrics**

- Email list growth (track per pattern)
- Conversion rate (free → paid)
- Average order value
- Cart abandonment rate
- Most popular patterns
- Mobile vs. desktop traffic

---

**This plan is ready for a developer agent.** Each sprint has clear deliverables. All features are scoped. Database schema is complete. Tech stack is defined. Good luck with your shop! 🚀