CREATE TABLE public.kids_book_preorders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  package text NOT NULL,
  language text NOT NULL,
  full_name text NOT NULL,
  address_line text NOT NULL,
  city text NOT NULL,
  postal_code text NOT NULL,
  country text NOT NULL,
  phone text,
  email text,
  note text,
  credits_paid integer NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  tracking_number text,
  shipped_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.kids_book_preorders TO authenticated;
GRANT ALL ON public.kids_book_preorders TO service_role;
ALTER TABLE public.kids_book_preorders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own preorders" ON public.kids_book_preorders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.kids_book_preorder_create(
  _package text, _language text, _full_name text, _address_line text, _city text,
  _postal_code text, _country text, _phone text, _email text, _note text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _cost int; _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF _package NOT IN ('print','mega') THEN RAISE EXCEPTION 'INVALID_PACKAGE'; END IF;
  IF _language NOT IN ('English','Slovak','Hungarian','German','Spanish','French') THEN RAISE EXCEPTION 'INVALID_LANGUAGE'; END IF;
  IF length(trim(coalesce(_full_name,'')))<2 OR length(trim(coalesce(_address_line,'')))<3
     OR length(trim(coalesce(_city,'')))<2 OR length(trim(coalesce(_postal_code,'')))<2
     OR length(trim(coalesce(_country,'')))<2 THEN RAISE EXCEPTION 'INVALID_ADDRESS'; END IF;
  _cost := CASE WHEN _package='mega' THEN 100 ELSE 50 END;
  IF coalesce((SELECT credits_remaining FROM ai_credits WHERE user_id=_uid),0) < _cost THEN
    RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  PERFORM public.deduct_ai_credits(_uid, _cost, 'kids_book_preorder_'||_package, 'kids_learning_posters');
  INSERT INTO kids_book_preorders(user_id,package,language,full_name,address_line,city,postal_code,country,phone,email,note,credits_paid)
  VALUES (_uid,_package,_language,left(trim(_full_name),120),left(trim(_address_line),250),left(trim(_city),120),
          left(trim(_postal_code),20),left(trim(_country),80),left(nullif(trim(_phone),''),40),left(nullif(trim(_email),''),160),left(nullif(trim(_note),''),500),_cost)
  RETURNING id INTO _id;
  IF _package='mega' THEN
    INSERT INTO ai_usage_history(user_id,usage_type,credits_used,description)
    VALUES (_uid,'kids_encyclopedia_all',0,'Mega bundle: PDF + e-book all 6 languages + printed book');
  END IF;
  RETURN _id;
END $$;
REVOKE ALL ON FUNCTION public.kids_book_preorder_create(text,text,text,text,text,text,text,text,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.kids_book_preorder_create(text,text,text,text,text,text,text,text,text,text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_kids_book_preorder_set_status(_id uuid, _status text, _tracking text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row kids_book_preorders;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'FORBIDDEN'; END IF;
  IF _status NOT IN ('pending','shipped','cancelled') THEN RAISE EXCEPTION 'INVALID_STATUS'; END IF;
  SELECT * INTO _row FROM kids_book_preorders WHERE id=_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'NOT_FOUND'; END IF;
  UPDATE kids_book_preorders SET status=_status, tracking_number=coalesce(nullif(trim(_tracking),''),tracking_number),
    shipped_at = CASE WHEN _status='shipped' THEN coalesce(shipped_at,now()) ELSE shipped_at END
  WHERE id=_id;
  IF _status='shipped' AND _row.status<>'shipped' THEN
    INSERT INTO notifications(user_id,title,message,type,related_id,action_url,metadata)
    VALUES (_row.user_id,'Your book is on the way! 📦',
      'Your printed Learning Encyclopedia ('||_row.language||') has been shipped.'||
      CASE WHEN nullif(trim(_tracking),'') IS NOT NULL THEN ' Tracking: '||trim(_tracking) ELSE '' END,
      'kids_book_shipped',_id,'/kids-channel/learning-posters',jsonb_build_object('preorder_id',_id));
  END IF;
END $$;
REVOKE ALL ON FUNCTION public.admin_kids_book_preorder_set_status(uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_kids_book_preorder_set_status(uuid,text,text) TO authenticated;