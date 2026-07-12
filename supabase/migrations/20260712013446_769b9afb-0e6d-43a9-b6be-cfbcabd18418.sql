
-- =========================================================================
-- ENTERPRISE MARKET DATA PLATFORM (additive)
-- =========================================================================

-- 1) Providers registry
CREATE TABLE IF NOT EXISTS public.market_data_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'primary' CHECK (role IN ('primary','secondary','backup')),
  priority integer NOT NULL DEFAULT 100,
  is_enabled boolean NOT NULL DEFAULT true,
  supports_websocket boolean NOT NULL DEFAULT false,
  supports_polling boolean NOT NULL DEFAULT true,
  base_url text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_data_providers TO authenticated, anon;
GRANT ALL ON public.market_data_providers TO service_role;
ALTER TABLE public.market_data_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "providers readable"
  ON public.market_data_providers FOR SELECT USING (true);
CREATE POLICY "providers manageable by admin"
  ON public.market_data_providers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.market_data_providers(code, name, role, priority, supports_websocket) VALUES
  ('twelve_data','Twelve Data','primary',10,true),
  ('yahoo','Yahoo Finance','secondary',20,false),
  ('stooq','Stooq','backup',30,false)
ON CONFLICT (code) DO NOTHING;

CREATE TRIGGER trg_mdp_updated_at BEFORE UPDATE ON public.market_data_providers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Latest prices (one row per symbol/provider, upserted)
CREATE TABLE IF NOT EXISTS public.market_data_prices_latest (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  provider_code text NOT NULL,
  asset_class text,
  price numeric(20,8) NOT NULL,
  bid numeric(20,8),
  ask numeric(20,8),
  volume numeric(24,4),
  price_time timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  UNIQUE (symbol, provider_code)
);
GRANT SELECT ON public.market_data_prices_latest TO authenticated, anon;
GRANT ALL ON public.market_data_prices_latest TO service_role;
ALTER TABLE public.market_data_prices_latest ENABLE ROW LEVEL SECURITY;
CREATE POLICY "latest prices readable"
  ON public.market_data_prices_latest FOR SELECT USING (true);
CREATE POLICY "latest prices writable by admin"
  ON public.market_data_prices_latest FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_mdpl_symbol ON public.market_data_prices_latest(symbol);
CREATE INDEX IF NOT EXISTS idx_mdpl_time ON public.market_data_prices_latest(price_time DESC);

-- 3) OHLC candles
CREATE TABLE IF NOT EXISTS public.market_data_candles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  provider_code text NOT NULL,
  timeframe text NOT NULL CHECK (timeframe IN ('1m','5m','15m','30m','1H','4H','1D','1W','1M')),
  bucket_start timestamptz NOT NULL,
  open numeric(20,8) NOT NULL,
  high numeric(20,8) NOT NULL,
  low numeric(20,8) NOT NULL,
  close numeric(20,8) NOT NULL,
  volume numeric(24,4) DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (symbol, provider_code, timeframe, bucket_start)
);
GRANT SELECT ON public.market_data_candles TO authenticated, anon;
GRANT ALL ON public.market_data_candles TO service_role;
ALTER TABLE public.market_data_candles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "candles readable"
  ON public.market_data_candles FOR SELECT USING (true);
CREATE POLICY "candles writable by admin"
  ON public.market_data_candles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_mdc_symbol_tf_time
  ON public.market_data_candles(symbol, timeframe, bucket_start DESC);
CREATE INDEX IF NOT EXISTS idx_mdc_provider ON public.market_data_candles(provider_code);

CREATE TRIGGER trg_mdc_updated_at BEFORE UPDATE ON public.market_data_candles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Raw ticks (durable stream)
CREATE TABLE IF NOT EXISTS public.market_data_ticks (
  id bigserial PRIMARY KEY,
  symbol text NOT NULL,
  provider_code text NOT NULL,
  price numeric(20,8) NOT NULL,
  volume numeric(24,4),
  price_time timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_data_ticks TO authenticated;
GRANT ALL ON public.market_data_ticks TO service_role;
ALTER TABLE public.market_data_ticks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticks readable by authenticated"
  ON public.market_data_ticks FOR SELECT TO authenticated USING (true);
CREATE POLICY "ticks writable by admin"
  ON public.market_data_ticks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_mdt_symbol_time ON public.market_data_ticks(symbol, price_time DESC);
CREATE INDEX IF NOT EXISTS idx_mdt_provider_time ON public.market_data_ticks(provider_code, price_time DESC);

-- 5) Provider health & failover history
CREATE TABLE IF NOT EXISTS public.market_data_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('healthy','degraded','down','unknown')),
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  recovery_count integer NOT NULL DEFAULT 0,
  uptime_pct numeric(6,4),
  is_current_active boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.market_data_health TO authenticated, anon;
GRANT ALL ON public.market_data_health TO service_role;
ALTER TABLE public.market_data_health ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health readable"
  ON public.market_data_health FOR SELECT USING (true);
CREATE POLICY "health writable by admin"
  ON public.market_data_health FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER trg_mdh_updated_at BEFORE UPDATE ON public.market_data_health
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.market_data_failover_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_provider text,
  to_provider text NOT NULL,
  reason text,
  triggered_by uuid,
  triggered_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.market_data_failover_history TO authenticated;
GRANT ALL ON public.market_data_failover_history TO service_role;
ALTER TABLE public.market_data_failover_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "failover history readable by admin"
  ON public.market_data_failover_history FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "failover history writable by admin"
  ON public.market_data_failover_history FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_mdfh_time ON public.market_data_failover_history(triggered_at DESC);

-- 6) Latency samples
CREATE TABLE IF NOT EXISTS public.market_data_latency_samples (
  id bigserial PRIMARY KEY,
  provider_code text NOT NULL,
  channel text NOT NULL CHECK (channel IN ('api','websocket','cache','poll')),
  latency_ms integer NOT NULL,
  sampled_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
GRANT SELECT ON public.market_data_latency_samples TO authenticated;
GRANT ALL ON public.market_data_latency_samples TO service_role;
ALTER TABLE public.market_data_latency_samples ENABLE ROW LEVEL SECURITY;
CREATE POLICY "latency readable by authenticated"
  ON public.market_data_latency_samples FOR SELECT TO authenticated USING (true);
CREATE POLICY "latency writable by admin"
  ON public.market_data_latency_samples FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_mdls_provider_time
  ON public.market_data_latency_samples(provider_code, sampled_at DESC);

-- 7) Market sessions
CREATE TABLE IF NOT EXISTS public.market_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  market_code text NOT NULL,
  session_name text NOT NULL,
  timezone text NOT NULL DEFAULT 'UTC',
  opens_at time,
  closes_at time,
  weekdays int[] NOT NULL DEFAULT ARRAY[1,2,3,4,5],
  is_24x7 boolean NOT NULL DEFAULT false,
  holidays date[] DEFAULT ARRAY[]::date[],
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(market_code, session_name)
);
GRANT SELECT ON public.market_sessions TO authenticated, anon;
GRANT ALL ON public.market_sessions TO service_role;
ALTER TABLE public.market_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sessions readable"
  ON public.market_sessions FOR SELECT USING (true);
CREATE POLICY "sessions manageable by admin"
  ON public.market_sessions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

INSERT INTO public.market_sessions(market_code, session_name, timezone, opens_at, closes_at, is_24x7, weekdays) VALUES
  ('crypto','24x7','UTC',NULL,NULL,true,ARRAY[1,2,3,4,5,6,7]),
  ('forex','24x5','UTC','00:00','23:59',false,ARRAY[1,2,3,4,5]),
  ('nyse','regular','America/New_York','09:30','16:00',false,ARRAY[1,2,3,4,5]),
  ('nasdaq','regular','America/New_York','09:30','16:00',false,ARRAY[1,2,3,4,5]),
  ('gold_spot','24x5','UTC','00:00','23:59',false,ARRAY[1,2,3,4,5])
ON CONFLICT (market_code, session_name) DO NOTHING;

CREATE TRIGGER trg_ms_updated_at BEFORE UPDATE ON public.market_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- VALIDATION TRIGGER
-- =========================================================================
CREATE OR REPLACE FUNCTION public.validate_market_data_tick()
RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE
  last_price numeric;
  last_time  timestamptz;
  spike_ratio numeric := 0.5; -- reject >50% single-tick move
BEGIN
  IF NEW.price IS NULL OR NEW.price <= 0 THEN
    RAISE EXCEPTION 'invalid price: must be > 0';
  END IF;
  IF NEW.price_time IS NULL OR NEW.price_time > now() + interval '1 minute' THEN
    RAISE EXCEPTION 'timestamp anomaly';
  END IF;

  SELECT price, price_time INTO last_price, last_time
    FROM public.market_data_ticks
    WHERE symbol = NEW.symbol AND provider_code = NEW.provider_code
    ORDER BY price_time DESC LIMIT 1;

  IF last_time IS NOT NULL AND NEW.price_time < last_time THEN
    RAISE EXCEPTION 'out-of-order tick';
  END IF;
  IF last_price IS NOT NULL AND last_price > 0 THEN
    IF ABS(NEW.price - last_price) / last_price > spike_ratio THEN
      RAISE EXCEPTION 'price spike rejected (%->%)', last_price, NEW.price;
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_validate_market_tick
  BEFORE INSERT ON public.market_data_ticks
  FOR EACH ROW EXECUTE FUNCTION public.validate_market_data_tick();

-- =========================================================================
-- RPCs
-- =========================================================================

CREATE OR REPLACE FUNCTION public.md_get_active_provider()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public AS $$
  SELECT p.code
  FROM public.market_data_providers p
  LEFT JOIN public.market_data_health h ON h.provider_code = p.code
  WHERE p.is_enabled = true AND COALESCE(h.status,'unknown') <> 'down'
  ORDER BY (COALESCE(h.is_current_active,false)) DESC, p.priority ASC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.md_toggle_provider(_code text, _enabled boolean)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  UPDATE public.market_data_providers SET is_enabled = _enabled WHERE code = _code;
  RETURN jsonb_build_object('ok', true, 'code', _code, 'enabled', _enabled);
END $$;

CREATE OR REPLACE FUNCTION public.md_force_failover(_to_provider text, _reason text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  from_code text;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.market_data_providers WHERE code = _to_provider AND is_enabled) THEN
    RAISE EXCEPTION 'target provider not enabled';
  END IF;

  SELECT provider_code INTO from_code FROM public.market_data_health WHERE is_current_active = true LIMIT 1;

  UPDATE public.market_data_health SET is_current_active = false WHERE is_current_active = true;
  INSERT INTO public.market_data_health(provider_code, status, is_current_active)
  VALUES (_to_provider, 'healthy', true)
  ON CONFLICT (provider_code) DO UPDATE SET is_current_active = true, status = 'healthy';

  INSERT INTO public.market_data_failover_history(from_provider, to_provider, reason, triggered_by)
  VALUES (from_code, _to_provider, _reason, uid);

  RETURN jsonb_build_object('ok', true, 'from', from_code, 'to', _to_provider);
END $$;

CREATE OR REPLACE FUNCTION public.md_record_health(_code text, _success boolean, _latency_ms integer DEFAULT NULL)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;

  INSERT INTO public.market_data_health(provider_code, status, last_success_at, last_failure_at,
                                        failure_count, recovery_count)
  VALUES (_code,
          CASE WHEN _success THEN 'healthy' ELSE 'down' END,
          CASE WHEN _success THEN now() END,
          CASE WHEN NOT _success THEN now() END,
          CASE WHEN _success THEN 0 ELSE 1 END,
          CASE WHEN _success THEN 1 ELSE 0 END)
  ON CONFLICT (provider_code) DO UPDATE SET
    status = CASE WHEN _success THEN 'healthy' ELSE 'down' END,
    last_success_at = CASE WHEN _success THEN now() ELSE market_data_health.last_success_at END,
    last_failure_at = CASE WHEN NOT _success THEN now() ELSE market_data_health.last_failure_at END,
    failure_count   = market_data_health.failure_count + CASE WHEN _success THEN 0 ELSE 1 END,
    recovery_count  = market_data_health.recovery_count + CASE WHEN _success
                                                            AND market_data_health.status = 'down' THEN 1 ELSE 0 END;

  IF _latency_ms IS NOT NULL THEN
    INSERT INTO public.market_data_latency_samples(provider_code, channel, latency_ms)
    VALUES (_code, 'api', _latency_ms);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.md_ingest_price(
  _symbol text, _provider text, _price numeric, _price_time timestamptz,
  _volume numeric DEFAULT NULL, _asset_class text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501'; END IF;

  INSERT INTO public.market_data_ticks(symbol, provider_code, price, volume, price_time)
  VALUES (_symbol, _provider, _price, _volume, _price_time);

  INSERT INTO public.market_data_prices_latest(symbol, provider_code, asset_class, price, volume, price_time)
  VALUES (_symbol, _provider, _asset_class, _price, _volume, _price_time)
  ON CONFLICT (symbol, provider_code) DO UPDATE SET
    price = EXCLUDED.price,
    volume = COALESCE(EXCLUDED.volume, market_data_prices_latest.volume),
    price_time = EXCLUDED.price_time,
    received_at = now();

  RETURN jsonb_build_object('ok', true);
END $$;

-- =========================================================================
-- VIEWS
-- =========================================================================
CREATE OR REPLACE VIEW public.v_md_provider_health AS
SELECT p.code, p.name, p.role, p.priority, p.is_enabled,
       COALESCE(h.status,'unknown') AS status,
       h.last_success_at, h.last_failure_at,
       h.failure_count, h.recovery_count,
       h.is_current_active,
       (SELECT AVG(latency_ms) FROM public.market_data_latency_samples ls
         WHERE ls.provider_code = p.code AND ls.sampled_at > now() - interval '1 hour') AS avg_latency_1h
FROM public.market_data_providers p
LEFT JOIN public.market_data_health h ON h.provider_code = p.code;

CREATE OR REPLACE VIEW public.v_md_latest_prices AS
SELECT DISTINCT ON (l.symbol) l.symbol, l.provider_code, l.price, l.price_time, l.received_at
FROM public.market_data_prices_latest l
JOIN public.market_data_providers p ON p.code = l.provider_code AND p.is_enabled
ORDER BY l.symbol, p.priority ASC, l.received_at DESC;
