ALTER TABLE public.dice_duel_matches
  ADD COLUMN IF NOT EXISTS is_bot boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS winner_is_bot boolean NOT NULL DEFAULT false;