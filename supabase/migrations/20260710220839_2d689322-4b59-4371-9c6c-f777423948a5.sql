
CREATE OR REPLACE FUNCTION public.distribute_weekly_profits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  today date := current_date;
  dow int := EXTRACT(ISODOW FROM current_date)::int; -- 1=Mon..7=Sun
  wk_start date := date_trunc('week', current_date)::date; -- Monday
  wk_fri date := wk_start + 4;
BEGIN
  IF dow > 5 THEN RETURN 0; END IF;

  INSERT INTO public.profit_distributions
    (user_id, subscription_id, amount, currency, period_start, period_end)
  SELECT s.user_id,
         s.id,
         CASE
           WHEN dow = 5 THEN
             ROUND((s.amount * COALESCE(p.target_return_pct, 0) / 100.0)::numeric, 2)
             - COALESCE((
                 SELECT SUM(pd.amount)
                 FROM public.profit_distributions pd
                 WHERE pd.subscription_id = s.id
                   AND pd.period_start >= wk_start
                   AND pd.period_start < wk_fri
               ), 0)
           ELSE
             ROUND((s.amount * COALESCE(p.target_return_pct, 0) / 100.0 / 5.0)::numeric, 2)
         END,
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
