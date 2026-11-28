LETLIRIKO ENTRY SUBMIT / LOAD / PREVIEW REPAIR

Included changes:
- Entry insert no longer requires a SELECT response from Supabase. This prevents a successful INSERT from appearing to fail only because the SELECT policy is missing.
- Optional photo upload errors no longer block the story submission; the song album cover will be used instead.
- The Services page now has a toast notification area.
- Save success/error messages include the actual Supabase error when available.
- Shared entries refresh after a successful post.
- Fixed the 1,000-word counter regex.
- Browse cards keep the landscape scrapbook look, with improved overlay, readable text alignment, excerpt wrapping, and a retry option for loading errors.

IMPORTANT: To let visitors load the shared entries, run SUPABASE_POLICY_FIX.sql in Supabase Dashboard > SQL Editor. It adds public SELECT and INSERT policies for the entries table and optional public photo storage policies. This is configured for a school/demo website where entries are public. Do not collect sensitive or private information.

Replace the matching project files with the files in this ZIP. Keep all files together as in the folder. Then push to GitHub Pages and hard refresh (Ctrl+F5).
