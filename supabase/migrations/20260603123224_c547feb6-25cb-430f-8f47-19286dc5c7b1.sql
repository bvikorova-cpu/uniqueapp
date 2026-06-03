CREATE OR REPLACE FUNCTION public.gift_xp(_recipient uuid, _amount integer, _message text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_balance int;
  v_today_total int;
  v_gift_id uuid;
BEGIN
  IF v_uid IS NULL THEN RETURN jsonb_build_object('error','not_authenticated'); END IF;
  IF _recipient IS NULL OR _recipient = v_uid THEN RETURN jsonb_build_object('error','invalid_recipient'); END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 500 THEN RETURN jsonb_build_object('error','invalid_amount'); END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = _recipient) THEN
    RETURN jsonb_build_object('error','recipient_not_found');
  END IF;
  SELECT COALESCE(sum(amount),0) INTO v_today_total FROM xp_gifts
    WHERE sender_id = v_uid AND created_at >= date_trunc('day', now());
  IF v_today_total + _amount > 500 THEN
    RETURN jsonb_build_object('error','daily_gift_limit_exceeded','remaining', GREATEST(0, 500 - v_today_total));
  END IF;
  SELECT total_points INTO v_balance FROM user_points WHERE user_id = v_uid;
  IF COALESCE(v_balance,0) < _amount THEN
    RETURN jsonb_build_object('error','insufficient_xp','balance',COALESCE(v_balance,0));
  END IF;
  PERFORM add_user_points(v_uid, -_amount, 'xp_gift_sent', _recipient::text);
  PERFORM add_user_points(_recipient, _amount, 'xp_gift_received', v_uid::text);
  INSERT INTO xp_gifts (sender_id, recipient_id, amount, message)
  VALUES (v_uid, _recipient, _amount, _message)
  RETURNING id INTO v_gift_id;
  INSERT INTO notifications (user_id, actor_id, type, title, message, related_id, action_url)
  VALUES (_recipient, v_uid, 'xp_gift_received',
          'You received ' || _amount || ' XP! 🎁',
          COALESCE(_message, 'A friend sent you XP.'),
          v_gift_id,
          '/rewards?tab=gift-xp');
  RETURN jsonb_build_object('ok',true,'amount',_amount,'gift_id',v_gift_id);
END;
$function$;