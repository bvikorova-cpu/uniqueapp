DROP FUNCTION IF EXISTS public.notify_exclusive_mutual_interest() CASCADE;
DROP FUNCTION IF EXISTS public.notify_exclusive_channel_opened(uuid, uuid) CASCADE;

DROP TABLE IF EXISTS public.exclusive_connection_blocks CASCADE;
DROP TABLE IF EXISTS public.exclusive_connection_reports CASCADE;
DROP TABLE IF EXISTS public.exclusive_connection_interests CASCADE;
DROP TABLE IF EXISTS public.exclusive_connection_profiles CASCADE;
DROP TABLE IF EXISTS public.exclusive_feed_reactions CASCADE;
DROP TABLE IF EXISTS public.exclusive_feed_posts CASCADE;
DROP TABLE IF EXISTS public.exclusive_forum_reports CASCADE;
DROP TABLE IF EXISTS public.exclusive_forum_replies CASCADE;
DROP TABLE IF EXISTS public.exclusive_forum_threads CASCADE;
DROP TABLE IF EXISTS public.exclusive_proposal_votes CASCADE;
DROP TABLE IF EXISTS public.exclusive_proposals CASCADE;
DROP TABLE IF EXISTS public.exclusive_members CASCADE;