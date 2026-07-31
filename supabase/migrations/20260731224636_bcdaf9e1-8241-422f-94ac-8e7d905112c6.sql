-- GRANT missing Data API privileges for stock content tables
GRANT SELECT ON public.stock_content_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_content_items TO authenticated;
GRANT ALL ON public.stock_content_items TO service_role;

GRANT SELECT ON public.stock_content_sales TO authenticated;
GRANT ALL ON public.stock_content_sales TO service_role;

GRANT SELECT ON public.stock_creator_earnings TO authenticated;
GRANT ALL ON public.stock_creator_earnings TO service_role;

GRANT SELECT ON public.stock_withdrawal_requests TO authenticated;
GRANT ALL ON public.stock_withdrawal_requests TO service_role;

-- Admin policies for stock content financial overview
CREATE POLICY "Admins can view all stock content sales"
ON public.stock_content_sales
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all stock creator earnings"
ON public.stock_creator_earnings
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all stock withdrawal requests"
ON public.stock_withdrawal_requests
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all stock content items"
ON public.stock_content_items
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));