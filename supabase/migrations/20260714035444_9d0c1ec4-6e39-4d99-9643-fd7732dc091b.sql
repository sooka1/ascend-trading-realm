
-- Enable RLS on existing child partitions so direct-partition access respects the same rules as the parent table.
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT n.nspname, c.relname
      FROM pg_inherits i
      JOIN pg_class p ON p.oid = i.inhparent
      JOIN pg_class c ON c.oid = i.inhrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
     WHERE p.relname IN ('market_data_ticks','market_data_candles')
       AND NOT c.relrowsecurity
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.nspname, r.relname);
  END LOOP;
END $$;

-- Ensure future partitions created via hyperscale_ensure_monthly_partitions also enable RLS.
CREATE OR REPLACE FUNCTION public.hyperscale_ensure_monthly_partitions(p_partitioned_table text, p_months_ahead integer DEFAULT 3, p_months_behind integer DEFAULT 1)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = v_name) THEN
      EXECUTE format(
        'CREATE TABLE public.%I PARTITION OF public.%I FOR VALUES FROM (%L) TO (%L)',
        v_name, p_partitioned_table, v_start, v_end
      );
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_name);
      v_created := v_created + 1;
    END IF;
  END LOOP;
  RETURN v_created;
END $function$;
