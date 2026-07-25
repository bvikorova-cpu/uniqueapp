GRANT SELECT ON public.secret_santa_wishlists TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.secret_santa_wishlists TO authenticated;
GRANT ALL ON public.secret_santa_wishlists TO service_role;