insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

create policy "Pet photos are publicly viewable"
on storage.objects for select
using (bucket_id = 'pet-photos');

create policy "Users can upload their own pet photos"
on storage.objects for insert
with check (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update their own pet photos"
on storage.objects for update
using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own pet photos"
on storage.objects for delete
using (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);