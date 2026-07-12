
-- =========================================================================
-- ENTERPRISE COPY EXECUTION ENGINE (additive)
-- =========================================================================

-- 1) Copy execution modes (admin-toggleable)
CREATE TABLE IF NOT EXISTS public.copy_execution_modes (
  code text PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.copy_execution_modes TO authenticated;
GRANT ALL ON public.copy_execution_modes TO service_role;
ALTER TABLE public.copy_execution_modes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "modes readable by authenticated"
  ON public.copy_execution_modes FOR SELECT TO authenticated USING (true);
CREATE POLICY "modes manageable by super_admin"
  ON public.copy_execution_modes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.copy_execution_modes(code,name,description) VALUES
  ('proportional','Proportional','Follower size scales by allocated capital / master capital'),
  ('fixed_lot','Fixed Lot','Follower uses a fixed lot size per trade'),
  ('multiplier','Multiplier','Follower size = master lot × multiplier'),
  ('percentage','Percentage Allocation','Follower risks a fixed % of allocated capital per trade')
ON CONFLICT (code) DO NOTHING;

-- 2) Per-subscription follower settings
CREATE TABLE IF NOT EXISTS public.copy_follower_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL UNIQUE REFERENCES public.copy_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  copy_mode text NOT NULL DEFAULT 'proportional' REFERENCES public.copy_execution_modes(code),
  capital_allocation numeric(20,2) NOT NULL DEFAULT 0,
  max_allocation numeric(20,2),
  max_daily_loss numeric(20,2),
  max_overall_loss numeric(20,2),
  max_open_positions integer,
  max_position_size numeric(20,4),
  copy_stop_loss_pct numeric(8,4),
  copy_take_profit_pct numeric(8,4),
  fixed_lot_size numeric(20,4),
  multiplier numeric(10,4) DEFAULT 1,
  percentage_per_trade numeric(8,4),
  is_paused boolean NOT NULL DEFAULT false,
  close_on_unsubscribe boolean NOT NULL DEFAULT true,
  daily_realized_pnl numeric(20,2) NOT NULL DEFAULT 0,
  overall_realized_pnl numeric(20,2) NOT NULL DEFAULT 0,
  last_reset_date date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_follower_settings TO authenticated;
GRANT ALL ON public.copy_follower_settings TO service_role;
ALTER TABLE public.copy_follower_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads own settings"
  ON public.copy_follower_settings FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "owner upserts own settings"
  ON public.copy_follower_settings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "owner updates own settings"
  ON public.copy_follower_settings FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_admin deletes settings"
  ON public.copy_follower_settings FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_cfs_user ON public.copy_follower_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_cfs_sub ON public.copy_follower_settings(subscription_id);

CREATE TRIGGER trg_cfs_updated_at BEFORE UPDATE ON public.copy_follower_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Copy execution queue (durable, idempotent)
CREATE TABLE IF NOT EXISTS public.copy_execution_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL,
  master_trade_id uuid REFERENCES public.copy_master_trades(id) ON DELETE CASCADE,
  event_type text NOT NULL CHECK (event_type IN
    ('open','modify','partial_close','close','stop_loss','take_profit','trailing_stop','manual_close','emergency_close')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  enqueued_at timestamptz NOT NULL DEFAULT now(),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dedupe_key)
);
GRANT SELECT ON public.copy_execution_queue TO authenticated;
GRANT ALL ON public.copy_execution_queue TO service_role;
ALTER TABLE public.copy_execution_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "queue readable by super_admin"
  ON public.copy_execution_queue FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "queue manageable by super_admin"
  ON public.copy_execution_queue FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_ceq_status_enqueued ON public.copy_execution_queue(status, enqueued_at);
CREATE INDEX IF NOT EXISTS idx_ceq_master ON public.copy_execution_queue(master_id);
CREATE INDEX IF NOT EXISTS idx_ceq_trade ON public.copy_execution_queue(master_trade_id);

CREATE TRIGGER trg_ceq_updated_at BEFORE UPDATE ON public.copy_execution_queue
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Per-follower execution log
CREATE TABLE IF NOT EXISTS public.copy_execution_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  queue_id uuid REFERENCES public.copy_execution_queue(id) ON DELETE CASCADE,
  master_id uuid NOT NULL,
  master_trade_id uuid,
  subscription_id uuid,
  user_id uuid,
  event_type text NOT NULL,
  copy_mode text,
  calc_method text,
  lot_size numeric(20,4),
  status text NOT NULL CHECK (status IN ('executed','skipped','failed')),
  failure_reason text,
  latency_ms integer,
  executed_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.copy_execution_log TO authenticated;
GRANT ALL ON public.copy_execution_log TO service_role;
ALTER TABLE public.copy_execution_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "log readable by owner or admin"
  ON public.copy_execution_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "log inserted by service"
  ON public.copy_execution_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_cel_user ON public.copy_execution_log(user_id);
CREATE INDEX IF NOT EXISTS idx_cel_sub ON public.copy_execution_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_cel_master_trade ON public.copy_execution_log(master_trade_id);
CREATE INDEX IF NOT EXISTS idx_cel_status_time ON public.copy_execution_log(status, executed_at DESC);

-- 5) Daily performance rollups
CREATE TABLE IF NOT EXISTS public.copy_performance_daily (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day date NOT NULL,
  master_id uuid,
  subscription_id uuid,
  executed_count integer NOT NULL DEFAULT 0,
  failed_count integer NOT NULL DEFAULT 0,
  skipped_count integer NOT NULL DEFAULT 0,
  avg_latency_ms numeric(12,2),
  success_rate numeric(6,4),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(day, master_id, subscription_id)
);
GRANT SELECT ON public.copy_performance_daily TO authenticated;
GRANT ALL ON public.copy_performance_daily TO service_role;
ALTER TABLE public.copy_performance_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "perf readable by authenticated"
  ON public.copy_performance_daily FOR SELECT TO authenticated USING (true);
CREATE POLICY "perf manageable by super_admin"
  ON public.copy_performance_daily FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_cpd_master_day ON public.copy_performance_daily(master_id, day DESC);
CREATE INDEX IF NOT EXISTS idx_cpd_sub_day ON public.copy_performance_daily(subscription_id, day DESC);

CREATE TRIGGER trg_cpd_updated_at BEFORE UPDATE ON public.copy_performance_daily
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6) Admin view — live copy queue
CREATE OR REPLACE VIEW public.v_copy_queue_admin AS
SELECT q.id, q.master_id, q.master_trade_id, q.event_type, q.status, q.attempts,
       q.last_error, q.enqueued_at, q.started_at, q.completed_at,
       cm.name AS master_name, mt.symbol, mt.side
FROM public.copy_execution_queue q
LEFT JOIN public.copy_masters cm ON cm.id = q.master_id
LEFT JOIN public.copy_master_trades mt ON mt.id = q.master_trade_id;

-- =========================================================================
-- FUNCTIONS
-- =========================================================================

-- Enqueue master event (idempotent by dedupe_key)
CREATE OR REPLACE FUNCTION public.copy_enqueue_master_event(
  _master_id uuid,
  _master_trade_id uuid,
  _event_type text,
  _payload jsonb DEFAULT '{}'::jsonb,
  _dedupe_key text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  new_id uuid;
  key text := COALESCE(_dedupe_key,
    concat_ws(':', _master_id::text, COALESCE(_master_trade_id::text,'null'), _event_type, extract(epoch from now())::text));
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.copy_execution_queue(master_id, master_trade_id, event_type, payload, dedupe_key)
  VALUES (_master_id, _master_trade_id, _event_type, COALESCE(_payload,'{}'::jsonb), key)
  ON CONFLICT (dedupe_key) DO NOTHING
  RETURNING id INTO new_id;

  IF new_id IS NULL THEN
    SELECT id INTO new_id FROM public.copy_execution_queue WHERE dedupe_key = key;
  END IF;

  INSERT INTO public.copy_audit_log(actor_id, event, payload)
  VALUES (uid, 'copy_enqueue',
          jsonb_build_object('queue_id',new_id,'master_id',_master_id,'trade_id',_master_trade_id,'event',_event_type));

  RETURN new_id;
END $$;

-- Validate & compute lot size for one follower
CREATE OR REPLACE FUNCTION public.copy_calc_follower_lot(
  _settings public.copy_follower_settings,
  _master_lot numeric,
  _master_capital numeric
) RETURNS numeric
LANGUAGE plpgsql IMMUTABLE
AS $$
DECLARE
  lot numeric := 0;
BEGIN
  IF _settings.copy_mode = 'proportional' THEN
    lot := CASE WHEN COALESCE(_master_capital,0) > 0
                THEN _master_lot * (_settings.capital_allocation / _master_capital)
                ELSE 0 END;
  ELSIF _settings.copy_mode = 'fixed_lot' THEN
    lot := COALESCE(_settings.fixed_lot_size, 0);
  ELSIF _settings.copy_mode = 'multiplier' THEN
    lot := _master_lot * COALESCE(_settings.multiplier, 1);
  ELSIF _settings.copy_mode = 'percentage' THEN
    lot := _settings.capital_allocation * COALESCE(_settings.percentage_per_trade,0) / 100.0;
  END IF;

  IF _settings.max_position_size IS NOT NULL AND lot > _settings.max_position_size THEN
    lot := _settings.max_position_size;
  END IF;
  RETURN GREATEST(ROUND(lot::numeric, 4), 0);
END $$;

-- Process a single queue item: validate followers, log per-follower outcome
CREATE OR REPLACE FUNCTION public.copy_process_queue_item(_queue_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  q record;
  m record;
  s record;
  fs record;
  mode_enabled boolean;
  master_lot numeric;
  master_capital numeric;
  computed_lot numeric;
  executed int := 0;
  skipped int := 0;
  failed int := 0;
  started timestamptz := clock_timestamp();
  latency int;
  open_positions int;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;

  -- Lock queue row
  SELECT * INTO q FROM public.copy_execution_queue WHERE id = _queue_id FOR UPDATE SKIP LOCKED;
  IF NOT FOUND THEN RETURN jsonb_build_object('ok',false,'reason','locked_or_missing'); END IF;
  IF q.status IN ('completed','processing') THEN
    RETURN jsonb_build_object('ok',false,'reason','already_'||q.status);
  END IF;

  UPDATE public.copy_execution_queue
     SET status='processing', started_at=now(), attempts=attempts+1
   WHERE id = _queue_id;

  SELECT * INTO m FROM public.copy_masters WHERE id = q.master_id;
  IF NOT FOUND OR m.is_active = false THEN
    UPDATE public.copy_execution_queue SET status='failed', last_error='master_unavailable', completed_at=now() WHERE id=_queue_id;
    RETURN jsonb_build_object('ok',false,'reason','master_unavailable');
  END IF;

  master_lot := COALESCE((q.payload->>'lot')::numeric, 1);
  master_capital := COALESCE(m.min_capital, 100);

  FOR s IN
    SELECT cs.* FROM public.copy_subscriptions cs
    WHERE cs.master_id = q.master_id AND cs.status = 'active'
  LOOP
    BEGIN
      SELECT * INTO fs FROM public.copy_follower_settings WHERE subscription_id = s.id;

      -- reset daily bucket
      IF fs.id IS NOT NULL AND fs.last_reset_date < current_date THEN
        UPDATE public.copy_follower_settings
           SET daily_realized_pnl=0, last_reset_date=current_date
         WHERE id = fs.id;
        fs.daily_realized_pnl := 0;
      END IF;

      -- Mode enabled?
      SELECT is_enabled INTO mode_enabled FROM public.copy_execution_modes
      WHERE code = COALESCE(fs.copy_mode,'proportional');
      IF NOT COALESCE(mode_enabled,true) THEN
        INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
          event_type, copy_mode, status, failure_reason, latency_ms)
        VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                q.event_type, fs.copy_mode, 'skipped', 'mode_disabled',
                (extract(epoch from clock_timestamp()-started)*1000)::int);
        skipped := skipped + 1; CONTINUE;
      END IF;

      -- Paused?
      IF fs.id IS NOT NULL AND fs.is_paused THEN
        INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
          event_type, copy_mode, status, failure_reason, latency_ms)
        VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                q.event_type, fs.copy_mode, 'skipped','paused',
                (extract(epoch from clock_timestamp()-started)*1000)::int);
        skipped := skipped + 1; CONTINUE;
      END IF;

      -- Balance check
      IF s.allocated_amount <= 0 THEN
        INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
          event_type, copy_mode, status, failure_reason, latency_ms)
        VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                q.event_type, COALESCE(fs.copy_mode,'proportional'), 'skipped','insufficient_balance',
                (extract(epoch from clock_timestamp()-started)*1000)::int);
        skipped := skipped + 1; CONTINUE;
      END IF;

      -- Risk limits
      IF fs.id IS NOT NULL AND fs.max_daily_loss IS NOT NULL
         AND fs.daily_realized_pnl <= -ABS(fs.max_daily_loss) THEN
        INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
          event_type, copy_mode, status, failure_reason, latency_ms)
        VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                q.event_type, fs.copy_mode, 'skipped','max_daily_loss_hit',
                (extract(epoch from clock_timestamp()-started)*1000)::int);
        skipped := skipped + 1; CONTINUE;
      END IF;
      IF fs.id IS NOT NULL AND fs.max_overall_loss IS NOT NULL
         AND fs.overall_realized_pnl <= -ABS(fs.max_overall_loss) THEN
        INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
          event_type, copy_mode, status, failure_reason, latency_ms)
        VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                q.event_type, fs.copy_mode, 'skipped','max_overall_loss_hit',
                (extract(epoch from clock_timestamp()-started)*1000)::int);
        skipped := skipped + 1; CONTINUE;
      END IF;

      -- Max open positions
      IF fs.id IS NOT NULL AND fs.max_open_positions IS NOT NULL AND q.event_type = 'open' THEN
        SELECT COUNT(*) INTO open_positions FROM public.copy_trade_fills tf
          WHERE tf.subscription_id = s.id AND tf.status = 'open';
        IF open_positions >= fs.max_open_positions THEN
          INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
            event_type, copy_mode, status, failure_reason, latency_ms)
          VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
                  q.event_type, fs.copy_mode, 'skipped','max_open_positions_hit',
                  (extract(epoch from clock_timestamp()-started)*1000)::int);
          skipped := skipped + 1; CONTINUE;
        END IF;
      END IF;

      -- Compute lot
      computed_lot := public.copy_calc_follower_lot(
        COALESCE(fs, ROW(NULL,s.id,s.user_id,'proportional',s.allocated_amount,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,false,true,0,0,current_date,now(),now())::public.copy_follower_settings),
        master_lot, master_capital);

      latency := (extract(epoch from clock_timestamp()-started)*1000)::int;

      INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
        event_type, copy_mode, calc_method, lot_size, status, latency_ms, metadata)
      VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
              q.event_type, COALESCE(fs.copy_mode,'proportional'),
              COALESCE(fs.copy_mode,'proportional'), computed_lot,
              'executed', latency,
              jsonb_build_object('master_lot',master_lot,'allocation',s.allocated_amount));
      executed := executed + 1;

    EXCEPTION WHEN OTHERS THEN
      INSERT INTO public.copy_execution_log(queue_id, master_id, master_trade_id, subscription_id, user_id,
        event_type, copy_mode, status, failure_reason, latency_ms)
      VALUES (q.id, q.master_id, q.master_trade_id, s.id, s.user_id,
              q.event_type, COALESCE(fs.copy_mode,'proportional'), 'failed', SQLERRM,
              (extract(epoch from clock_timestamp()-started)*1000)::int);
      failed := failed + 1;
    END;
  END LOOP;

  UPDATE public.copy_execution_queue
     SET status='completed', completed_at=now()
   WHERE id = _queue_id;

  -- Roll up daily performance
  INSERT INTO public.copy_performance_daily(day, master_id, executed_count, failed_count, skipped_count,
    avg_latency_ms, success_rate)
  VALUES (current_date, q.master_id, executed, failed, skipped,
          (extract(epoch from clock_timestamp()-started)*1000)::numeric,
          CASE WHEN (executed+failed+skipped) > 0
               THEN executed::numeric/(executed+failed+skipped) ELSE NULL END)
  ON CONFLICT (day, master_id, subscription_id) DO UPDATE SET
    executed_count = public.copy_performance_daily.executed_count + EXCLUDED.executed_count,
    failed_count   = public.copy_performance_daily.failed_count   + EXCLUDED.failed_count,
    skipped_count  = public.copy_performance_daily.skipped_count  + EXCLUDED.skipped_count,
    avg_latency_ms = EXCLUDED.avg_latency_ms,
    success_rate   = EXCLUDED.success_rate;

  RETURN jsonb_build_object('ok',true,'executed',executed,'skipped',skipped,'failed',failed);
END $$;

-- Admin control
CREATE OR REPLACE FUNCTION public.copy_pause_subscription(_subscription_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT (public.has_role(uid,'super_admin')
     OR EXISTS(SELECT 1 FROM public.copy_subscriptions WHERE id=_subscription_id AND user_id=uid)) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  INSERT INTO public.copy_follower_settings(subscription_id, user_id, is_paused)
  SELECT id, user_id, true FROM public.copy_subscriptions WHERE id=_subscription_id
  ON CONFLICT (subscription_id) DO UPDATE SET is_paused = true;
  RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.copy_resume_subscription(_subscription_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT (public.has_role(uid,'super_admin')
     OR EXISTS(SELECT 1 FROM public.copy_subscriptions WHERE id=_subscription_id AND user_id=uid)) THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  UPDATE public.copy_follower_settings SET is_paused = false WHERE subscription_id=_subscription_id;
  RETURN jsonb_build_object('ok',true);
END $$;

CREATE OR REPLACE FUNCTION public.copy_retry_failed(_queue_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  UPDATE public.copy_execution_queue
     SET status='queued', last_error=NULL, started_at=NULL, completed_at=NULL
   WHERE id=_queue_id AND status='failed';
  RETURN public.copy_process_queue_item(_queue_id);
END $$;

CREATE OR REPLACE FUNCTION public.copy_force_sync(_master_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); qid uuid;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  qid := public.copy_enqueue_master_event(_master_id, NULL, 'open',
    jsonb_build_object('force_sync', true, 'lot', 1),
    concat('force_sync:', _master_id::text, ':', extract(epoch from now())::text));
  RETURN public.copy_process_queue_item(qid);
END $$;
