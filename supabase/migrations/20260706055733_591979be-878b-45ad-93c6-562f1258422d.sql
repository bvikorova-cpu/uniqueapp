
DO $$
DECLARE
  v_user uuid := 'a8f98c5c-3ce8-4928-bfaf-061a700411c6';
  v_musician_id uuid;
  v_concert_id uuid;
BEGIN
  SELECT id INTO v_musician_id FROM public.musician_profiles WHERE user_id = v_user;
  IF v_musician_id IS NULL THEN
    INSERT INTO public.musician_profiles (user_id, stage_name, bio, genre, verified, verification_status)
    VALUES (v_user, 'QA Test Artist', 'E2E seeded artist', 'Electronic', true, 'verified')
    RETURNING id INTO v_musician_id;
  END IF;

  SELECT id INTO v_concert_id FROM public.live_concert_streams
    WHERE musician_id = v_musician_id AND title = 'QA Seed Live Concert' LIMIT 1;
  IF v_concert_id IS NULL THEN
    INSERT INTO public.live_concert_streams
      (musician_id, title, description, scheduled_at, started_at, status, viewer_count)
    VALUES (v_musician_id, 'QA Seed Live Concert', 'Seeded for E2E ticket checkout', now(), now(), 'live', 1)
    RETURNING id INTO v_concert_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.concert_ticket_types WHERE concert_id = v_concert_id AND name = 'standard') THEN
    INSERT INTO public.concert_ticket_types (concert_id, name, price, description, max_quantity)
    VALUES (v_concert_id, 'standard', 5.00, 'QA seeded standard ticket', 100);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.concert_ticket_types WHERE concert_id = v_concert_id AND name = 'vip') THEN
    INSERT INTO public.concert_ticket_types (concert_id, name, price, description, max_quantity)
    VALUES (v_concert_id, 'vip', 20.00, 'QA seeded VIP ticket', 20);
  END IF;
END $$;
