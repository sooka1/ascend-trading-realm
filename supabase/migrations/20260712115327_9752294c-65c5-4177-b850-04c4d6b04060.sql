
-- =========================================================================
-- 1. COPY QUEUE HARDENING
-- =========================================================================

ALTER TABLE public.copy_execution_queue
  ADD COLUMN IF NOT EXISTS worker_id text,
  ADD COLUMN IF NOT EXISTS heartbeat_at timestamptz,
  ADD COLUMN IF NOT EXISTS locked_until timestamptz,
  ADD COLUMN IF NOT EXISTS next_retry_at timestamptz,
  ADD COLUMN IF NOT EXISTS max_attempts integer NOT NULL DEFAULT 5;

CREATE INDEX IF NOT EXISTS idx_copy_queue_ready
  ON public.copy_execution_queue (status, next_retry_at NULLS FIRST, enqueued_at)
  WHERE status IN ('pending','retry');

CREATE INDEX IF NOT EXISTS idx_copy_queue_stale
  ON public.copy_execution_queue (status, locked_until)
  WHERE status = 'processing';

-- Dead-letter queue
CREATE TABLE IF NOT EXISTS public.copy_execution_dlq (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_id uuid NOT NULL,
  master_id uuid NOT NULL,
  master_trade_id uuid,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text NOT NULL,
  attempts integer NOT NULL,
  last_error text,
  enqueued_at timestamptz NOT NULL,
  failed_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  review_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.copy_execution_dlq TO authenticated;
GRANT ALL ON public.copy_execution_dlq TO service_role;
ALTER TABLE public.copy_execution_dlq ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins manage DLQ" ON public.copy_execution_dlq;
CREATE POLICY "Admins manage DLQ" ON public.copy_execution_dlq
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_dlq_failed_at ON public.copy_execution_dlq (failed_at DESC);
CREATE INDEX IF NOT EXISTS idx_dlq_reviewed ON public.copy_execution_dlq (reviewed_at) WHERE reviewed_at IS NULL;

-- Atomic worker claim (exactly-once). Callable only by service_role in practice.
CREATE OR REPLACE FUNCTION public.copy_claim_next_job(_worker_id text, _lock_seconds integer DEFAULT 60)
RETURNS SETOF public.copy_execution_queue
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  UPDATE public.copy_execution_queue q
     SET status = 'processing',
         worker_id = _worker_id,
         heartbeat_at = now(),
         locked_until = now() + make_interval(secs => _lock_seconds),
         started_at = COALESCE(q.started_at, now()),
         attempts = q.attempts + 1,
         updated_at = now()
   WHERE q.id = (
     SELECT id FROM public.copy_execution_queue
      WHERE status IN ('pending','retry')
        AND (next_retry_at IS NULL OR next_retry_at <= now())
      ORDER BY enqueued_at
      FOR UPDATE SKIP LOCKED
      LIMIT 1
   )
   RETURNING q.*;
END $$;

-- Crash recovery: release jobs whose worker has died (no heartbeat past locked_until).
CREATE OR REPLACE FUNCTION public.copy_release_stale_jobs()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.copy_execution_queue
     SET status = 'retry',
         worker_id = NULL,
         heartbeat_at = NULL,
         locked_until = NULL,
         next_retry_at = now(),
         last_error = COALESCE(last_error,'') || E'\n[stale-recovered]',
         updated_at = now()
   WHERE status = 'processing'
     AND locked_until IS NOT NULL
     AND locked_until < now();
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END $$;

-- Fail job with exponential backoff → DLQ escalation after max_attempts.
CREATE OR REPLACE FUNCTION public.copy_fail_job(_id uuid, _error text)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  j record;
  backoff_seconds integer;
BEGIN
  SELECT * INTO j FROM public.copy_execution_queue WHERE id = _id FOR UPDATE;
  IF NOT FOUND THEN RETURN 'not_found'; END IF;

  IF j.attempts >= j.max_attempts THEN
    INSERT INTO public.copy_execution_dlq
      (original_id, master_id, master_trade_id, event_type, payload, dedupe_key, attempts, last_error, enqueued_at)
    VALUES
      (j.id, j.master_id, j.master_trade_id, j.event_type, j.payload, j.dedupe_key, j.attempts, _error, j.enqueued_at);
    UPDATE public.copy_execution_queue
       SET status = 'failed', last_error = _error, completed_at = now(), updated_at = now()
     WHERE id = _id;
    RETURN 'dlq';
  END IF;

  -- Exponential backoff: 30s, 2m, 8m, 32m ...
  backoff_seconds := 30 * (4 ^ GREATEST(j.attempts - 1, 0));
  UPDATE public.copy_execution_queue
     SET status = 'retry',
         worker_id = NULL,
         heartbeat_at = NULL,
         locked_until = NULL,
         last_error = _error,
         next_retry_at = now() + make_interval(secs => backoff_seconds),
         updated_at = now()
   WHERE id = _id;
  RETURN 'retry';
END $$;

CREATE OR REPLACE FUNCTION public.copy_complete_job(_id uuid)
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.copy_execution_queue
     SET status = 'completed',
         completed_at = now(),
         locked_until = NULL,
         updated_at = now()
   WHERE id = _id;
$$;

-- =========================================================================
-- 2. LEDGER INTEGRITY & RECONCILIATION
-- =========================================================================

CREATE OR REPLACE VIEW public.v_ledger_unbalanced_tx
WITH (security_invoker = true) AS
SELECT tx_id,
       SUM(direction * amount) AS imbalance,
       MIN(created_at)         AS first_seen,
       COUNT(*)                AS entry_count
  FROM public.ledger_entries
 GROUP BY tx_id
HAVING SUM(direction * amount) <> 0;

CREATE OR REPLACE VIEW public.v_ledger_daily_totals
WITH (security_invoker = true) AS
SELECT date_trunc('day', created_at)::date AS day,
       account,
       currency,
       SUM(direction * amount) AS net_amount,
       COUNT(*)                AS entries
  FROM public.ledger_entries
 GROUP BY 1,2,3;

-- Daily reconciliation snapshot table
CREATE TABLE IF NOT EXISTS public.ledger_integrity_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  total_entries bigint NOT NULL,
  total_tx bigint NOT NULL,
  unbalanced_tx bigint NOT NULL,
  imbalance_amount numeric NOT NULL DEFAULT 0,
  ran_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (day)
);

GRANT SELECT ON public.ledger_integrity_daily TO authenticated;
GRANT ALL ON public.ledger_integrity_daily TO service_role;
ALTER TABLE public.ledger_integrity_daily ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read integrity snapshots" ON public.ledger_integrity_daily;
CREATE POLICY "Admins read integrity snapshots" ON public.ledger_integrity_daily
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

CREATE OR REPLACE FUNCTION public.run_daily_ledger_reconciliation(_day date DEFAULT (current_date - 1))
RETURNS public.ledger_integrity_daily
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_total_entries bigint;
  v_total_tx bigint;
  v_unbalanced bigint;
  v_imbalance numeric;
  v_row public.ledger_integrity_daily;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT tx_id)
    INTO v_total_entries, v_total_tx
    FROM public.ledger_entries
   WHERE created_at >= _day AND created_at < _day + 1;

  SELECT COUNT(*), COALESCE(SUM(ABS(imbalance)),0)
    INTO v_unbalanced, v_imbalance
    FROM (
      SELECT tx_id, SUM(direction*amount) AS imbalance
        FROM public.ledger_entries
       WHERE created_at >= _day AND created_at < _day + 1
       GROUP BY tx_id
      HAVING SUM(direction*amount) <> 0
    ) t;

  INSERT INTO public.ledger_integrity_daily(day, total_entries, total_tx, unbalanced_tx, imbalance_amount)
  VALUES (_day, v_total_entries, v_total_tx, v_unbalanced, v_imbalance)
  ON CONFLICT (day) DO UPDATE SET
    total_entries = EXCLUDED.total_entries,
    total_tx = EXCLUDED.total_tx,
    unbalanced_tx = EXCLUDED.unbalanced_tx,
    imbalance_amount = EXCLUDED.imbalance_amount,
    ran_at = now()
  RETURNING * INTO v_row;
  RETURN v_row;
END $$;

-- =========================================================================
-- 3. COMPOSITE INDEXES FOR HOT PATHS
-- =========================================================================

CREATE INDEX IF NOT EXISTS idx_ledger_user_created       ON public.ledger_entries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_ref                ON public.ledger_entries (reference_table, reference_id);
CREATE INDEX IF NOT EXISTS idx_ledger_tx                 ON public.ledger_entries (tx_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON public.notifications (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_history_user_opened ON public.trading_history (user_id, opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_sim_positions_account_status ON public.sim_positions (account_id, status);
CREATE INDEX IF NOT EXISTS idx_sim_positions_user_status ON public.sim_positions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_pd_sub_period             ON public.profit_distributions (subscription_id, period_start);
CREATE INDEX IF NOT EXISTS idx_pd_user_period            ON public.profit_distributions (user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_ile_user_created          ON public.investment_lifecycle_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_copy_audit_actor_created  ON public.copy_audit_log (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_audit_user_created ON public.trading_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_user_status      ON public.deposits (user_id, status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status   ON public.withdrawals (user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON public.subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_copy_subs_user_status     ON public.copy_subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_positions_user_symbol     ON public.trading_positions (user_id, symbol);

-- =========================================================================
-- 4. MONITORING VIEWS (admin-only via table policies below)
-- =========================================================================

CREATE OR REPLACE VIEW public.v_system_health_queue
WITH (security_invoker = true) AS
SELECT status,
       COUNT(*)                                          AS jobs,
       COUNT(*) FILTER (WHERE next_retry_at <= now())    AS ready_now,
       COUNT(*) FILTER (WHERE locked_until < now())      AS stale_locks,
       MAX(attempts)                                     AS max_attempts_seen,
       MIN(enqueued_at)                                  AS oldest_enqueued
  FROM public.copy_execution_queue
 GROUP BY status;

CREATE OR REPLACE VIEW public.v_system_health_ledger
WITH (security_invoker = true) AS
SELECT
  (SELECT COUNT(*) FROM public.ledger_entries)                          AS total_entries,
  (SELECT COUNT(*) FROM public.v_ledger_unbalanced_tx)                  AS unbalanced_tx,
  (SELECT COALESCE(MAX(ran_at), 'epoch'::timestamptz)
     FROM public.ledger_integrity_daily)                                AS last_reconciled_at,
  (SELECT COALESCE(SUM(imbalance_amount),0)
     FROM public.ledger_integrity_daily
    WHERE day >= current_date - 30)                                     AS imbalance_last_30d;

CREATE OR REPLACE VIEW public.v_system_health_workers
WITH (security_invoker = true) AS
SELECT worker_id,
       COUNT(*)                            AS active_jobs,
       MAX(heartbeat_at)                   AS last_heartbeat,
       MIN(locked_until)                   AS next_expiry
  FROM public.copy_execution_queue
 WHERE status = 'processing' AND worker_id IS NOT NULL
 GROUP BY worker_id;

REVOKE ALL ON public.v_system_health_queue    FROM PUBLIC, anon;
REVOKE ALL ON public.v_system_health_ledger   FROM PUBLIC, anon;
REVOKE ALL ON public.v_system_health_workers  FROM PUBLIC, anon;
REVOKE ALL ON public.v_ledger_unbalanced_tx   FROM PUBLIC, anon;
REVOKE ALL ON public.v_ledger_daily_totals    FROM PUBLIC, anon;
GRANT SELECT ON public.v_system_health_queue    TO authenticated, service_role;
GRANT SELECT ON public.v_system_health_ledger   TO authenticated, service_role;
GRANT SELECT ON public.v_system_health_workers  TO authenticated, service_role;
GRANT SELECT ON public.v_ledger_unbalanced_tx   TO authenticated, service_role;
GRANT SELECT ON public.v_ledger_daily_totals    TO authenticated, service_role;
