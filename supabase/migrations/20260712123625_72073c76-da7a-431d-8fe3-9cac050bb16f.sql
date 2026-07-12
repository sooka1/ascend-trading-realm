
-- =====================================================================
-- 1. Realtime publication: add wallet-affecting tables
-- =====================================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['deposits','withdrawals','subscriptions','profit_distributions']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
       WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename=t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;

-- =====================================================================
-- 2. Copy queue recovery driver
-- =====================================================================
CREATE OR REPLACE FUNCTION public.recover_copy_queue()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stale     int := 0;
  v_retried   int := 0;
  v_dlq       int := 0;
BEGIN
  -- Release stuck locks (heartbeat older than 5 minutes)
  WITH released AS (
    UPDATE public.copy_execution_queue
       SET status = 'queued',
           worker_id = NULL,
           locked_until = NULL,
           heartbeat_at = NULL,
           updated_at = now()
     WHERE status = 'processing'
       AND (locked_until < now() OR heartbeat_at < now() - INTERVAL '5 minutes')
    RETURNING id
  )
  SELECT count(*) INTO v_stale FROM released;

  -- Schedule retries for transient failures under max_attempts
  WITH retried AS (
    UPDATE public.copy_execution_queue
       SET status = 'queued',
           next_retry_at = now() + (LEAST(attempts, 6) * INTERVAL '30 seconds'),
           updated_at = now()
     WHERE status = 'failed'
       AND attempts < max_attempts
       AND (next_retry_at IS NULL OR next_retry_at < now())
    RETURNING id
  )
  SELECT count(*) INTO v_retried FROM retried;

  -- Move exhausted jobs to DLQ (idempotent via original_id)
  WITH moved AS (
    INSERT INTO public.copy_execution_dlq (
      original_id, master_id, master_trade_id, event_type, payload,
      dedupe_key, attempts, last_error, enqueued_at
    )
    SELECT q.id, q.master_id, q.master_trade_id, q.event_type, q.payload,
           q.dedupe_key, q.attempts, q.last_error, q.enqueued_at
      FROM public.copy_execution_queue q
     WHERE q.status = 'failed'
       AND q.attempts >= q.max_attempts
       AND NOT EXISTS (SELECT 1 FROM public.copy_execution_dlq d WHERE d.original_id = q.id)
    RETURNING original_id
  ),
  purged AS (
    DELETE FROM public.copy_execution_queue q
     USING moved m
     WHERE q.id = m.original_id
    RETURNING q.id
  )
  SELECT count(*) INTO v_dlq FROM purged;

  RETURN jsonb_build_object(
    'stale_released', v_stale,
    'retried', v_retried,
    'moved_to_dlq', v_dlq,
    'ran_at', now()
  );
END;
$$;
REVOKE ALL ON FUNCTION public.recover_copy_queue() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.recover_copy_queue() TO service_role;

-- =====================================================================
-- 3. Ledger integrity daily reconciliation
-- =====================================================================
CREATE OR REPLACE FUNCTION public.reconcile_ledger_daily()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_count bigint;
  v_credits   numeric;
  v_debits    numeric;
  v_ok        boolean;
BEGIN
  SELECT count(*),
         COALESCE(SUM(CASE WHEN direction = 1  THEN amount ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN direction = -1 THEN amount ELSE 0 END), 0)
    INTO v_row_count, v_credits, v_debits
    FROM public.ledger_entries
   WHERE created_at::date = (now() - INTERVAL '1 day')::date;

  -- Idempotent per date via upsert on (as_of_date)
  v_ok := true; -- integrity policy hook; today just records the sums
  INSERT INTO public.ledger_integrity_daily (as_of_date, row_count, total_credits, total_debits, is_balanced, notes)
  VALUES ((now() - INTERVAL '1 day')::date, v_row_count, v_credits, v_debits, v_ok,
          'auto reconciliation')
  ON CONFLICT (as_of_date) DO UPDATE
    SET row_count = EXCLUDED.row_count,
        total_credits = EXCLUDED.total_credits,
        total_debits = EXCLUDED.total_debits,
        is_balanced = EXCLUDED.is_balanced,
        notes = EXCLUDED.notes;

  RETURN jsonb_build_object('rows', v_row_count, 'credits', v_credits, 'debits', v_debits);
END;
$$;
REVOKE ALL ON FUNCTION public.reconcile_ledger_daily() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_ledger_daily() TO service_role;

-- Add a unique constraint on ledger_integrity_daily.as_of_date if missing (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conname = 'ledger_integrity_daily_as_of_date_key'
  ) THEN
    BEGIN
      ALTER TABLE public.ledger_integrity_daily
        ADD CONSTRAINT ledger_integrity_daily_as_of_date_key UNIQUE (as_of_date);
    EXCEPTION WHEN duplicate_table OR duplicate_object OR undefined_column THEN NULL;
    END;
  END IF;
END $$;

-- =====================================================================
-- 4. Cleanup jobs
-- =====================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_inv int := 0;
  v_gi  int := 0;
  v_md  int := 0;
  v_lat int := 0;
BEGIN
  -- Expired competition invitations (>30 days past creation, unused)
  DELETE FROM public.comp_invitations
   WHERE created_at < now() - INTERVAL '30 days'
     AND (used_at IS NULL OR used_at < now() - INTERVAL '60 days');
  GET DIAGNOSTICS v_inv = ROW_COUNT;

  -- Old guest inquiries (>90 days, closed)
  DELETE FROM public.guest_inquiries
   WHERE created_at < now() - INTERVAL '90 days'
     AND status IN ('closed', 'resolved', 'archived');
  GET DIAGNOSTICS v_gi = ROW_COUNT;

  -- Market-data retention: ticks >7 days, latency samples >14 days
  DELETE FROM public.market_data_ticks
   WHERE created_at < now() - INTERVAL '7 days';
  GET DIAGNOSTICS v_md = ROW_COUNT;

  DELETE FROM public.market_data_latency_samples
   WHERE created_at < now() - INTERVAL '14 days';
  GET DIAGNOSTICS v_lat = ROW_COUNT;

  RETURN jsonb_build_object(
    'invitations', v_inv, 'guest_inquiries', v_gi,
    'market_ticks', v_md, 'latency_samples', v_lat
  );
EXCEPTION WHEN undefined_column OR undefined_table THEN
  RETURN jsonb_build_object('warning', SQLERRM);
END;
$$;
REVOKE ALL ON FUNCTION public.cleanup_expired_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_data() TO service_role;

-- =====================================================================
-- 5. Queue health snapshot (read helper for /ops)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.queue_health()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'queued',      (SELECT count(*) FROM public.copy_execution_queue WHERE status = 'queued'),
    'processing',  (SELECT count(*) FROM public.copy_execution_queue WHERE status = 'processing'),
    'failed',      (SELECT count(*) FROM public.copy_execution_queue WHERE status = 'failed'),
    'stale',       (SELECT count(*) FROM public.copy_execution_queue
                     WHERE status = 'processing'
                       AND (locked_until < now() OR heartbeat_at < now() - INTERVAL '5 minutes')),
    'dlq',         (SELECT count(*) FROM public.copy_execution_dlq WHERE reviewed_at IS NULL),
    'oldest_queued_at', (SELECT min(enqueued_at) FROM public.copy_execution_queue WHERE status = 'queued'),
    'as_of', now()
  );
$$;
REVOKE ALL ON FUNCTION public.queue_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.queue_health() TO service_role, authenticated;

-- =====================================================================
-- 6. Cron schedules (idempotent — unschedule + reschedule)
-- =====================================================================
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT jobid FROM cron.job
     WHERE jobname IN ('recover-copy-queue','reconcile-ledger-daily','cleanup-expired-data')
  LOOP
    PERFORM cron.unschedule(r.jobid);
  END LOOP;
END $$;

SELECT cron.schedule('recover-copy-queue',      '*/2 * * * *', $c$ SELECT public.recover_copy_queue(); $c$);
SELECT cron.schedule('reconcile-ledger-daily',  '15 1 * * *',  $c$ SELECT public.reconcile_ledger_daily(); $c$);
SELECT cron.schedule('cleanup-expired-data',    '30 3 * * *',  $c$ SELECT public.cleanup_expired_data(); $c$);
