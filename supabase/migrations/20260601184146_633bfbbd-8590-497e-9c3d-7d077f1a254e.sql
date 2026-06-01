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
  VALUES (v_uid, _recipient, _amount, _message);
  INSERT INTO notifications (user_id, actor_id, type, title, message)
  VALUES (_recipient, v_uid, 'xp_gift_received',
          'You received ' || _amount || ' XP! 🎁',
          COALESCE(_message, 'A friend sent you XP.'));
  RETURN jsonb_build_object('ok',true,'amount',_amount);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.gift_xp(uuid, integer, text) TO authenticated;

UPDATE public.notifications n
SET actor_id = g.sender_id
FROM public.xp_gifts g
WHERE n.type = 'xp_gift_received'
  AND n.actor_id IS NULL
  AND n.user_id = g.recipient_id
  AND n.title = 'You received ' || g.amount || ' XP! 🎁'
  AND n.created_at BETWEEN g.created_at - interval '10 seconds' AND g.created_at + interval '10 seconds';