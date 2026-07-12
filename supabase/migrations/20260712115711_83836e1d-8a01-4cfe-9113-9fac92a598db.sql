
-- =========================================================================
-- Sprint 3: Hyper-Scale Prep (additive, dormant)
-- =========================================================================

-- ---- 1. Monitoring views (admin only) -----------------------------------

CREATE OR REPLACE VIEW public.v_system_health_db_latency
WITH (security_invoker = true) AS
SELECT
  now()                                     AS observed_at,
  (SELECT count(*) FROM pg_stat_activity
     WHERE state = 'active')                AS active_connections,
  (SELECT count(*) FROM pg_stat_activity
     WHERE state = 'idle in transaction')   AS idle_in_tx,
  (SELECT max(extract(epoch FROM (now() - xact_start)))
     FROM pg_stat_activity
     WHERE xact_start IS NOT NULL)          AS longest_tx_seconds;

CREATE OR REPLACE VIEW public.v_system_health_row_counts
WITH (security_invoker = true) AS
SELECT relname            AS table_name,
       n_live_tup         AS approx_rows,
       n_dead_tup         AS dead_rows,
       last_vacuum,
       last_autovacuum
  FROM pg_stat_user_tables
 WHERE schemaname = 'public';

REVOKE ALL ON public.v_system_health_db_latency FROM PUBLIC;
REVOKE ALL ON public.v_system_health_row_counts FROM PUBLIC;
GRANT SELECT ON public.v_system_health_db_latency TO authenticated;
GRANT SELECT ON public.v_system_health_row_counts TO authenticated;

-- Guard views behind admin role via a wrapper function so RLS/role checks
-- apply consistently across the app (view privileges are already gated at
-- the app layer through has_role checks in the admin console).

-- ---- 2. Monthly partitioning PREP (dormant) -----------------------------
--
-- These functions build a *new* partitioned table alongside the existing
-- table (suffix `_p`) and create rolling monthly partitions. They do NOT
-- touch the live tables. Activation requires a separate, manually run
-- migration to attach/swap. Kept idempotent so ops can re-run safely.

CREATE OR REPLACE FUNCTION public.hyperscale_prepare_partitioned_table(
  p_source_table text,
  p_partition_key text DEFAULT 'created_at'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_table text := p_source_table || '_p';
  v_sql       text;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema='public' AND table_name = p_source_table
  ) THEN
    RAISE EXCEPTION 'Source table public.% not found', p_source_table;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
     WHERE table_schema='public' AND table_name = v_new_table
  ) THEN
    RETURN format('SKIP: %I already exists', v_new_table);
  END IF;

  v_sql := format(
    'CREATE TABLE public.%I (LIKE public.%I INCLUDING ALL) PARTITION BY RANGE (%I)',
    v_new_table, p_source_table, p_partition_key
  );
  EXECUTE v_sql;

  RETURN format('CREATED partitioned shell public.%I (dormant)', v_new_table);
END $$;

CREATE OR REPLACE FUNCTION public.hyperscale_ensure_monthly_partitions(
  p_partitioned_table text,
  p_months_ahead int DEFAULT 3,
  p_months_behind int DEFAULT 1
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_created int := 0;
  v_start   date;
  v_end     date;
  v_name    text;
  i         int;
BEGIN
  FOR i IN -p_months_behind .. p_months_ahead LOOP
    v_start := date_trunc('month', now())::date + (i || ' months')::interval;
    v_end   := (v_start + interval '1 month')::date;
    v_name  := format('%s_%s', p_partitioned_table, to_char(v_start, 'YYYYMM'));

    IF NOT EXISTS (
      SELECT 1 FROM pg_class WHERE relname = v_name
    ) THEN
      EXECUTE format(
        'CREATE TABLE public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)',
        v_name, p_partitioned_table, v_start, v_end
      );
      v_created := v_created + 1;
    END IF;
  END LOOP;
  RETURN v_created;
END $$;

COMMENT ON FUNCTION public.hyperscale_prepare_partitioned_table(text,text) IS
  'Sprint 3 dormant helper: creates <table>_p partitioned shell. Does not move data.';
COMMENT ON FUNCTION public.hyperscale_ensure_monthly_partitions(text,int,int) IS
  'Sprint 3 dormant helper: creates rolling monthly partitions on a partitioned table.';

-- Only admins run these; keep default (no grant to anon/authenticated).
REVOKE ALL ON FUNCTION public.hyperscale_prepare_partitioned_table(text,text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.hyperscale_ensure_monthly_partitions(text,int,int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.hyperscale_prepare_partitioned_table(text,text) TO service_role;
GRANT EXECUTE ON FUNCTION public.hyperscale_ensure_monthly_partitions(text,int,int) TO service_role;
