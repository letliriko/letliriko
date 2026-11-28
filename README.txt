LET LIRIKO UPDATED FILES
=======================

Replace the matching files in your existing website folder with the files in this package.
Keep your existing letliriko-logo.png and any other image/assets in the same folder.

Added:
- browse.html
- browse.js

Updated:
- index.html
- account.html
- account.js
- cloud.js
- nav.js
- messages.html
- song.js
- services.html
- style.css
- contact.html
- contact.js

Notes:
- Browse page displays public entries in a grid and opens a story detail modal when a card is clicked.
- The old preview slider is removed from the Entry page and the legacy Services page.
- Entry story length is checked at 1,000 words. The textarea uses a character ceiling as a browser-side safeguard, while JavaScript enforces the word count.
- Account page includes the cloud module once, before the account module.
- Logged-in users can see and delete their own entries from Accounts. The cloud delete query checks both entry ID and authenticated user ID.
- Logout appears in the navigation only when a user is signed in.
- Site-wide CSS disables animations and transitions.
- Contact page layout and contact submission logic are retained.

Supabase setup to verify:
- Username-only sign-up requires email confirmation disabled in Supabase Auth, as described in cloud.js.
- Confirm the entries table has Row Level Security policies that allow public reading if intended, authenticated insert with user_id = auth.uid(), and delete only when user_id = auth.uid().
- Confirm the Storage bucket "entry-backgrounds" exists and is public if uploaded entry background URLs should be publicly displayed.
- Browser publishable key is used; never put a service_role key in client-side code.

If the cloud module still fails to initialize, check the browser console for the module import error and verify the project URL/publishable key and Supabase Auth settings.
