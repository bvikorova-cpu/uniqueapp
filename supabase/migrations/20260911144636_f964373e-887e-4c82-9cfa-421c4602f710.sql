CREATE TABLE public.style_previews (
  style_id TEXT PRIMARY KEY,
  storage_path TEXT NOT NULL,
  model TEXT,
  width INT,
  height INT,
  credits_estimate NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.style_previews TO authenticated;
GRANT ALL ON public.style_previews TO service_role;

ALTER TABLE public.style_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "style_previews_read" ON public.style_previews
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "style_previews_admin_manage" ON public.style_previews
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "style_previews_objects_read" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'style-previews');

CREATE POLICY "style_previews_objects_admin_write" ON storage.objects
  FOR ALL TO authenticated
  USING (bucket_id = 'style-previews' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'style-previews' AND public.has_role(auth.uid(), 'admin'));