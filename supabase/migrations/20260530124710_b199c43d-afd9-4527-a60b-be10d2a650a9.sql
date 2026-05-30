-- Add SEO-friendly slug column to job_listings
ALTER TABLE public.job_listings ADD COLUMN IF NOT EXISTS slug text;

-- Slugify function: lowercase, ascii-safe, hyphen-separated, with short id suffix to guarantee uniqueness
CREATE OR REPLACE FUNCTION public.generate_job_slug(_title text, _id uuid)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  base text;
  suffix text;
BEGIN
  base := lower(coalesce(_title, 'job'));
  base := regexp_replace(base, '[^a-z0-9]+', '-', 'g');
  base := regexp_replace(base, '(^-+|-+$)', '', 'g');
  IF base = '' THEN base := 'job'; END IF;
  base := substring(base from 1 for 80);
  suffix := substring(replace(_id::text, '-', '') from 1 for 6);
  RETURN base || '-' || suffix;
END;
$$;

-- Trigger to auto-fill slug on insert/update
CREATE OR REPLACE FUNCTION public.set_job_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := public.generate_job_slug(NEW.title, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_job_slug ON public.job_listings;
CREATE TRIGGER trg_set_job_slug
BEFORE INSERT OR UPDATE OF title ON public.job_listings
FOR EACH ROW EXECUTE FUNCTION public.set_job_slug();

-- Backfill existing rows
UPDATE public.job_listings
SET slug = public.generate_job_slug(title, id)
WHERE slug IS NULL OR slug = '';

-- Enforce uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_job_listings_slug ON public.job_listings(slug);

-- Refresh public view to expose slug + is_remote + expires_at (already present)
CREATE OR REPLACE VIEW public.job_listings_public AS
SELECT id, employer_id, title, description, company_name, location, country,
       category, job_type, salary_min, salary_max, salary_currency,
       requirements, benefits, is_active, views_count, applications_count,
       created_at, updated_at, duration_days, is_featured, paid_status,
       published_at, expires_at, is_remote, slug
FROM public.job_listings
WHERE is_active = true
  AND COALESCE(paid_status, 'active') = 'active'
  AND (expires_at IS NULL OR expires_at > now());

GRANT SELECT ON public.job_listings_public TO anon, authenticated;