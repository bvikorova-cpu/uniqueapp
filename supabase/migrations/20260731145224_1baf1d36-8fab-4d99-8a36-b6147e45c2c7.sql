CREATE OR REPLACE FUNCTION public.record_stock_content_download(p_content_id uuid)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owns boolean;
  v_total integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.stock_content_sales s
    WHERE s.content_id = p_content_id
      AND s.buyer_id = auth.uid()
      AND s.status = 'completed'
  ) INTO v_owns;

  IF NOT v_owns THEN
    RAISE EXCEPTION 'no completed purchase for this item';
  END IF;

  UPDATE public.stock_content_items
     SET total_downloads = COALESCE(total_downloads, 0) + 1
   WHERE id = p_content_id
  RETURNING total_downloads INTO v_total;

  RETURN COALESCE(v_total, 0);
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_stock_content_download(uuid) TO authenticated;