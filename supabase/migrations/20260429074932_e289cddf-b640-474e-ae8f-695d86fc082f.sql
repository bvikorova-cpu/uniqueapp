CREATE TABLE public.shop_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  emoji text,
  category text NOT NULL,
  cost_xp integer NOT NULL CHECK (cost_xp > 0),
  stock integer,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view active shop items" ON public.shop_items
  FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Admins manage shop items" ON public.shop_items
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.rewards_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  item_code text NOT NULL REFERENCES public.shop_items(code) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  expires_at timestamptz,
  acquired_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_code)
);
CREATE INDEX idx_rewards_inventory_user ON public.rewards_inventory(user_id);
ALTER TABLE public.rewards_inventory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own rewards inventory" ON public.rewards_inventory
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.lucky_spin_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  prize_label text NOT NULL,
  prize_kind text NOT NULL,
  xp_awarded integer NOT NULL DEFAULT 0,
  item_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_lucky_spin_user_created ON public.lucky_spin_log(user_id, created_at DESC);
ALTER TABLE public.lucky_spin_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own spins" ON public.lucky_spin_log
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.xp_gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  amount integer NOT NULL CHECK (amount > 0 AND amount <= 500),
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_xp_gifts_sender_created ON public.xp_gifts(sender_id, created_at DESC);
CREATE INDEX idx_xp_gifts_recipient ON public.xp_gifts(recipient_id);
ALTER TABLE public.xp_gifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their own gifts" ON public.xp_gifts
  FOR SELECT TO authenticated USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE TABLE public.xp_bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  challenge_type text NOT NULL,
  challenge_target integer NOT NULL CHECK (challenge_target > 0),
  bet_amount integer NOT NULL CHECK (bet_amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','won','lost')),
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL,
  resolved_at timestamptz,
  payout integer NOT NULL DEFAULT 0,
  progress integer NOT NULL DEFAULT 0
);
CREATE INDEX idx_xp_bets_user ON public.xp_bets(user_id);
CREATE INDEX idx_xp_bets_pending ON public.xp_bets(status, ends_at) WHERE status = 'pending';
ALTER TABLE public.xp_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own bets" ON public.xp_bets
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.spin_lucky_wheel()
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_today_count int;
  v_roll int;
  v_prize text;
  v_kind text;
  v_xp int := 0;
  v_item text := NULL;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  SELECT count(*) INTO v_today_count FROM lucky_spin_log
    WHERE user_id = v_uid AND created_at >= date_trunc('day', now());
  IF v_today_count >= 1 THEN RETURN jsonb_build_object('error','already_spun_today'); END IF;

  v_roll := floor(random() * 100)::int;
  IF    v_roll < 30 THEN v_prize := '+25 XP';            v_kind := 'xp';   v_xp := 25;
  ELSIF v_roll < 55 THEN v_prize := '+50 XP';            v_kind := 'xp';   v_xp := 50;
  ELSIF v_roll < 70 THEN v_prize := '+100 XP';           v_kind := 'xp';   v_xp := 100;
  ELSIF v_roll < 80 THEN v_prize := 'Streak Shield';     v_kind := 'item'; v_item := 'streak-shield';
  ELSIF v_roll < 88 THEN v_prize := 'Mystery Badge';     v_kind := 'item'; v_item := 'mystery-box';
  ELSIF v_roll < 93 THEN v_prize := '+200 XP';           v_kind := 'xp';   v_xp := 200;
  ELSIF v_roll < 98 THEN v_prize := '1 Free AI Credit';  v_kind := 'item'; v_item := 'ai-credits-10';
  ELSE                   v_prize := 'JACKPOT +500 XP';   v_kind := 'xp';   v_xp := 500;
  END IF;

  IF v_xp > 0 THEN PERFORM add_user_points(v_uid, v_xp, 'lucky_spin', v_prize); END IF;
  IF v_item IS NOT NULL THEN
    INSERT INTO rewards_inventory (user_id, item_code, quantity) VALUES (v_uid, v_item, 1)
    ON CONFLICT (user_id, item_code) DO UPDATE SET quantity = rewards_inventory.quantity + 1;
  END IF;
  INSERT INTO lucky_spin_log (user_id, prize_label, prize_kind, xp_awarded, item_code)
  VALUES (v_uid, v_prize, v_kind, v_xp, v_item);
  RETURN jsonb_build_object('prize', v_prize, 'kind', v_kind, 'xp', v_xp, 'item', v_item);
END;
$$;
GRANT EXECUTE ON FUNCTION public.spin_lucky_wheel() TO authenticated;

CREATE OR REPLACE FUNCTION public.redeem_shop_item(_item_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_item shop_items;
  v_balance int;
  v_expires timestamptz;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  SELECT * INTO v_item FROM shop_items WHERE code = _item_code AND is_active = true;
  IF NOT FOUND THEN RETURN jsonb_build_object('error','item_not_found'); END IF;
  IF v_item.stock IS NOT NULL AND v_item.stock <= 0 THEN RETURN jsonb_build_object('error','out_of_stock'); END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < v_item.cost_xp THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0),'cost',v_item.cost_xp);
  END IF;
  PERFORM add_user_points(v_uid, -v_item.cost_xp, 'shop_redeem', v_item.code);
  v_expires := CASE
    WHEN v_item.code = 'xp-doubler'    THEN now() + interval '24 hours'
    WHEN v_item.code = 'streak-shield' THEN now() + interval '7 days'
    WHEN v_item.code = 'vip-access'    THEN now() + interval '7 days'
    ELSE NULL END;
  INSERT INTO rewards_inventory (user_id, item_code, quantity, expires_at)
  VALUES (v_uid, v_item.code, 1, v_expires)
  ON CONFLICT (user_id, item_code) DO UPDATE
    SET quantity = rewards_inventory.quantity + 1,
        expires_at = COALESCE(EXCLUDED.expires_at, rewards_inventory.expires_at);
  IF v_item.stock IS NOT NULL THEN UPDATE shop_items SET stock = stock - 1 WHERE code = v_item.code; END IF;
  RETURN jsonb_build_object('ok',true,'item',v_item.code,'expires_at',v_expires);
END;
$$;
GRANT EXECUTE ON FUNCTION public.redeem_shop_item(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.gift_xp(_recipient uuid, _amount int, _message text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance int;
  v_today_total int;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  IF _recipient IS NULL OR _recipient = v_uid THEN RETURN jsonb_build_object('error','invalid_recipient'); END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 500 THEN RETURN jsonb_build_object('error','invalid_amount'); END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _recipient) THEN
    RETURN jsonb_build_object('error','recipient_not_found');
  END IF;
  SELECT COALESCE(sum(amount),0) INTO v_today_total FROM xp_gifts
    WHERE sender_id = v_uid AND created_at >= date_trunc('day', now());
  IF v_today_total + _amount > 500 THEN
    RETURN jsonb_build_object('error','daily_gift_limit_exceeded','remaining', GREATEST(0, 500 - v_today_total));
  END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < _amount THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0));
  END IF;
  PERFORM add_user_points(v_uid, -_amount, 'xp_gift_sent', _recipient::text);
  PERFORM add_user_points(_recipient, _amount, 'xp_gift_received', v_uid::text);
  INSERT INTO xp_gifts (sender_id, recipient_id, amount, message)
  VALUES (v_uid, _recipient, _amount, _message);
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (_recipient, 'xp_gift_received',
          'You received ' || _amount || ' XP! 🎁',
          COALESCE(_message, 'A friend sent you XP.'));
  RETURN jsonb_build_object('ok',true,'amount',_amount);
END;
$$;
GRANT EXECUTE ON FUNCTION public.gift_xp(uuid,int,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.place_xp_bet(_challenge_type text, _target int, _amount int, _hours int)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_balance int;
  v_bet_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  IF _challenge_type NOT IN ('posts','comments','hashtags','spins') THEN
    RETURN jsonb_build_object('error','invalid_challenge_type');
  END IF;
  IF _target <= 0 OR _amount <= 0 OR _hours <= 0 OR _hours > 168 THEN
    RETURN jsonb_build_object('error','invalid_parameters');
  END IF;
  IF EXISTS (SELECT 1 FROM xp_bets WHERE user_id = v_uid AND status = 'pending') THEN
    RETURN jsonb_build_object('error','active_bet_exists');
  END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < _amount THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0));
  END IF;
  PERFORM add_user_points(v_uid, -_amount, 'xp_bet_stake', _challenge_type);
  INSERT INTO xp_bets (user_id, challenge_type, challenge_target, bet_amount, ends_at)
  VALUES (v_uid, _challenge_type, _target, _amount, now() + make_interval(hours => _hours))
  RETURNING id INTO v_bet_id;
  RETURN jsonb_build_object('ok',true,'bet_id',v_bet_id);
END;
$$;
GRANT EXECUTE ON FUNCTION public.place_xp_bet(text,int,int,int) TO authenticated;

CREATE OR REPLACE FUNCTION public.evaluate_xp_bets()
RETURNS int
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  r record;
  v_progress int;
  v_processed int := 0;
BEGIN
  FOR r IN SELECT * FROM xp_bets WHERE status = 'pending' AND ends_at <= now() LIMIT 500 LOOP
    v_progress := 0;
    IF r.challenge_type = 'posts' THEN
      SELECT count(*) INTO v_progress FROM posts
        WHERE user_id = r.user_id AND created_at >= r.starts_at AND created_at <= r.ends_at;
    ELSIF r.challenge_type = 'comments' THEN
      SELECT count(*) INTO v_progress FROM post_comments
        WHERE user_id = r.user_id AND created_at >= r.starts_at AND created_at <= r.ends_at;
    ELSIF r.challenge_type = 'spins' THEN
      SELECT count(*) INTO v_progress FROM lucky_spin_log
        WHERE user_id = r.user_id AND created_at >= r.starts_at AND created_at <= r.ends_at;
    ELSIF r.challenge_type = 'hashtags' THEN
      SELECT count(*) INTO v_progress FROM post_hashtags ph
        JOIN posts p ON p.id = ph.post_id
        WHERE p.user_id = r.user_id AND p.created_at >= r.starts_at AND p.created_at <= r.ends_at;
    END IF;
    IF v_progress >= r.challenge_target THEN
      UPDATE xp_bets SET status='won', resolved_at=now(), payout = r.bet_amount * 2, progress = v_progress
        WHERE id = r.id;
      PERFORM add_user_points(r.user_id, r.bet_amount * 2, 'xp_bet_won', r.id::text);
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (r.user_id, 'xp_bet_won', 'You won your XP bet! 🎉',
              'You earned ' || (r.bet_amount * 2) || ' XP for completing your challenge.');
    ELSE
      UPDATE xp_bets SET status='lost', resolved_at=now(), progress = v_progress WHERE id = r.id;
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (r.user_id, 'xp_bet_lost', 'XP bet expired',
              'Your bet of ' || r.bet_amount || ' XP did not complete in time.');
    END IF;
    v_processed := v_processed + 1;
  END LOOP;
  RETURN v_processed;
END;
$$;
GRANT EXECUTE ON FUNCTION public.evaluate_xp_bets() TO authenticated;

DO $do$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'evaluate-xp-bets-hourly') THEN
    PERFORM cron.schedule('evaluate-xp-bets-hourly', '7 * * * *',
      $cron$ SELECT public.evaluate_xp_bets(); $cron$);
  END IF;
END $do$;

INSERT INTO public.shop_items (code, name, description, emoji, category, cost_xp) VALUES
  ('ai-credits-10',  '10 AI Credits',         'Use across all AI tools',     '🤖', 'credits',  500),
  ('streak-shield',  'Streak Shield',         'Protect streak for 7 days',   '🛡️', 'booster',  200),
  ('xp-doubler',     'XP Doubler (24h)',      '2x XP for 24 hours',          '⚡', 'booster',  750),
  ('mystery-box',    'Mystery Badge Box',     'Random rare badge',           '📦', 'badge',   1000),
  ('premium-avatar', 'Premium Avatar Frame',  'Golden profile frame',        '👑', 'cosmetic',1500),
  ('vip-access',     'VIP Chat Room (7d)',    'Exclusive community access',  '💎', 'access',  2000)
ON CONFLICT (code) DO NOTHING;