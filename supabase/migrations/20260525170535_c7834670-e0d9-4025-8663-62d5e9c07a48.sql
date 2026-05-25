
-- Clean orphans first
DELETE FROM public.pinned_posts WHERE post_id NOT IN (SELECT id FROM public.posts);
DELETE FROM public.pinned_posts WHERE user_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.event_attendees WHERE event_id NOT IN (SELECT id FROM public.events);
DELETE FROM public.event_attendees WHERE user_id NOT IN (SELECT id FROM public.profiles);
DELETE FROM public.events WHERE creator_id NOT IN (SELECT id FROM public.profiles);

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='events_creator_id_fkey') THEN
    ALTER TABLE public.events ADD CONSTRAINT events_creator_id_fkey
      FOREIGN KEY (creator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_attendees_event_id_fkey') THEN
    ALTER TABLE public.event_attendees ADD CONSTRAINT event_attendees_event_id_fkey
      FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='event_attendees_user_id_fkey') THEN
    ALTER TABLE public.event_attendees ADD CONSTRAINT event_attendees_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pinned_posts_post_id_fkey') THEN
    ALTER TABLE public.pinned_posts ADD CONSTRAINT pinned_posts_post_id_fkey
      FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='pinned_posts_user_id_fkey') THEN
    ALTER TABLE public.pinned_posts ADD CONSTRAINT pinned_posts_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;
