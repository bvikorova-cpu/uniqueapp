-- Fix incorrect UNIQUE constraint on login_calendar_templates
ALTER TABLE public.login_calendar_templates DROP CONSTRAINT IF EXISTS login_calendar_templates_month_key_key;
ALTER TABLE public.login_calendar_templates ADD CONSTRAINT login_calendar_templates_month_day_unique UNIQUE (month_key, day_number);
CREATE INDEX IF NOT EXISTS idx_calendar_templates_month ON public.login_calendar_templates(month_key);
CREATE INDEX IF NOT EXISTS idx_battle_pass_rewards_season_tier ON public.battle_pass_rewards(season_id, tier);