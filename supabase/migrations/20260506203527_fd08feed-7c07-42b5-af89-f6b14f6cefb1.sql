-- P1: Lock down client-side INSERTs on payout-bearing tables.
-- Edge functions (service_role) will be the only writers, ensuring server-controlled commissions/payouts.

DROP POLICY IF EXISTS "Miners can create activities" ON public.emotion_mining_activities;
DROP POLICY IF EXISTS "Users can insert own spins" ON public.emotion_roulette_spins;
DROP POLICY IF EXISTS "Users can insert own bets" ON public.emotion_futures_bets;

-- SELECT policies remain so users can read their own history.