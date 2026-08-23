DELETE FROM public.user_mission_progress;
DELETE FROM public.seasonal_missions;

ALTER TABLE public.seasonal_missions DROP CONSTRAINT IF EXISTS seasonal_missions_metric_check;
ALTER TABLE public.seasonal_missions ADD CONSTRAINT seasonal_missions_metric_check
  CHECK (metric = ANY (ARRAY['post_created','post_commented','post_liked','hashtag_used','story_created','friend_added']));

CREATE OR REPLACE FUNCTION public.current_season_bounds()
RETURNS TABLE(season text, starts_at timestamptz, ends_at timestamptz)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  m int := EXTRACT(MONTH FROM now())::int;
  y int := EXTRACT(YEAR FROM now())::int;
BEGIN
  IF m BETWEEN 3 AND 5 THEN
    RETURN QUERY SELECT 'spring', make_timestamptz(y,3,1,0,0,0,'UTC'), make_timestamptz(y,6,1,0,0,0,'UTC');
  ELSIF m BETWEEN 6 AND 8 THEN
    RETURN QUERY SELECT 'summer', make_timestamptz(y,6,1,0,0,0,'UTC'), make_timestamptz(y,9,1,0,0,0,'UTC');
  ELSIF m BETWEEN 9 AND 11 THEN
    RETURN QUERY SELECT 'autumn', make_timestamptz(y,9,1,0,0,0,'UTC'), make_timestamptz(y,12,1,0,0,0,'UTC');
  ELSIF m = 12 THEN
    RETURN QUERY SELECT 'winter', make_timestamptz(y,12,1,0,0,0,'UTC'), make_timestamptz(y+1,3,1,0,0,0,'UTC');
  ELSE
    RETURN QUERY SELECT 'winter', make_timestamptz(y-1,12,1,0,0,0,'UTC'), make_timestamptz(y,3,1,0,0,0,'UTC');
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.current_season_bounds() TO anon, authenticated, service_role;

INSERT INTO public.seasonal_missions (season, emoji, title, description, metric, target, reward_label, xp_reward, starts_at, ends_at, is_active)
VALUES
 ('spring','🌱','Fresh Start','Create 10 posts this season','post_created',10,'🌱 Sprout Badge',300, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('spring','💬','Blooming Talker','Write 25 comments','post_commented',25,'💬 Chatterbloom Badge',250, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('spring','💚','Spread the Love','Like 50 posts','post_liked',50,'💚 Kind Heart Badge',200, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('spring','🌸','Story Garden','Share 5 stories','story_created',5,'🌸 Storyteller Badge',260, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('spring','🤝','New Connections','Make 3 new friends','friend_added',3,'🤝 Social Sprout Badge',400, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('summer','🌊','Wave Rider','Create 14 posts this season','post_created',14,'🌊 Wave Rider Badge',400, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('summer','🍹','Social Mixer','Write 40 comments','post_commented',40,'🍹 Social Butterfly Badge',300, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('summer','☀️','Sunshine Fan','Like 75 posts','post_liked',75,'☀️ Sunshine Badge',250, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('summer','🏖️','Beach Vibes','Use 5 hashtags in your posts','hashtag_used',5,'🏖️ Beach Explorer Badge',210, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('summer','📸','Summer Snapshot','Share 8 stories','story_created',8,'📸 Summer Photographer Badge',350, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('autumn','🍂','Harvest Poster','Create 12 posts this season','post_created',12,'🍂 Harvester Badge',350, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('autumn','🍁','Cozy Conversations','Write 30 comments','post_commented',30,'🍁 Cozy Talker Badge',280, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('autumn','🎃','Autumn Applause','Like 60 posts','post_liked',60,'🎃 Applause Badge',220, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('autumn','🌰','Tag the Season','Use 8 hashtags in your posts','hashtag_used',8,'🌰 Tagger Badge',240, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('autumn','🤝','Autumn Circle','Make 4 new friends','friend_added',4,'🤝 Circle Badge',450, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('winter','❄️','Winter Chronicle','Create 10 posts this season','post_created',10,'❄️ Chronicle Badge',350, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('winter','🔥','Fireside Chats','Write 30 comments','post_commented',30,'🔥 Fireside Badge',280, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('winter','⛄','Snowball of Love','Like 70 posts','post_liked',70,'⛄ Snowball Badge',240, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('winter','🎄','Holiday Stories','Share 6 stories','story_created',6,'🎄 Holiday Badge',300, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true),
 ('winter','🎁','Winter Friends','Make 3 new friends','friend_added',3,'🎁 Gift of Friendship Badge',420, make_timestamptz(2000,1,1,0,0,0,'UTC'), make_timestamptz(2100,1,1,0,0,0,'UTC'), true);

CREATE OR REPLACE FUNCTION public.get_user_mission_progress()
RETURNS TABLE(mission_id uuid, season text, emoji text, title text, description text, metric text, target integer, reward_label text, xp_reward integer, starts_at timestamptz, ends_at timestamptz, progress integer, claimed_at timestamptz, is_complete boolean)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_season text;
  v_from timestamptz;
  v_to timestamptz;
  v_posts int := 0;
  v_comments int := 0;
  v_likes int := 0;
  v_hashtags int := 0;
  v_stories int := 0;
  v_friends int := 0;
BEGIN
  SELECT s.season, s.starts_at, s.ends_at INTO v_season, v_from, v_to FROM public.current_season_bounds() s;

  IF v_uid IS NOT NULL THEN
    SELECT count(*) INTO v_posts FROM public.posts p WHERE p.user_id = v_uid AND p.created_at >= v_from AND p.created_at < v_to;
    SELECT count(*) INTO v_comments FROM public.post_comments c WHERE c.user_id = v_uid AND c.created_at >= v_from AND c.created_at < v_to;
    SELECT count(*) INTO v_likes FROM public.post_likes l WHERE l.user_id = v_uid AND l.created_at >= v_from AND l.created_at < v_to;
    SELECT count(*) INTO v_hashtags FROM public.post_hashtags ph JOIN public.posts p ON p.id = ph.post_id
      WHERE p.user_id = v_uid AND ph.created_at >= v_from AND ph.created_at < v_to;
    SELECT count(*) INTO v_stories FROM public.stories st WHERE st.user_id = v_uid AND st.created_at >= v_from AND st.created_at < v_to;
    SELECT count(*) INTO v_friends FROM public.friendships f
      WHERE f.status = 'accepted' AND (f.user_id = v_uid OR f.friend_id = v_uid)
        AND COALESCE(f.updated_at, f.created_at) >= v_from AND COALESCE(f.updated_at, f.created_at) < v_to;
  END IF;

  RETURN QUERY
  SELECT
    sm.id, sm.season, sm.emoji, sm.title, sm.description, sm.metric, sm.target, sm.reward_label, sm.xp_reward,
    v_from, v_to,
    LEAST(sm.target, CASE sm.metric
      WHEN 'post_created' THEN v_posts
      WHEN 'post_commented' THEN v_comments
      WHEN 'post_liked' THEN v_likes
      WHEN 'hashtag_used' THEN v_hashtags
      WHEN 'story_created' THEN v_stories
      WHEN 'friend_added' THEN v_friends
      ELSE 0 END)::int,
    ump.claimed_at,
    (CASE sm.metric
      WHEN 'post_created' THEN v_posts
      WHEN 'post_commented' THEN v_comments
      WHEN 'post_liked' THEN v_likes
      WHEN 'hashtag_used' THEN v_hashtags
      WHEN 'story_created' THEN v_stories
      WHEN 'friend_added' THEN v_friends
      ELSE 0 END) >= sm.target
  FROM public.seasonal_missions sm
  LEFT JOIN public.user_mission_progress ump ON ump.mission_id = sm.id AND ump.user_id = v_uid
  WHERE sm.is_active = true AND sm.season = v_season
  ORDER BY sm.xp_reward;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_mission_progress() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.claim_mission_reward(_mission_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row RECORD;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_row FROM public.get_user_mission_progress() g WHERE g.mission_id = _mission_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'mission_not_active');
  END IF;
  IF NOT v_row.is_complete THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_completed');
  END IF;
  IF v_row.claimed_at IS NOT NULL AND v_row.claimed_at >= v_row.starts_at THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_claimed');
  END IF;

  INSERT INTO public.user_mission_progress (user_id, mission_id, progress, claimed_at)
  VALUES (v_uid, _mission_id, v_row.progress, now())
  ON CONFLICT (user_id, mission_id) DO UPDATE
    SET progress = EXCLUDED.progress, claimed_at = now(), updated_at = now();

  BEGIN
    PERFORM public.add_user_points(v_uid, v_row.xp_reward, 'seasonal_mission', _mission_id::text);
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO public.user_points (user_id, total_points)
      VALUES (v_uid, v_row.xp_reward)
      ON CONFLICT (user_id) DO UPDATE SET total_points = public.user_points.total_points + v_row.xp_reward;
  END;

  RETURN jsonb_build_object('success', true, 'xp_awarded', v_row.xp_reward, 'reward', v_row.reward_label);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_mission_reward(uuid) TO authenticated, service_role;