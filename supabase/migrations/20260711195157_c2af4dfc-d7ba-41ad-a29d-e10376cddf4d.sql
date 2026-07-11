
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_user_id uuid, _delta numeric, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  reason text := COALESCE(NULLIF(trim(_reason),''), NULL);
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  IF _delta IS NULL OR _delta = 0 THEN RAISE EXCEPTION 'Delta must be non-zero'; END IF;
  IF reason IS NULL THEN RAISE EXCEPTION 'Reason required'; END IF;

  IF _delta > 0 THEN
    INSERT INTO public.deposits(user_id, amount, currency, status, method, notes, reviewed_by, reviewed_at)
    VALUES (_user_id, _delta, 'USD', 'approved', 'admin_adjust', reason, uid, now());
  ELSE
    INSERT INTO public.withdrawals(user_id, amount, currency, status, destination, notes, reviewed_by, reviewed_at)
    VALUES (_user_id, ABS(_delta), 'USD', 'approved', 'admin_adjust', reason, uid, now());
  END IF;

  INSERT INTO public.copy_audit_log(actor_id, target_user_id, event, payload)
  VALUES (uid, _user_id, 'admin_adjust_balance',
          jsonb_build_object('delta',_delta,'reason',reason));

  INSERT INTO public.notifications(user_id, title, body)
  VALUES (_user_id, 'تعديل رصيد يدوي',
          concat(CASE WHEN _delta>=0 THEN '+' ELSE '' END,'$', to_char(_delta,'FM999999990.00'),' — ',reason));

  RETURN jsonb_build_object('ok', true);
END;
$$;
