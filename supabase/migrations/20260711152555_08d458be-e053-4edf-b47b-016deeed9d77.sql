CREATE OR REPLACE FUNCTION public.enter_competition(
  _competition_id text,
  _tier_fee numeric
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  approved_in numeric;
  approved_out numeric;
  committed_sub numeric;
  committed_comp numeric;
  profits numeric;
  available numeric;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;
  IF _tier_fee IS NULL OR _tier_fee <= 0 THEN
    RAISE EXCEPTION 'Invalid tier fee' USING ERRCODE = '22023';
  END IF;

  -- Lock existing entries for this user to serialize concurrent presses
  PERFORM 1 FROM public.competition_entries
    WHERE user_id = uid FOR UPDATE;

  -- Duplicate-click guard: identical entry created within last 10 seconds
  IF EXISTS (
    SELECT 1 FROM public.competition_entries
    WHERE user_id = uid
      AND tier_fee = _tier_fee
      AND COALESCE(competition_id, '') = COALESCE(_competition_id, '')
      AND status IN ('active','pending')
      AND created_at > now() - interval '10 seconds'
  ) THEN
    RAISE EXCEPTION 'Duplicate competition entry blocked'
      USING ERRCODE = 'unique_violation';
  END IF;

  SELECT COALESCE(SUM(amount),0) INTO approved_in
    FROM public.deposits WHERE user_id = uid AND status = 'approved';
  SELECT COALESCE(SUM(amount),0) INTO approved_out
    FROM public.withdrawals WHERE user_id = uid AND status = 'approved';
  SELECT COALESCE(SUM(amount),0) INTO committed_sub
    FROM public.subscriptions WHERE user_id = uid AND status IN ('active','pending');
  SELECT COALESCE(SUM(tier_fee),0) INTO committed_comp
    FROM public.competition_entries WHERE user_id = uid AND status IN ('active','pending');
  SELECT COALESCE(SUM(amount),0) INTO profits
    FROM public.profit_distributions WHERE user_id = uid;

  available := (approved_in + profits - approved_out) - committed_sub - committed_comp;

  IF available < _tier_fee THEN
    RAISE EXCEPTION 'Insufficient balance (available: %, required: %)', available, _tier_fee
      USING ERRCODE = 'check_violation';
  END IF;

  INSERT INTO public.competition_entries (user_id, competition_id, tier_fee, currency, status)
  VALUES (uid, _competition_id, _tier_fee, 'USD', 'active')
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.enter_competition(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enter_competition(text, numeric) TO authenticated;
