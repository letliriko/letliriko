LETLIRIKO - INTEGRATED SUPABASE VERSION

Replace the corresponding six files in your GitHub Pages project with these files:
index.html, services.html, style.css, entries.js, song.js, cloud.js

The cloud.js file contains the Supabase Project URL and Publishable Key that were already present in the cloud.js file you uploaded. These are the browser-safe publishable credentials. Never put a Supabase Secret key or service_role key in website files.

The Supabase setup SQL must already have been run successfully. It should create/alter public.entries, create public.songs, configure public read/insert policies, create the public entry-backgrounds storage bucket and upload policy, and enable realtime for both tables.

After replacing files, commit/push to GitHub. Open services.html from the GitHub Pages site and hard-refresh with Ctrl+F5. Open F12 > Console and check for errors.

Notes:
- Existing built-in sample entries and local sample songs remain in the site.
- New entries and custom songs are saved to Supabase and shared across visitors.
- Visitor-created entries stored in this browser's old localStorage are migrated once when cloud starts.
- Photo uploads require the entry-backgrounds storage bucket and upload policy from the SQL setup.
- The database is publicly readable and allows anonymous inserts as configured for this school demo; do not store private/personal information.
