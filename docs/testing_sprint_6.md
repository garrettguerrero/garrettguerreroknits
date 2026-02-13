# Testing Guide: Sprint 6 - Library & Downloads

## Prerequisites Setup

### 1. Create Supabase Storage Bucket

1. Go to **Supabase Dashboard** → **Storage**
2. Click **"New bucket"**
3. Configure:
   - **Name**: `patterns`
   - **Public**: OFF (must be private)
   - **File size limit**: `52428800` (50MB)
   - **Allowed MIME types**: `application/pdf`
4. Click **"Create bucket"**
5. **Important**: Don't add any RLS policies (access controlled via API)

### 2. Prepare Test Materials

- **Test PDF**: Any PDF file under 50MB (can be a sample pattern or any PDF)
- **Test Email**: Use a real email you can access for testing

---

## Test Scenario 1: Upload Pattern PDF

### Step 1: Create Pattern in Admin Panel

1. Navigate to `/admin/patterns/new`
2. Fill in required fields:
   ```
   Title: Test Free Pattern
   Price: 0 (for free pattern)
   Category: knit
   Skill Level: beginner
   Description: This is a test pattern for library testing
   Short Description: Test pattern
   Published: YES
   ```
3. Click **"Save"** or **"Save & Publish"**
4. **Copy the Product ID** from the URL (you'll need it for the PDF path)
   - URL will be: `/admin/patterns/[product-id]/edit`
   - Copy the UUID part

### Step 2: Upload PDF to Supabase Storage

1. Go to **Supabase Dashboard** → **Storage** → **patterns** bucket
2. Click **"Upload file"**
3. **Folder structure**: Create folder named with your product ID
   - Example: `abc123-def456-789-012/pattern.pdf`
4. Upload your test PDF file
5. Rename it to `pattern.pdf` if needed

### Step 3: Link PDF to Pattern

1. Return to admin pattern editor: `/admin/patterns/[product-id]/edit`
2. Find the **"PDF Storage Path"** field
3. Enter: `[product-id]/pattern.pdf`
   - Example: `abc123-def456-789-012/pattern.pdf`
4. Save the pattern

---

## Test Scenario 2: Get Free Pattern as Guest User

### What to Test:
Free pattern flow for non-authenticated users with email capture

### Steps:

1. **Open incognito/private browser window** (to simulate guest user)
2. Navigate to `/marketplace`
3. Find your test free pattern (should show green "Free" badge)
4. Click **"Add to Library"** button
5. **Modal should appear** asking for email
6. Enter your test email
7. Click **"Get Free Pattern"**
8. Check:
   - ✅ Success toast appears
   - ✅ Modal closes
   - ✅ Check your email inbox for confirmation
   - ✅ Email should contain pattern details

### Expected Database State:
```sql
-- Check email_captures table
SELECT * FROM email_captures WHERE email = 'your-test@email.com';

-- Should NOT be in library yet (guest user has no account)
SELECT * FROM library WHERE email = 'your-test@email.com';
```

---

## Test Scenario 3: Sign Up After Claiming Free Pattern

### What to Test:
Guest library migration - free patterns should appear in library after signup

### Steps:

1. **While still in incognito**, navigate to `/auth/signup`
2. Sign up with **the same email** you used for the free pattern
3. Complete signup and email confirmation
4. Once logged in, navigate to `/library`
5. **Check that your free pattern appears in the library!**

### Expected Results:
- ✅ Pattern appears in library grid
- ✅ Shows "Added [date]" timestamp
- ✅ Download PDF button visible
- ✅ Read Pattern button visible
- ✅ Version badge shows (if pattern has version set)

### Database Verification:
```sql
-- Check migration happened
SELECT * FROM library WHERE user_id = '[your-new-user-id]';
-- Should show the pattern with user_id filled in

-- Email should be cleared
SELECT * FROM library WHERE email = 'your-test@email.com';
-- Should return nothing (migrated to user_id)
```

---

## Test Scenario 4: Download Pattern PDF

### What to Test:
Secure PDF download with ownership verification

### Steps:

1. Navigate to `/library` (must be logged in)
2. Find your test pattern
3. Click **"Download PDF"** button
4. **Observe**:
   - ✅ Button shows "Downloading..." briefly
   - ✅ Success toast: "Download started!"
   - ✅ New tab opens with PDF
   - ✅ PDF displays or downloads (depending on browser)
   - ✅ Button returns to "Download PDF" after ~1 second

### Testing Error Cases:

**Test 1: Try downloading pattern you don't own**
1. Open browser DevTools → Console
2. Try to access: `/api/download/[some-other-pattern-id]`
3. **Expected**: 403 Forbidden error
4. **Expected**: Error message: "You do not own this pattern"

**Test 2: Pattern without PDF**
1. Create a pattern in admin without setting pdf_storage_path
2. Add it to your library manually (via SQL)
3. Try to download
4. **Expected**: 404 error
5. **Expected**: Error message: "PDF not available"

### Verify Download Count:
```sql
-- Check times_downloaded incremented
SELECT id, title, times_downloaded
FROM products
WHERE id = '[your-test-pattern-id]';
-- Should increase by 1 after each download
```

---

## Test Scenario 5: Version Updates

### What to Test:
Pattern update notifications when admin publishes new version

### Steps:

**Step 1: Set Initial Version**
1. Go to admin pattern editor
2. Set **Version**: `1.0`
3. Set **Changelog**: `Initial release`
4. Save pattern
5. Verify in library: Shows "v1.0" badge

**Step 2: User Views Pattern**
1. Navigate to `/library`
2. Note that pattern shows "v1.0" (no update badge)
3. Check database:
   ```sql
   SELECT last_viewed_version, current_version, has_update
   FROM library_with_updates
   WHERE user_id = '[your-user-id]';
   ```
   - Should show: `last_viewed_version = '1.0'`, `has_update = false`

**Step 3: Admin Updates Version**
1. Go back to admin pattern editor
2. Update **Version**: `2.0`
3. Update **Changelog**: `Added new stitch pattern, fixed typo in row 15`
4. Save pattern

**Step 4: Check Update Notification**
1. Refresh `/library` page
2. **Verify "Updated!" badge appears**:
   - ✅ Green animated badge on cover image (replaces version badge)
   - ✅ Text: "New version available!" below date
   - ✅ Badge should pulse (animate-pulse class)

### Database Verification:
```sql
SELECT last_viewed_version, current_version, has_update
FROM library_with_updates
WHERE user_id = '[your-user-id]';
```
Expected:
- `last_viewed_version = '1.0'`
- `current_version = '2.0'`
- `has_update = true`

---

## Test Scenario 6: "Read Pattern" Button

### What to Test:
Link to pattern reader (will 404 until Sprint 7)

### Steps:

1. Navigate to `/library`
2. Click **"Read Pattern"** button
3. **Expected**: Navigates to `/patterns/[slug]/read`
4. **Expected**: 404 page (pattern reader not built yet - Sprint 7)

**This is correct behavior!** The button works, but the destination page doesn't exist yet.

---

## Test Scenario 7: Purchase Flow → Library

### What to Test:
Paid patterns appear in library after purchase

### Steps:

**Prerequisite**: Set up Stripe test mode and webhook (from Sprint 4)

1. Create a **paid** pattern in admin:
   - Price: `5.00`
   - Published: YES
2. Navigate to `/marketplace`
3. Find your paid pattern
4. Click **"Add to Cart"**
5. Go to cart → **"Checkout"**
6. Complete Stripe test checkout:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any CVC
7. Complete payment
8. **Check library**: Pattern should appear
9. Click **"Download PDF"**: Should work immediately

---

## Test Scenario 8: Empty Library State

### What to Test:
Empty state UI for new users

### Steps:

1. Create a new test account (different email)
2. Log in
3. Navigate to `/library`
4. **Verify empty state displays**:
   - ✅ 🧶 emoji
   - ✅ "Your library is empty" heading
   - ✅ Description text
   - ✅ Two buttons:
     - "Get Free Pattern" → `/marketplace?filter=free`
     - "Browse All Patterns" → `/marketplace`

---

## Common Issues & Troubleshooting

### Issue: "Failed to generate download link"

**Causes:**
- Storage bucket doesn't exist
- Bucket is named incorrectly (must be "patterns")
- pdf_storage_path is incorrect in pattern

**Fix:**
1. Verify bucket exists and is named exactly "patterns"
2. Check pdf_storage_path matches actual file location
3. Verify file exists in storage: Dashboard → Storage → patterns

### Issue: "You do not own this pattern"

**Causes:**
- Not logged in
- Pattern not in library table for this user

**Fix:**
1. Verify user is logged in
2. Check library table:
   ```sql
   SELECT * FROM library WHERE user_id = '[user-id]' AND product_id = '[pattern-id]';
   ```
3. Add manually for testing:
   ```sql
   INSERT INTO library (user_id, product_id, acquired_via)
   VALUES ('[user-id]', '[pattern-id]', 'purchase');
   ```

### Issue: Download count not incrementing

**Cause:** RPC function not created or permission denied

**Fix:**
```sql
-- Verify function exists
SELECT * FROM pg_proc WHERE proname = 'increment_download_count';

-- Manually run migration 012 if needed
```

### Issue: "Updated!" badge not showing

**Causes:**
- View not created
- Versions are the same
- last_viewed_version not set

**Fix:**
1. Check view exists:
   ```sql
   SELECT * FROM library_with_updates WHERE user_id = '[user-id]';
   ```
2. Verify versions differ:
   ```sql
   SELECT last_viewed_version, current_version, has_update FROM library_with_updates;
   ```

---

## Quick Test Checklist

Use this for fast regression testing:

- [ ] Storage bucket "patterns" exists and is private
- [ ] Can upload PDF to bucket via Dashboard
- [ ] Pattern in admin has pdf_storage_path set correctly
- [ ] Guest user can claim free pattern with email
- [ ] Guest library migrates to user account on signup
- [ ] Library page loads and shows patterns
- [ ] "Download PDF" button opens PDF in new tab
- [ ] Download count increments in database
- [ ] Version badge shows on library card
- [ ] Updating version shows "Updated!" badge
- [ ] "Read Pattern" links to `/patterns/[slug]/read`
- [ ] Empty library shows empty state UI
- [ ] Error toast shows when download fails
- [ ] Unauthorized download returns 403

---

## Performance Checks

### Page Load Speed
- `/library` should load in < 1 second
- Grid should render without layout shift
- Images should lazy load

### Database Queries
Check query performance:
```sql
-- Should be fast (uses indexes)
EXPLAIN ANALYZE
SELECT * FROM library_with_updates WHERE user_id = '[user-id]';
```

### Download API Response Time
- Signed URL generation should be < 500ms
- Redirect should be instant

---

## Next Steps After Testing

Once all tests pass:

1. **Document any patterns you uploaded** (keep them for future testing)
2. **Test with real patterns** (actual knitting PDFs)
3. **Test on mobile devices** (responsive layout)
4. **Prepare for Sprint 7** (pattern reader needs MDX content)

---

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs
3. Check server logs: Terminal running `npm run dev`
4. Review migration status: `npx supabase db diff`
