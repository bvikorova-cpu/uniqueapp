-- Enable required extensions for cron-based mission rotation
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Server-side helper: rotate seasonal missions
-- Deactivates expired missions and seeds 5 new ones for the current season
CREATE OR REPLACE FUNCTION public.rotate_seasonal_missions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_month int := EXTRACT(MONTH FROM now())::int;
  v_season text;
  v_starts timestamptz := date_trunc('day', now());
  v_ends timestamptz := date_trunc('day', now()) + interval '90 days';
  v_inserted int := 0;
  v_deactivated int := 0;
BEGIN
  -- Determine season from current month
  v_season := CASE
    WHEN v_month IN (3, 4, 5) THEN 'spring'
    WHEN v_month IN (6, 7, 8) THEN 'summer'
    WHEN v_month IN (9, 10, 11) THEN 'autumn'
    ELSE 'winter'
  END;

  -- Deactivate any missions whose window has ended
  WITH expired AS (
    UPDATE public.seasonal_missions
    SET ends_at = LEAST(ends_at, now())
    WHERE ends_at > now() AND season <> v_season
    RETURNING 1
  )
  SELECT count(*) INTO v_deactivated FROM expired;

  -- Skip seeding if missions for this season already exist & are active
  IF EXISTS (
    SELECT 1 FROM public.seasonal_missions
    WHERE season = v_season AND ends_at > now()
  ) THEN
    RETURN jsonb_build_object(
      'season', v_season,
      'inserted', 0,
      'deactivated', v_deactivated,
      'skipped', true
    );
  END IF;

  -- Seed 5 missions tailored to the season
  IF v_season = 'spring' THEN
    INSERT INTO public.seasonal_missions (title, emoji, description, metric, target_value, xp_reward, season, starts_at, ends_at) VALUES
      ('Spring Bloom', '🌸', 'Share 14 spring posts', 'post_created', 14, 200, v_season, v_starts, v_ends),
      ('Garden Vibes', '🌿', 'Use 5 spring hashtags', 'hashtag_used', 5, 150, v_season, v_starts, v_ends),
      ('Fresh Start', '🌷', 'Comment 50 times', 'post_commented', 50, 250, v_season, v_starts, v_ends),
      ('Easter Star', '🐣', 'Attend 3 spring events', 'event_attended', 3, 300, v_season, v_starts, v_ends),
      ('Rainbow Hunter', '🌈', 'Post 7 colorful pics', 'post_created', 7, 180, v_season, v_starts, v_ends);
  ELSIF v_season = 'summer' THEN
    INSERT INTO public.seasonal_missions (title, emoji, description, metric, target_value, xp_reward, season, starts_at, ends_at) VALUES
      ('Summer Snapshot', '☀️', 'Share 10 summer posts', 'post_created', 10, 200, v_season, v_starts, v_ends),
      ('Beach Vibes', '🏖️', 'Use 5 summer hashtags', 'hashtag_used', 5, 150, v_season, v_starts, v_ends),
      ('Wave Rider', '🌊', 'Post 14 beach pics', 'post_created', 14, 250, v_season, v_starts, v_ends),
      ('Festival Star', '🎪', 'Attend 3 events', 'event_attended', 3, 300, v_season, v_starts, v_ends),
      ('Social Mixer', '🍹', 'Comment 50 times', 'post_commented', 50, 220, v_season, v_starts, v_ends);
  ELSIF v_season = 'autumn' THEN
    INSERT INTO public.seasonal_missions (title, emoji, description, metric, target_value, xp_reward, season, starts_at, ends_at) VALUES
      ('Autumn Leaves', '🍂', 'Share 14 autumn posts', 'post_created', 14, 200, v_season, v_starts, v_ends),
      ('Pumpkin Spice', '🎃', 'Use 5 autumn hashtags', 'hashtag_used', 5, 150, v_season, v_starts, v_ends),
      ('Cozy Comments', '🧣', 'Comment 50 times', 'post_commented', 50, 250, v_season, v_starts, v_ends),
      ('Harvest Star', '🌽', 'Attend 3 autumn events', 'event_attended', 3, 300, v_season, v_starts, v_ends),
      ('Golden Hour', '🦊', 'Post 7 sunset pics', 'post_created', 7, 180, v_season, v_starts, v_ends);
  ELSE -- winter
    INSERT INTO public.seasonal_missions (title, emoji, description, metric, target_value, xp_reward, season, starts_at, ends_at) VALUES
      ('Winter Wonder', '❄️', 'Share 14 winter posts', 'post_created', 14, 200, v_season, v_starts, v_ends),
      ('Holiday Cheer', '🎄', 'Use 5 winter hashtags', 'hashtag_used', 5, 150, v_season, v_starts, v_ends),
      ('Cocoa Talk', '☕', 'Comment 50 times', 'post_commented', 50, 250, v_season, v_starts, v_ends),
      ('NYE Star', '🎆', 'Attend 3 winter events', 'event_attended', 3, 300, v_season, v_starts, v_ends),
      ('Snow Magic', '⛄', 'Post 7 snow pics', 'post_created', 7, 180, v_season, v_starts, v_ends);
  END IF;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  RETURN jsonb_build_object(
    'season', v_season,
    'inserted', v_inserted,
    'deactivated', v_deactivated,
    'skipped', false
  );
END;
$$;

-- Schedule rotation to run daily at 00:05 UTC.
-- The function self-skips when current season already has active missions,
-- so it effectively only seeds once per season transition.
SELECT cron.schedule(
  'rotate-seasonal-missions-daily',
  '5 0 * * *',
  $$ SELECT public.rotate_seasonal_missions(); $$
);

-- Allow admins to trigger rotation manually from UI
GRANT EXECUTE ON FUNCTION public.rotate_seasonal_missions() TO authenticated;