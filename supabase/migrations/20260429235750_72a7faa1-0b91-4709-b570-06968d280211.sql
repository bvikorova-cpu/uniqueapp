REVOKE EXECUTE ON FUNCTION public.get_campaign_available_balance(TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_campaign_available_balance(TEXT, UUID) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_campaign_owner(UUID, TEXT, UUID) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_campaign_owner(UUID, TEXT, UUID) TO authenticated, service_role;