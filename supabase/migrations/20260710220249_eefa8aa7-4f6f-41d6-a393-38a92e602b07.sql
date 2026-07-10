
-- 1) Table
CREATE TABLE public.profit_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  period_start date NOT NULL,
  period_end date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (subscription_id, period_start)
);

GRANT SELECT ON public.profit_distributions TO authenticated;
GRANT ALL ON public.profit_distributions TO service_role;

ALTER TABLE public.profit_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Investors read own profits" ON public.profit_distributions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admin manage profits" ON public.profit_distributions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX profit_distributions_user_idx ON public.profit_distributions(user_id, period_start DESC);

-- 2) Weekly distribution function
CREATE OR REPLACE FUNCTION public.distribute_weekly_profits()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_count integer := 0;
  wk_start date := (current_date - EXTRACT(DOW FROM current_date)::int)::date; -- Sunday of this week
  wk_end   date := wk_start + 6;
BEGIN
  INSERT INTO public.profit_distributions
    (user_id, subscription_id, amount, currency, period_start, period_end)
  SELECT s.user_id,
         s.id,
         ROUND((s.amount * COALESCE(p.target_return_pct, 0) / 100.0 / 52.0)::numeric, 2),
         COALESCE(s.currency, 'USD'),
         wk_start,
         wk_end
  FROM public.subscriptions s
  JOIN public.packages p ON p.id = s.package_id
  WHERE s.status = 'active'
    AND COALESCE(p.target_return_pct, 0) > 0
    AND s.started_at IS NOT NULL
    AND s.started_at::date <= wk_end
  ON CONFLICT (subscription_id, period_start) DO NOTHING;

  GET DIAGNOSTICS inserted_count = ROW_COUNT;
  RETURN inserted_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.distribute_weekly_profits() TO service_role;

-- 3) Enable pg_cron and schedule weekly (Sunday 00:05 UTC)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;

-- Remove any previous schedule with the same name, then reschedule.
DO $$
BEGIN
  PERFORM cron.unschedule('distribute-weekly-profits')
  WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'distribute-weekly-profits');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'distribute-weekly-profits',
  '5 0 * * 0',
  $cron$ SELECT public.distribute_weekly_profits(); $cron$
);
