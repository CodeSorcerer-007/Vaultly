-- Run this once in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste this whole file → Run)

-- 1. Table to track file metadata
create table if not exists files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  name text not null,
  storage_path text not null,
  folder text not null default '/',
  size bigint,
  mime_type text,
  created_at timestamptz default now()
);

-- 2. Lock the table down so users can only ever see/edit their own rows
alter table files enable row level security;

create policy "Users can view own files"
  on files for select
  using (auth.uid() = user_id);

create policy "Users can insert own files"
  on files for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own files"
  on files for delete
  using (auth.uid() = user_id);

-- 3. Create the storage bucket for uploaded documents (private, not public)
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- 4. Storage policies — each user can only touch files inside their own
--    folder, enforced by prefixing every upload path with their user id
--    (this happens automatically in the app code: `${userId}/filename`)
create policy "Users can upload to own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can read own folder"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own folder"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
