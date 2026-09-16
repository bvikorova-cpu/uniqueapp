CREATE TABLE public.clone_battle_powerups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  powerup_key text NOT NULL,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  total_purchased integer NOT NULL DEFAULT 0 CHECK (total_purchased >= 0),
  total_used integer NOT NULL DEFAULT 0 CHECK (total_used >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, powerup_key)
);

GRANT SELECT ON public.clone_battle_powerups TO authenticated;
GRANT ALL ON public.clone_battle_powerups TO service_role;

ALTER TABLE public.clone_battle_powerups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own battle powerups"
ON public.clone_battle_powerups FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER update_clone_battle_powerups_updated_at
BEFORE UPDATE ON public.clone_battle_powerups
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.clone_battle_powerup_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  battle_id uuid,
  powerup_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.clone_battle_powerup_uses TO authenticated;
GRANT ALL ON public.clone_battle_powerup_uses TO service_role;

ALTER TABLE public.clone_battle_powerup_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own battle powerup uses"
ON public.clone_battle_powerup_uses FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_clone_battle_powerup_uses_user ON public.clone_battle_powerup_uses (user_id, created_at DESC);