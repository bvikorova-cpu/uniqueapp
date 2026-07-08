-- Grant EXECUTE on can_view_community to authenticated so /bazaar RLS check works
GRANT EXECUTE ON FUNCTION public.can_view_community(uuid) TO authenticated, anon;