drop policy if exists "course_videos_read" on storage.objects;
create policy "course_videos_read" on storage.objects for select to authenticated using (bucket_id = 'course-videos');

drop policy if exists "course_videos_owner_insert" on storage.objects;
create policy "course_videos_owner_insert" on storage.objects for insert to authenticated with check (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "course_videos_owner_update" on storage.objects;
create policy "course_videos_owner_update" on storage.objects for update to authenticated using (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "course_videos_owner_delete" on storage.objects;
create policy "course_videos_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'course-videos' and (storage.foldername(name))[1] = auth.uid()::text);