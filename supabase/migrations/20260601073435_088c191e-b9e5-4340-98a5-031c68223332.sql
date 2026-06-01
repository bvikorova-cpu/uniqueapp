INSERT INTO public.notifications (user_id, type, title, message, action_url, metadata)
SELECT mcg.user_id, 'monthly_credits',
       '+' || mcg.credits_granted || ' AI credits for June 2026',
       'Your monthly bonus of ' || mcg.credits_granted || ' AI credits has been added. Unused credits roll over.',
       '/ai-credits-store',
       jsonb_build_object('grant_month', to_char(mcg.grant_month, 'YYYY-MM-DD'), 'credits_granted', mcg.credits_granted)
FROM public.monthly_credit_grants mcg
WHERE mcg.grant_month = '2026-06-01'
  AND NOT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.user_id = mcg.user_id
      AND n.type = 'monthly_credits'
      AND n.metadata->>'grant_month' = '2026-06-01'
  );