-- Enable realtime on notifications (idempotent)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Update distribute_weekly_profits to also insert a per-user notification
CREATE OR REPLACE FUNCTION public.distribute_weekly_profits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  inserted_count integer := 0;
  today date := current_date;
  dow int := EXTRACT(ISODOW FROM current_date)::int;
  wk_start date := date_trunc('week', current_date)::date;
  wk_fri date := wk_start + 4;
BEGIN
  IF dow > 5 THEN RETURN 0; END IF;

  WITH inserted AS (
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
           END AS amount,
           COALESCE(s.currency, 'USD') AS currency,
           today AS period_start,
           today AS period_end
    FROM public.subscriptions s
    JOIN public.packages p ON p.id = s.package_id
    WHERE s.status = 'active'
      AND COALESCE(p.target_return_pct, 0) > 0
      AND s.started_at IS NOT NULL
      AND s.started_at::date <= today
    ON CONFLICT (subscription_id, period_start) DO NOTHING
    RETURNING user_id, subscription_id, amount, currency
  )
  INSERT INTO public.notifications (user_id, title, body)
  SELECT i.user_id,
         'عائد اليوم',
         concat('$', to_char(i.amount, 'FM999999990.00'), ' ', i.currency, ' — باقة ', p.name)
  FROM inserted i
  JOIN public.subscriptions s ON s.id = i.subscription_id
  JOIN public.packages p ON p.id = s.package_id
  WHERE i.amount > 0;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$function$;