
-- Storage bucket for documents (private)
insert into storage.buckets (id, name, public) values ('property-documents', 'property-documents', false)
on conflict (id) do nothing;

-- Property documents metadata
create table if not exists public.property_documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category text not null,
  doc_name text not null,
  status text not null default 'uploaded',
  file_path text not null,
  original_filename text,
  created_at timestamptz not null default now()
);
alter table public.property_documents enable row level security;
create policy "Users view own docs" on public.property_documents for select using (auth.uid() = user_id);
create policy "Users insert own docs" on public.property_documents for insert with check (auth.uid() = user_id);
create policy "Users delete own docs" on public.property_documents for delete using (auth.uid() = user_id);

-- Storage policies for property-documents
create policy "Users read own property docs" on storage.objects for select
  using (bucket_id = 'property-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users upload own property docs" on storage.objects for insert
  with check (bucket_id = 'property-documents' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "Users delete own property docs" on storage.objects for delete
  using (bucket_id = 'property-documents' and auth.uid()::text = (storage.foldername(name))[1]);

-- Favorites
create table if not exists public.property_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  property_id uuid not null references public.properties(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, property_id)
);
alter table public.property_favorites enable row level security;
create policy "Users view own favorites" on public.property_favorites for select using (auth.uid() = user_id);
create policy "Users add own favorites" on public.property_favorites for insert with check (auth.uid() = user_id);
create policy "Users remove own favorites" on public.property_favorites for delete using (auth.uid() = user_id);
