-- LetLiriko school/demo setup: public entries can be read and submitted.
-- Run this in Supabase Dashboard > SQL Editor.
-- This intentionally allows anonymous visitors to read and submit entries.

alter table public.entries enable row level security;

drop policy if exists "LetLiriko public read entries" on public.entries;
create policy "LetLiriko public read entries"
on public.entries for select
using (true);

drop policy if exists "LetLiriko public submit entries" on public.entries;
create policy "LetLiriko public submit entries"
on public.entries for insert
with check (true);

-- Optional photo upload support. The site still saves stories if photo upload fails.
insert into storage.buckets (id, name, public)
values ('entry-backgrounds', 'entry-backgrounds', true)
on conflict (id) do update set public = true;

drop policy if exists "LetLiriko public view entry photos" on storage.objects;
create policy "LetLiriko public view entry photos"
on storage.objects for select
using (bucket_id = 'entry-backgrounds');

drop policy if exists "LetLiriko public upload entry photos" on storage.objects;
create policy "LetLiriko public upload entry photos"
on storage.objects for insert
with check (bucket_id = 'entry-backgrounds');
