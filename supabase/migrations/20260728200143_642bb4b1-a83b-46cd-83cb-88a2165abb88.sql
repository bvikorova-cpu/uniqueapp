ALTER TABLE public.brain_duel_powerups
  DROP CONSTRAINT IF EXISTS brain_duel_powerups_powerup_type_check;

ALTER TABLE public.brain_duel_powerups
  ADD CONSTRAINT brain_duel_powerups_powerup_type_check
  CHECK (powerup_type = ANY (ARRAY[
    'fifty_fifty','hint','extra_time','skip','double_points','ask_ai',
    'fifty-fifty','ask-ai','extra-time','double-points'
  ]));