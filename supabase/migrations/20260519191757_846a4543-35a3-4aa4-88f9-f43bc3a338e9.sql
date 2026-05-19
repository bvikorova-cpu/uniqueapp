-- Relax storage bucket constraints so HEIC and other image formats work
UPDATE storage.buckets
SET allowed_mime_types = NULL,
    file_size_limit = 20971520  -- 20 MB
WHERE id IN ('avatars', 'covers');