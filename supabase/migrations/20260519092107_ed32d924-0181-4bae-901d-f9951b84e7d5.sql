
-- Rewarded ad sessions (nonce tokens)
CREATE TABLE public.ad_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  client_token text NOT NULL UNIQUE,
  provider text NOT NULL CHECK (provider IN ('adsense','admob')),
  ad_unit_id text,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '5 minutes')
);
CREATE INDEX idx_ad_sessions_token ON public.ad_sessions(client_token);
CREATE INDEX idx_ad_sessions_user ON public.ad_sessions(user_id, created_at DESC);

ALTER TABLE public.ad_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ad sessions" ON public.ad_sessions FOR SELECT USING (auth.uid() = user_id);
-- inserts/updates only via service role (edge functions)

-- Rewarded ad reward log
CREATE TABLE public.ad_reward_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL CHECK (provider IN ('adsense','admob')),
  ad_unit_id text,
  xp_granted integer NOT NULL DEFAULT 25,
  client_token text NOT NULL UNIQUE,
  verified_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ad_reward_log_user_time ON public.ad_reward_log(user_id, verified_at DESC);

ALTER TABLE public.ad_reward_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own ad rewards" ON public.ad_reward_log FOR SELECT USING (auth.uid() = user_id);
-- inserts only via service role
