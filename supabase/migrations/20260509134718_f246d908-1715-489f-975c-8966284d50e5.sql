
CREATE TABLE IF NOT EXISTS public.bazaar_saved_searches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  search_term TEXT,
  category TEXT,
  condition TEXT,
  min_price NUMERIC,
  max_price NUMERIC,
  location TEXT,
  notify BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bazaar_saved_searches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own saved searches"
ON public.bazaar_saved_searches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users create their own saved searches"
ON public.bazaar_saved_searches FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update their own saved searches"
ON public.bazaar_saved_searches FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users delete their own saved searches"
ON public.bazaar_saved_searches FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_bazaar_saved_searches_user ON public.bazaar_saved_searches(user_id);

CREATE TRIGGER update_bazaar_saved_searches_updated_at
BEFORE UPDATE ON public.bazaar_saved_searches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
