
ALTER TABLE public.battle_royale_tournaments
  ADD COLUMN IF NOT EXISTS prize_amount_cents bigint NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.is_battle_royale_winner(_user_id uuid, _tournament_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.battle_royale_tournaments t
    JOIN public.battle_royale_participants p ON p.id = t.champion_participant_id
    WHERE t.id = _tournament_id
      AND t.status = 'completed'
      AND p.user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.get_battle_royale_available_payout(_tournament_id uuid)
RETURNS bigint LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT GREATEST(
    COALESCE((SELECT prize_amount_cents FROM public.battle_royale_tournaments WHERE id = _tournament_id), 0)
    - COALESCE((SELECT SUM(amount_cents) FROM public.campaign_payouts
        WHERE campaign_type = 'battle_royale' AND campaign_id = _tournament_id
        AND status IN ('pending','pending_review','processing','completed')), 0),
    0
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_battle_royale_winner(uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_battle_royale_available_payout(uuid) FROM anon;
