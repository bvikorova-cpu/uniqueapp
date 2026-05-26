DO $$
DECLARE
  v_season_id uuid := gen_random_uuid();
  i int;
BEGIN
  -- Insert active season (60 days from now)
  INSERT INTO public.battle_pass_seasons (id, name, season_number, starts_at, ends_at, premium_price_eur, premium_price_xp, total_tiers, xp_per_tier, is_active)
  VALUES (v_season_id, 'Genesis', 1, now(), now() + interval '60 days', 9.99, 2500, 50, 100, true);

  -- Free track rewards (every tier: 10 XP, every 5th tier: 25 XP)
  FOR i IN 1..50 LOOP
    INSERT INTO public.battle_pass_rewards (season_id, tier, track, reward_type, reward_value, reward_label, reward_icon)
    VALUES (
      v_season_id, i, 'free', 'xp',
      CASE WHEN i % 10 = 0 THEN 100 WHEN i % 5 = 0 THEN 25 ELSE 10 END,
      CASE WHEN i % 10 = 0 THEN '100 XP Bonus' WHEN i % 5 = 0 THEN '25 XP' ELSE '10 XP' END,
      '✨'
    );
  END LOOP;

  -- Premium track rewards (every tier: 30 XP, every 5th tier: credits)
  FOR i IN 1..50 LOOP
    INSERT INTO public.battle_pass_rewards (season_id, tier, track, reward_type, reward_value, reward_label, reward_icon)
    VALUES (
      v_season_id, i, 'premium',
      CASE WHEN i % 10 = 0 THEN 'credit' WHEN i % 5 = 0 THEN 'credit' ELSE 'xp' END,
      CASE WHEN i % 10 = 0 THEN 10 WHEN i % 5 = 0 THEN 3 ELSE 30 END,
      CASE WHEN i % 10 = 0 THEN '10 Credits' WHEN i % 5 = 0 THEN '3 Credits' ELSE '30 XP' END,
      CASE WHEN i % 5 = 0 THEN '💎' ELSE '⭐' END
    );
  END LOOP;
END $$;