CREATE TABLE IF NOT EXISTS public.property_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  viewer_id uuid,
  viewer_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS property_views_unique_viewer ON public.property_views(property_id, viewer_key);
CREATE INDEX IF NOT EXISTS property_views_property_idx ON public.property_views(property_id);

GRANT SELECT ON public.property_views TO anon;
GRANT SELECT, INSERT ON public.property_views TO authenticated;
GRANT ALL ON public.property_views TO service_role;

ALTER TABLE public.property_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners can read views of their listings" ON public.property_views;
CREATE POLICY "Owners can read views of their listings" ON public.property_views
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id AND p.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.property_register_view(_property_id uuid, _viewer_key text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _inserted boolean := false;
  _total integer;
BEGIN
  IF _viewer_key IS NULL OR length(_viewer_key) < 6 THEN
    RAISE EXCEPTION 'invalid viewer key';
  END IF;

  INSERT INTO public.property_views (property_id, viewer_id, viewer_key)
  VALUES (_property_id, auth.uid(), coalesce(auth.uid()::text, _viewer_key))
  ON CONFLICT (property_id, viewer_key) DO NOTHING;

  _inserted := FOUND;

  SELECT count(*)::int INTO _total FROM public.property_views WHERE property_id = _property_id;

  UPDATE public.properties SET views_count = _total WHERE id = _property_id;

  RETURN _total;
END;
$$;

GRANT EXECUTE ON FUNCTION public.property_register_view(uuid, text) TO anon, authenticated;