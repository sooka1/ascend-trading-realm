
CREATE OR REPLACE FUNCTION public.distribute_weekly_profits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  today date := current_date;
BEGIN
  INSERT INTO public.profit_distributions
    (user_id, subscription_id, amount, currency, period_start, period_end)
  SELECT s.user_id,
         s.id,
         ROUND((s.amount * COALESCE(p.target_return_pct, 0) / 100.0 / 5.0)::numeric, 2),
         COALESCE(s.currency, 'USD'),
         today,
         today
  FROM public.subscriptions s
  JOIN public.packages p ON p.id = s.package_id
  WHERE s.status = 'active'
    AND COALESCE(p.target_return_pct, 0) > 0
    AND s.started_at IS NOT NULL
    AND s.started_at::date <= today
  ON CONFLICT (subscription_id, period_start) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;
