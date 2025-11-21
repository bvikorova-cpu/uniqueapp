-- Fix Function Search Path Mutable warnings by setting search_path on all affected functions

-- Functions that update timestamps
ALTER FUNCTION public.update_coffee_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_content_packs_timestamp() SET search_path = public;
ALTER FUNCTION public.update_teacher_dashboard_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.update_withdrawal_timestamp() SET search_path = public;
ALTER FUNCTION public.update_masterchef_withdrawal_requests_updated_at() SET search_path = public;
ALTER FUNCTION public.update_phobia_timestamp() SET search_path = public;
ALTER FUNCTION public.handle_recipe_updated_at() SET search_path = public;

-- Functions that update other fields
ALTER FUNCTION public.update_brand_vote_count() SET search_path = public;
ALTER FUNCTION public.update_collectible_listings_updated_at() SET search_path = public;
ALTER FUNCTION public.update_crystal_marketplace_updated_at() SET search_path = public;
ALTER FUNCTION public.update_horse_currency_updated_at() SET search_path = public;

-- Vote counter functions
ALTER FUNCTION public.increment_entry_votes() SET search_path = public;
ALTER FUNCTION public.decrement_entry_votes() SET search_path = public;

-- Access check functions
ALTER FUNCTION public.has_confession_access(uuid, text) SET search_path = public;
ALTER FUNCTION public.is_age_verified(uuid) SET search_path = public;

-- Calculation functions
ALTER FUNCTION public.calculate_level(integer) SET search_path = public;

-- Handler functions
ALTER FUNCTION public.handle_lottery_user() SET search_path = public;
ALTER FUNCTION public.process_masterchef_withdrawal(p_request_id uuid, p_admin_id uuid, p_status text, p_admin_notes text) SET search_path = public;