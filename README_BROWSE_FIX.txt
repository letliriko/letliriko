Browse page update

- Restored the previous horizontal scrapbook preview appearance.
- Previews are arranged in a responsive grid (multiple columns on desktop, one column on small screens).
- Each preview shows its entry title, selected song, date, and a short story excerpt.
- The entry's uploaded photo is used as the background; otherwise the selected song's album artwork is used.
- Clicking a preview opens the full story modal. Close button, clicking outside, and Escape all close it.
- Browse loading now checks whether the cloud service is already available, handles missing song-list data, and displays a useful message if entries fail to load.

If the Browse page still cannot load entries after uploading these files, check the browser console and confirm that the Supabase public SELECT policy allows reading rows from the public.entries table.
