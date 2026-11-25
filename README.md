# LetLiriko — updated website

This package updates the existing LetLiriko project while keeping the existing OPM song list, sample entries, Spotify embeds, Supabase project, and scrapbook-inspired design.

## Files

- `index.html` — homepage
- `messages.html` — renamed Services page with song selection and entry posting
- `contact.html` / `contact.js` — contact and feedback form
- `account.html` / `account.js` — optional username/password account page
- `style.css` — shared responsive styles
- `entries.js` — original song list and sample/local data
- `song.js` — song, entry, preview, toast, and owner-delete behavior
- `cloud.js` — Supabase database, storage, and authentication operations
- `nav.js` — shared navigation state and toast notifications
- `supabase-migration.sql` — required database migration
- `assets/letliriko-logo.png` — supplied official logo

## Before deployment

1. Back up your Supabase project and current website repository.
2. Open Supabase Dashboard → SQL Editor.
3. Review and run `supabase-migration.sql`. It preserves existing entry rows, adds `user_id`, and creates the private `contact_messages` table.
4. In Supabase Dashboard → Authentication → Providers → Email, disable **Confirm email** for this username-only school demo. The account UI uses a generated non-deliverable address (`username@accounts.letliriko.invalid`) internally because Supabase password authentication uses an email identifier. Users enter only a username and password on the website. There is no email verification or password-reset flow in this demo.
5. Keep the existing `entry-backgrounds` Storage bucket and its upload/public-read policies. Do not add a Supabase secret or service-role key to frontend files.
6. Upload all files and the `assets` folder to the root of your GitHub Pages repository. Remove/replace the old `services.html` file after confirming the new `messages.html` works.
7. Commit and push. Open the site over its GitHub Pages HTTPS URL and hard-refresh with Ctrl+F5.

## Important behavior and limitations

- Browsing and posting remain available without an account.
- Entries created while signed in receive `user_id = auth.uid()` through the database default. Anonymous entries remain ownerless and public.
- Existing entries are preserved and remain public. They are not assigned to any account retroactively.
- Only authenticated owners can delete their own entries. The frontend hides the delete control for other entries, and Supabase RLS enforces the restriction on the server.
- Contact messages can be inserted by visitors but cannot be read through the public website. To review submissions, use the Supabase Dashboard with an authorized project role.
- The contact email field is optional. The website does not send email notifications; it stores messages in Supabase.
- The username-only demo has no email recovery. Users who forget their password will need an administrator to handle account recovery through a separate secure process.
- Existing sample entries stored locally may not have timestamps; their date is omitted. Cloud entries display their original `created_at` timestamp.
- This frontend still depends on your existing Supabase schema for `entries`, `songs`, and the `entry-backgrounds` bucket. The migration does not recreate your songs table or storage bucket.

## Quick checks

- Open `index.html`, `messages.html`, `contact.html`, and `account.html`.
- Submit a public entry without logging in.
- Sign up, log in, submit an entry, and check that it appears in My Account.
- Try deleting your own entry and verify that it disappears from Supabase.
- Confirm an account cannot delete another user's entry.
- Submit a contact message and verify it appears in `public.contact_messages` from the Supabase Dashboard.
- Test mobile layout and inspect the browser console for errors.
