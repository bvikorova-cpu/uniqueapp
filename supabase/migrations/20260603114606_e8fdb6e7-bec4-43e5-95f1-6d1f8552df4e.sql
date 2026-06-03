-- =============================================================
-- Rewards section hardening: server-side atomic actions + security
-- =============================================================

-- 1. DONATE XP: atomic XP deduction + donation row
CREATE OR REPLACE FUNCTION public.donate_xp(
  _amount integer,
  _campaign_id uuid DEFAULT NULL,
  _campaign_name text DEFAULT NULL,
  _rate integer DEFAULT 1000
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
  v_donation_id uuid;
BEGIN
  IF v_uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;
  IF _amount IS NULL OR _amount < _rate THEN
    RETURN jsonb_build_object('ok', false, 'error', 'amount_too_small');
  END IF;

  SELECT total_points INTO v_balance FROM public.user_points WHERE user_id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < _amount THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_xp');
  END IF;

  UPDATE public.user_points
     SET total_points = total_points - _amount,
         updated_at = now()
   WHERE user_id = v_uid;

  INSERT INTO public.xp_charity_donations (
    user_id, campaign_id, campaign_name, xp_amount, eur_value, conversion_rate
  ) VALUES (
    v_uid, _campaign_id, COALESCE(_campaign_name, 'General fund'),
    _amount, (_amount::numeric / _rate), _rate
  ) RETURNING id INTO v_donation_id;

  RETURN jsonb_build_object('ok', true, 'donation_id', v_donation_id, 'new_balance', v_balance - _amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.donate_xp(integer, uuid, text, integer) TO authenticated;

-- 2. JOIN / LEAVE GUILD: atomic member insert + member_count update
CREATE OR REPLACE FUNCTION public.join_guild(_guild_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_guild record;
  v_existing uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  -- already in some guild?
  SELECT id INTO v_existing FROM public.guild_members WHERE user_id = v_uid LIMIT 1;
  IF v_existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_in_guild');
  END IF;

  SELECT * INTO v_guild FROM public.guilds WHERE id = _guild_id FOR UPDATE;
  IF v_guild.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'guild_not_found'); END IF;
  IF NOT v_guild.is_open THEN RETURN jsonb_build_object('ok', false, 'error', 'guild_closed'); END IF;
  IF v_guild.member_count >= v_guild.max_members THEN
    RETURN jsonb_build_object('ok', false, 'error', 'guild_full');
  END IF;

  INSERT INTO public.guild_members (guild_id, user_id, role) VALUES (_guild_id, v_uid, 'member');
  UPDATE public.guilds SET member_count = member_count + 1, updated_at = now() WHERE id = _guild_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.join_guild(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.leave_guild()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_guild_id uuid;
  v_role text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  SELECT guild_id, role INTO v_guild_id, v_role FROM public.guild_members WHERE user_id = v_uid;
  IF v_guild_id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_in_guild'); END IF;
  IF v_role = 'leader' THEN
    -- leaders must transfer ownership or delete guild explicitly; block for now
    RETURN jsonb_build_object('ok', false, 'error', 'leader_must_transfer_or_disband');
  END IF;

  DELETE FROM public.guild_members WHERE user_id = v_uid;
  UPDATE public.guilds SET member_count = GREATEST(0, member_count - 1), updated_at = now()
    WHERE id = v_guild_id;
  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.leave_guild() TO authenticated;

-- 3. ACCEPT FRIEND QUEST INVITE: bypass RLS that blocks acceptor from inserting
CREATE OR REPLACE FUNCTION public.accept_friend_quest_invite(_invite_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_inv record;
  v_quest_id uuid;
  v_target integer;
  v_reward integer;
  v_title text;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  SELECT * INTO v_inv FROM public.friend_quest_invites
    WHERE id = _invite_id AND to_user = v_uid AND status = 'pending';
  IF v_inv.id IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'invite_not_found'); END IF;

  -- canonical targets per quest type
  CASE v_inv.quest_type
    WHEN 'post_streak' THEN v_target := 14; v_reward := 700; v_title := 'Post 14 days in a row';
    WHEN 'ai_combo'    THEN v_target := 30; v_reward := 500; v_title := 'Use 30 AI tools together';
    WHEN 'xp_marathon' THEN v_target := 5000; v_reward := 1000; v_title := 'Earn 5,000 XP combined';
    ELSE v_target := 10; v_reward := 200; v_title := v_inv.quest_type;
  END CASE;

  INSERT INTO public.friend_quests (
    quest_type, title, user_a, user_b,
    target_value, reward_xp, ends_at, status
  ) VALUES (
    v_inv.quest_type, v_title, v_inv.from_user, v_uid,
    v_target, v_reward, now() + interval '14 days', 'active'
  ) RETURNING id INTO v_quest_id;

  UPDATE public.friend_quest_invites
     SET status = 'accepted', responded_at = now()
   WHERE id = _invite_id;

  RETURN jsonb_build_object('ok', true, 'quest_id', v_quest_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.accept_friend_quest_invite(uuid) TO authenticated;

-- 4. STREAK FREEZE: atomic purchase with XP
CREATE OR REPLACE FUNCTION public.buy_streak_freeze_xp(_qty integer, _cost_xp integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance integer;
  v_existing public.user_streak_freezes%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF _qty NOT IN (1, 3, 7) THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_pack'); END IF;
  -- canonical pricing (prevent client tampering)
  IF (_qty = 1 AND _cost_xp <> 200)
     OR (_qty = 3 AND _cost_xp <> 500)
     OR (_qty = 7 AND _cost_xp <> 1000) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_price');
  END IF;

  SELECT total_points INTO v_balance FROM public.user_points WHERE user_id = v_uid FOR UPDATE;
  IF v_balance IS NULL OR v_balance < _cost_xp THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_xp');
  END IF;

  UPDATE public.user_points SET total_points = total_points - _cost_xp, updated_at = now() WHERE user_id = v_uid;

  SELECT * INTO v_existing FROM public.user_streak_freezes WHERE user_id = v_uid;
  IF v_existing.user_id IS NULL THEN
    INSERT INTO public.user_streak_freezes (user_id, available_count, total_purchased)
      VALUES (v_uid, _qty, _qty);
  ELSE
    UPDATE public.user_streak_freezes
       SET available_count = COALESCE(available_count, 0) + _qty,
           total_purchased = COALESCE(total_purchased, 0) + _qty
     WHERE user_id = v_uid;
  END IF;

  INSERT INTO public.streak_freeze_history (user_id, action, quantity, cost_xp)
    VALUES (v_uid, 'purchased', _qty, _cost_xp);

  RETURN jsonb_build_object('ok', true, 'new_balance', v_balance - _cost_xp);
END;
$$;
GRANT EXECUTE ON FUNCTION public.buy_streak_freeze_xp(integer, integer) TO authenticated;

-- 5. BATTLE PASS PREMIUM SECURITY: block client from self-granting has_premium
CREATE OR REPLACE FUNCTION public._guard_battle_pass_premium()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role (edge functions w/ service key) to flip premium
  IF current_setting('request.jwt.claim.role', true) = 'service_role' THEN
    RETURN NEW;
  END IF;
  -- Block flipping false -> true from client
  IF COALESCE(OLD.has_premium, false) = false AND COALESCE(NEW.has_premium, false) = true THEN
    RAISE EXCEPTION 'has_premium can only be granted via payment webhook';
  END IF;
  -- Block setting/overwriting purchase timestamp from client
  IF NEW.premium_purchased_at IS DISTINCT FROM OLD.premium_purchased_at
     AND COALESCE(NEW.has_premium, false) = false THEN
    NEW.premium_purchased_at := OLD.premium_purchased_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS guard_battle_pass_premium ON public.user_battle_pass;
CREATE TRIGGER guard_battle_pass_premium
  BEFORE UPDATE ON public.user_battle_pass
  FOR EACH ROW
  EXECUTE FUNCTION public._guard_battle_pass_premium();

-- 6. WEEKLY CHALLENGE PROGRESS (read-only RPC)
CREATE OR REPLACE FUNCTION public.get_weekly_challenge_progress()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_week_start timestamptz := date_trunc('week', now());
  v_posts integer := 0;
  v_comments integer := 0;
  v_likes integer := 0;
  v_streak integer := 0;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  SELECT COUNT(*) INTO v_posts FROM public.posts
    WHERE user_id = v_uid AND created_at >= v_week_start;
  SELECT COUNT(*) INTO v_comments FROM public.post_comments
    WHERE user_id = v_uid AND created_at >= v_week_start;
  SELECT COUNT(*) INTO v_likes FROM public.post_likes
    WHERE user_id = v_uid AND created_at >= v_week_start;
  SELECT COALESCE(login_streak, 0) INTO v_streak FROM public.user_points WHERE user_id = v_uid;

  RETURN jsonb_build_object(
    'ok', true,
    'posts', v_posts,
    'comments', v_comments,
    'likes', v_likes,
    'streak', LEAST(v_streak, 7)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_weekly_challenge_progress() TO authenticated;