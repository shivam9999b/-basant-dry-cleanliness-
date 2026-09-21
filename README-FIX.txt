BASANTA FIXED FILES

1. content-admin.js now uses the correct Supabase Storage bucket:
   website-image
2. content-admin.html has image upload status.
3. app.js now maps site_contact fields to the actual IDs in index.html:
   contactPhone, contactWhatsapp, contactEmail, contactAddress,
   contactInstagram, contactFacebook.
4. supabase-policies.sql contains the RLS policies required by the current
   no-admin-login setup.

IMPORTANT:
- Put your real SUPABASE_URL and SUPABASE_ANON_KEY into app.js and
  content-admin.js (and admin.js if you use the orders dashboard).
- Run supabase-policies.sql in Supabase SQL Editor.
- The policies allow anonymous writes because there is no admin auth yet.
  Do not use this configuration for a public production admin panel.
