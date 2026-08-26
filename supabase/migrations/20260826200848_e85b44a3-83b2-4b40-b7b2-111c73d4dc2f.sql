CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_tips_stripe_session_id
ON public.profile_tips (stripe_session_id)
WHERE stripe_session_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_profile_tips_stripe_payment_intent_id
ON public.profile_tips (stripe_payment_intent_id)
WHERE stripe_payment_intent_id IS NOT NULL;