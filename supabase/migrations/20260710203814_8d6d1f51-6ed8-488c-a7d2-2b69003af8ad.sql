CREATE TABLE IF NOT EXISTS public.system_backfill_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  operation text NOT NULL,
  rows_updated int NOT NULL DEFAULT 0,
  rows_skipped int NOT NULL DEFAULT 0,
  notes text,
  ran_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.system_backfill_log TO authenticated;
GRANT ALL ON public.system_backfill_log TO service_role;
ALTER TABLE public.system_backfill_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read backfill log" ON public.system_backfill_log
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(),'super_admin') OR public.has_role(auth.uid(),'admin'));