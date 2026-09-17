GRANT SELECT, INSERT, UPDATE ON TABLE public.ai_credits TO authenticated;
GRANT ALL ON TABLE public.ai_credits TO service_role;
GRANT SELECT, INSERT ON TABLE public.ai_usage_history TO authenticated;
GRANT ALL ON TABLE public.ai_usage_history TO service_role;
GRANT SELECT ON TABLE public.ai_credits_ledger TO authenticated;
GRANT ALL ON TABLE public.ai_credits_ledger TO service_role;