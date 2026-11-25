-- LETLIRIKO DATABASE MIGRATION
-- Run this in Supabase Dashboard > SQL Editor.
-- Back up your project before running database migrations.

-- 1) Preserve existing entries and add owner/timestamp fields when missing.
alter table public.entries
  add column if not exists user_id uuid references auth.users(id) on delete set null;

alter table public.entries
  add column if not exists created_at timestamptz not null default now();

alter table public.entries
  alter column user_id set default auth.uid();

create index if not exists entries_user_id_idx on public.entries(user_id);
create index if not exists entries_created_at_idx on public.entries(created_at desc);

-- 2) Replace ALL existing entries policies so older permissive policies cannot
-- accidentally allow public updates/deletes. Existing rows remain unchanged.
do $$
declare policy_row record;
begin
  for policy_row in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'entries'
  loop
    execute format('drop policy if exists %I on public.entries', policy_row.policyname);
  end loop;
end $$;

alter table public.entries enable row level security;
grant select, insert on public.entries to anon, authenticated;
grant delete on public.entries to authenticated;

create policy "Anyone can read public entries"
  on public.entries for select
  to anon, authenticated
  using (true);

create policy "Visitors can create anonymous entries and users can create owned entries"
  on public.entries for insert
  to anon, authenticated
  with check (
    (auth.uid() is null and user_id is null)
    or
    (auth.uid() is not null and user_id = auth.uid())
  );

create policy "Users can delete only their own entries"
  on public.entries for delete
  to authenticated
  using (user_id = auth.uid());

-- No public UPDATE policy is created intentionally.

-- 3) Private contact inbox: visitors may submit, but cannot read messages.
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 60),
  email text null,
  subject text not null check (char_length(trim(subject)) between 1 and 100),
  message text not null check (char_length(trim(message)) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;
revoke all on public.contact_messages from public, anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;

do $$
declare policy_row record;
begin
  for policy_row in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'contact_messages'
  loop
    execute format('drop policy if exists %I on public.contact_messages', policy_row.policyname);
  end loop;
end $$;

create policy "Anyone can send contact messages"
  on public.contact_messages for insert
  to anon, authenticated
  with check (true);

-- There is deliberately no SELECT, UPDATE, or DELETE policy for visitors.
-- Keep your existing songs table and entry-backgrounds storage bucket/policies.
