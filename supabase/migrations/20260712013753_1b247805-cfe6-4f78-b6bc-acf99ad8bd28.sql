
-- =========================================================================
-- ENTERPRISE TRADING SIMULATION ENGINE (additive; simulation-only)
-- =========================================================================

-- 1) Simulation configuration (admin-tunable defaults)
CREATE TABLE IF NOT EXISTS public.sim_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL UNIQUE DEFAULT 'default',
  default_leverage numeric(10,2) NOT NULL DEFAULT 100,
  max_leverage numeric(10,2) NOT NULL DEFAULT 500,
  default_spread_pips numeric(10,4) NOT NULL DEFAULT 2,
  slippage_pips numeric(10,4) NOT NULL DEFAULT 1,
  execution_delay_ms integer NOT NULL DEFAULT 250,
  margin_call_level numeric(6,2) NOT NULL DEFAULT 100.0,
  stop_out_level numeric(6,2) NOT NULL DEFAULT 50.0,
  commission_per_lot numeric(10,4) NOT NULL DEFAULT 0,
  swap_long numeric(10,4) NOT NULL DEFAULT 0,
  swap_short numeric(10,4) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sim_config TO authenticated;
GRANT ALL ON public.sim_config TO service_role;
ALTER TABLE public.sim_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_config readable"
  ON public.sim_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "sim_config manageable by admin"
  ON public.sim_config FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
INSERT INTO public.sim_config(scope) VALUES ('default') ON CONFLICT DO NOTHING;
CREATE TRIGGER trg_sim_config_updated_at BEFORE UPDATE ON public.sim_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Simulated account (one per competition entry)
CREATE TABLE IF NOT EXISTS public.sim_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  competition_entry_id uuid REFERENCES public.competition_entries(id) ON DELETE CASCADE,
  currency text NOT NULL DEFAULT 'USD',
  starting_balance numeric(20,2) NOT NULL DEFAULT 0,
  balance numeric(20,2) NOT NULL DEFAULT 0,
  credit numeric(20,2) NOT NULL DEFAULT 0,
  equity numeric(20,2) NOT NULL DEFAULT 0,
  floating_pnl numeric(20,2) NOT NULL DEFAULT 0,
  closed_pnl numeric(20,2) NOT NULL DEFAULT 0,
  used_margin numeric(20,2) NOT NULL DEFAULT 0,
  free_margin numeric(20,2) NOT NULL DEFAULT 0,
  margin_level numeric(20,4) NOT NULL DEFAULT 0,
  leverage numeric(10,2) NOT NULL DEFAULT 100,
  daily_profit numeric(20,2) NOT NULL DEFAULT 0,
  weekly_profit numeric(20,2) NOT NULL DEFAULT 0,
  monthly_profit numeric(20,2) NOT NULL DEFAULT 0,
  max_drawdown numeric(20,4) NOT NULL DEFAULT 0,
  peak_equity numeric(20,2) NOT NULL DEFAULT 0,
  netting_mode boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','margin_call','stopped_out','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(competition_entry_id)
);
GRANT SELECT, INSERT, UPDATE ON public.sim_accounts TO authenticated;
GRANT ALL ON public.sim_accounts TO service_role;
ALTER TABLE public.sim_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_accounts owner read"
  ON public.sim_accounts FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "sim_accounts owner insert"
  ON public.sim_accounts FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "sim_accounts admin manage"
  ON public.sim_accounts FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_sim_acct_user ON public.sim_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_acct_comp ON public.sim_accounts(competition_entry_id);
CREATE INDEX IF NOT EXISTS idx_sim_acct_status ON public.sim_accounts(status);
CREATE TRIGGER trg_sim_acct_updated_at BEFORE UPDATE ON public.sim_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Simulated orders (pending until executed)
CREATE TABLE IF NOT EXISTS public.sim_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  symbol text NOT NULL,
  order_type text NOT NULL CHECK (order_type IN ('market_buy','market_sell','buy_limit','sell_limit','buy_stop','sell_stop')),
  side text NOT NULL CHECK (side IN ('buy','sell')),
  volume numeric(20,4) NOT NULL CHECK (volume > 0),
  requested_price numeric(20,8),
  executed_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','filled','cancelled','rejected','expired')),
  reject_reason text,
  execution_delay_ms integer,
  slippage_pips numeric(10,4),
  expires_at timestamptz,
  filled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sim_orders TO authenticated;
GRANT ALL ON public.sim_orders TO service_role;
ALTER TABLE public.sim_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_orders owner read"
  ON public.sim_orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "sim_orders owner insert"
  ON public.sim_orders FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "sim_orders admin manage"
  ON public.sim_orders FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_sim_orders_user ON public.sim_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_orders_acct ON public.sim_orders(account_id);
CREATE INDEX IF NOT EXISTS idx_sim_orders_status ON public.sim_orders(status);
CREATE INDEX IF NOT EXISTS idx_sim_orders_symbol ON public.sim_orders(symbol);
CREATE TRIGGER trg_sim_orders_updated_at BEFORE UPDATE ON public.sim_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) Simulated positions (open)
CREATE TABLE IF NOT EXISTS public.sim_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL REFERENCES public.sim_accounts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  order_id uuid REFERENCES public.sim_orders(id) ON DELETE SET NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  volume numeric(20,4) NOT NULL CHECK (volume > 0),
  entry_price numeric(20,8) NOT NULL,
  current_price numeric(20,8),
  stop_loss numeric(20,8),
  take_profit numeric(20,8),
  trailing_stop_pips numeric(10,4),
  breakeven_pips numeric(10,4),
  required_margin numeric(20,2) NOT NULL DEFAULT 0,
  floating_pnl numeric(20,2) NOT NULL DEFAULT 0,
  commission numeric(20,4) NOT NULL DEFAULT 0,
  swap numeric(20,4) NOT NULL DEFAULT 0,
  spread_pips numeric(10,4),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.sim_positions TO authenticated;
GRANT ALL ON public.sim_positions TO service_role;
ALTER TABLE public.sim_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_positions owner read"
  ON public.sim_positions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "sim_positions owner insert"
  ON public.sim_positions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "sim_positions admin update"
  ON public.sim_positions FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'super_admin') OR user_id = auth.uid())
  WITH CHECK (public.has_role(auth.uid(),'super_admin') OR user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_sim_pos_user ON public.sim_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_sim_pos_acct_status ON public.sim_positions(account_id, status);
CREATE INDEX IF NOT EXISTS idx_sim_pos_symbol ON public.sim_positions(symbol);
CREATE TRIGGER trg_sim_pos_updated_at BEFORE UPDATE ON public.sim_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) Trade history (closed positions)
CREATE TABLE IF NOT EXISTS public.sim_trade_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id uuid NOT NULL,
  user_id uuid NOT NULL,
  position_id uuid,
  symbol text NOT NULL,
  side text NOT NULL,
  volume numeric(20,4) NOT NULL,
  entry_price numeric(20,8) NOT NULL,
  exit_price numeric(20,8) NOT NULL,
  entry_time timestamptz NOT NULL,
  exit_time timestamptz NOT NULL,
  spread_pips numeric(10,4),
  commission numeric(20,4) NOT NULL DEFAULT 0,
  swap numeric(20,4) NOT NULL DEFAULT 0,
  execution_delay_ms integer,
  profit numeric(20,2) NOT NULL,
  close_reason text CHECK (close_reason IN ('manual','stop_loss','take_profit','trailing_stop','margin_call','stop_out','partial','reverse','close_by','admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sim_trade_history TO authenticated;
GRANT ALL ON public.sim_trade_history TO service_role;
ALTER TABLE public.sim_trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_hist owner read"
  ON public.sim_trade_history FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_sim_hist_user_time ON public.sim_trade_history(user_id, exit_time DESC);
CREATE INDEX IF NOT EXISTS idx_sim_hist_acct ON public.sim_trade_history(account_id);
CREATE INDEX IF NOT EXISTS idx_sim_hist_symbol ON public.sim_trade_history(symbol);

-- 6) Audit log
CREATE TABLE IF NOT EXISTS public.sim_audit_log (
  id bigserial PRIMARY KEY,
  actor_id uuid,
  account_id uuid,
  event text NOT NULL CHECK (event IN ('open','modify','partial_close','close','margin_call','stop_out','rejected','validation_failure','order_placed','order_cancelled','stops_updated')),
  order_id uuid,
  position_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sim_audit_log TO authenticated;
GRANT ALL ON public.sim_audit_log TO service_role;
ALTER TABLE public.sim_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sim_audit owner read"
  ON public.sim_audit_log FOR SELECT TO authenticated
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

CREATE INDEX IF NOT EXISTS idx_sim_audit_acct ON public.sim_audit_log(account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sim_audit_event ON public.sim_audit_log(event);

-- =========================================================================
-- RPCs
-- =========================================================================

-- Get current market price for a symbol from market data platform
CREATE OR REPLACE FUNCTION public.sim_get_market_price(_symbol text)
RETURNS numeric LANGUAGE sql STABLE SET search_path=public AS $$
  SELECT price FROM public.v_md_latest_prices WHERE symbol = _symbol LIMIT 1;
$$;

-- Recompute account equity/margin from open positions
CREATE OR REPLACE FUNCTION public.sim_mark_to_market(_account_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  acct record;
  cfg record;
  pos record;
  mkt numeric;
  total_floating numeric := 0;
  total_used_margin numeric := 0;
  eq numeric;
  ml numeric;
BEGIN
  SELECT * INTO acct FROM public.sim_accounts WHERE id = _account_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'account not found'; END IF;
  SELECT * INTO cfg FROM public.sim_config WHERE scope='default' LIMIT 1;

  FOR pos IN SELECT * FROM public.sim_positions WHERE account_id=_account_id AND status='open' LOOP
    mkt := public.sim_get_market_price(pos.symbol);
    IF mkt IS NULL THEN CONTINUE; END IF;
    total_used_margin := total_used_margin + COALESCE(pos.required_margin,0);
    UPDATE public.sim_positions SET
      current_price = mkt,
      floating_pnl = ROUND(((CASE WHEN pos.side='buy' THEN (mkt - pos.entry_price) ELSE (pos.entry_price - mkt) END) * pos.volume)::numeric, 2)
    WHERE id = pos.id;
    total_floating := total_floating +
      ROUND(((CASE WHEN pos.side='buy' THEN (mkt - pos.entry_price) ELSE (pos.entry_price - mkt) END) * pos.volume)::numeric, 2);
  END LOOP;

  eq := acct.balance + acct.credit + total_floating;
  ml := CASE WHEN total_used_margin > 0 THEN ROUND((eq / total_used_margin * 100)::numeric, 4) ELSE 0 END;

  UPDATE public.sim_accounts SET
    floating_pnl = total_floating,
    used_margin  = total_used_margin,
    equity       = eq,
    free_margin  = eq - total_used_margin,
    margin_level = ml,
    peak_equity  = GREATEST(peak_equity, eq),
    max_drawdown = GREATEST(max_drawdown,
                            CASE WHEN peak_equity>0 THEN ROUND(((peak_equity-eq)/peak_equity*100)::numeric,4) ELSE 0 END),
    status = CASE
      WHEN total_used_margin > 0 AND ml <= cfg.stop_out_level THEN 'stopped_out'
      WHEN total_used_margin > 0 AND ml <= cfg.margin_call_level THEN 'margin_call'
      ELSE 'active' END
  WHERE id = _account_id;

  RETURN jsonb_build_object('equity',eq,'floating',total_floating,'used_margin',total_used_margin,'margin_level',ml);
END $$;

-- Place order (market or pending)
CREATE OR REPLACE FUNCTION public.sim_place_order(
  _account_id uuid, _symbol text, _order_type text, _volume numeric,
  _requested_price numeric DEFAULT NULL,
  _stop_loss numeric DEFAULT NULL, _take_profit numeric DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  acct record; cfg record;
  side_txt text;
  mkt numeric;
  fill_price numeric;
  slip numeric;
  spread numeric;
  req_margin numeric;
  order_id uuid;
  pos_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
  IF _volume IS NULL OR _volume <= 0 THEN RAISE EXCEPTION 'Invalid volume'; END IF;

  SELECT * INTO acct FROM public.sim_accounts WHERE id=_account_id FOR UPDATE;
  IF NOT FOUND OR acct.user_id <> uid THEN RAISE EXCEPTION 'account not found'; END IF;
  IF acct.status IN ('stopped_out','closed') THEN RAISE EXCEPTION 'account not tradable: %', acct.status; END IF;

  SELECT * INTO cfg FROM public.sim_config WHERE scope='default';
  side_txt := CASE WHEN _order_type IN ('market_buy','buy_limit','buy_stop') THEN 'buy' ELSE 'sell' END;

  mkt := public.sim_get_market_price(_symbol);
  IF mkt IS NULL THEN
    INSERT INTO public.sim_orders(account_id,user_id,symbol,order_type,side,volume,requested_price,status,reject_reason)
    VALUES (_account_id,uid,_symbol,_order_type,side_txt,_volume,_requested_price,'rejected','market_closed')
    RETURNING id INTO order_id;
    INSERT INTO public.sim_audit_log(actor_id,account_id,event,order_id,payload)
    VALUES (uid,_account_id,'rejected',order_id,jsonb_build_object('reason','market_closed'));
    RETURN jsonb_build_object('ok',false,'reason','market_closed','order_id',order_id);
  END IF;

  -- Market execution now; pending orders stay pending
  IF _order_type IN ('market_buy','market_sell') THEN
    spread := cfg.default_spread_pips * 0.0001;
    slip := cfg.slippage_pips * 0.0001;
    fill_price := CASE WHEN side_txt='buy' THEN mkt + spread + slip ELSE mkt - spread - slip END;
    req_margin := ROUND((_volume * fill_price / GREATEST(acct.leverage,1))::numeric, 2);

    IF req_margin > acct.free_margin AND req_margin > (acct.balance + acct.credit - acct.used_margin) THEN
      INSERT INTO public.sim_orders(account_id,user_id,symbol,order_type,side,volume,requested_price,executed_price,status,reject_reason)
      VALUES (_account_id,uid,_symbol,_order_type,side_txt,_volume,_requested_price,fill_price,'rejected','insufficient_margin')
      RETURNING id INTO order_id;
      INSERT INTO public.sim_audit_log(actor_id,account_id,event,order_id,payload)
      VALUES (uid,_account_id,'rejected',order_id,jsonb_build_object('reason','insufficient_margin','required',req_margin));
      RETURN jsonb_build_object('ok',false,'reason','insufficient_margin');
    END IF;

    INSERT INTO public.sim_orders(account_id,user_id,symbol,order_type,side,volume,requested_price,executed_price,stop_loss,take_profit,status,execution_delay_ms,slippage_pips,filled_at)
    VALUES (_account_id,uid,_symbol,_order_type,side_txt,_volume,_requested_price,fill_price,_stop_loss,_take_profit,'filled',cfg.execution_delay_ms,cfg.slippage_pips,now())
    RETURNING id INTO order_id;

    INSERT INTO public.sim_positions(account_id,user_id,order_id,symbol,side,volume,entry_price,current_price,stop_loss,take_profit,required_margin,commission,spread_pips)
    VALUES (_account_id,uid,order_id,_symbol,side_txt,_volume,fill_price,fill_price,_stop_loss,_take_profit,req_margin,cfg.commission_per_lot*_volume,cfg.default_spread_pips)
    RETURNING id INTO pos_id;

    INSERT INTO public.sim_audit_log(actor_id,account_id,event,order_id,position_id,payload)
    VALUES (uid,_account_id,'open',order_id,pos_id,jsonb_build_object('symbol',_symbol,'side',side_txt,'volume',_volume,'price',fill_price));

    PERFORM public.sim_mark_to_market(_account_id);
    RETURN jsonb_build_object('ok',true,'order_id',order_id,'position_id',pos_id,'fill_price',fill_price);
  ELSE
    INSERT INTO public.sim_orders(account_id,user_id,symbol,order_type,side,volume,requested_price,stop_loss,take_profit,status)
    VALUES (_account_id,uid,_symbol,_order_type,side_txt,_volume,_requested_price,_stop_loss,_take_profit,'pending')
    RETURNING id INTO order_id;
    INSERT INTO public.sim_audit_log(actor_id,account_id,event,order_id,payload)
    VALUES (uid,_account_id,'order_placed',order_id,jsonb_build_object('type',_order_type,'price',_requested_price));
    RETURN jsonb_build_object('ok',true,'order_id',order_id,'status','pending');
  END IF;
END $$;

-- Update SL/TP/trailing
CREATE OR REPLACE FUNCTION public.sim_update_stops(_position_id uuid, _sl numeric DEFAULT NULL, _tp numeric DEFAULT NULL, _trailing_pips numeric DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE uid uuid := auth.uid(); pos record;
BEGIN
  SELECT * INTO pos FROM public.sim_positions WHERE id=_position_id FOR UPDATE;
  IF NOT FOUND OR (pos.user_id<>uid AND NOT public.has_role(uid,'super_admin')) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.sim_positions SET
    stop_loss = COALESCE(_sl, stop_loss),
    take_profit = COALESCE(_tp, take_profit),
    trailing_stop_pips = COALESCE(_trailing_pips, trailing_stop_pips)
   WHERE id=_position_id;
  INSERT INTO public.sim_audit_log(actor_id,account_id,event,position_id,payload)
  VALUES (uid,pos.account_id,'stops_updated',_position_id,jsonb_build_object('sl',_sl,'tp',_tp,'trailing',_trailing_pips));
  RETURN jsonb_build_object('ok',true);
END $$;

-- Close position (full or partial)
CREATE OR REPLACE FUNCTION public.sim_close_position(_position_id uuid, _volume numeric DEFAULT NULL, _reason text DEFAULT 'manual')
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  uid uuid := auth.uid();
  pos record; cfg record;
  mkt numeric; exit_price numeric;
  close_vol numeric;
  profit numeric;
  is_partial boolean;
BEGIN
  SELECT * INTO pos FROM public.sim_positions WHERE id=_position_id FOR UPDATE;
  IF NOT FOUND OR (pos.user_id<>uid AND NOT public.has_role(uid,'super_admin')) THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF pos.status<>'open' THEN RAISE EXCEPTION 'position not open'; END IF;

  SELECT * INTO cfg FROM public.sim_config WHERE scope='default';
  mkt := public.sim_get_market_price(pos.symbol);
  IF mkt IS NULL THEN RAISE EXCEPTION 'market_closed'; END IF;

  exit_price := CASE WHEN pos.side='buy' THEN mkt - cfg.default_spread_pips*0.0001 ELSE mkt + cfg.default_spread_pips*0.0001 END;
  close_vol := LEAST(COALESCE(_volume, pos.volume), pos.volume);
  is_partial := close_vol < pos.volume;
  profit := ROUND(((CASE WHEN pos.side='buy' THEN (exit_price - pos.entry_price) ELSE (pos.entry_price - exit_price) END) * close_vol)::numeric, 2);

  INSERT INTO public.sim_trade_history(account_id,user_id,position_id,symbol,side,volume,entry_price,exit_price,entry_time,exit_time,spread_pips,commission,swap,profit,close_reason)
  VALUES (pos.account_id,pos.user_id,pos.id,pos.symbol,pos.side,close_vol,pos.entry_price,exit_price,pos.opened_at,now(),cfg.default_spread_pips,pos.commission*(close_vol/pos.volume),pos.swap*(close_vol/pos.volume),profit,COALESCE(_reason,'manual'));

  IF is_partial THEN
    UPDATE public.sim_positions SET volume = volume - close_vol, required_margin = required_margin*((volume-close_vol)/volume) WHERE id=pos.id;
    INSERT INTO public.sim_audit_log(actor_id,account_id,event,position_id,payload)
    VALUES (uid,pos.account_id,'partial_close',pos.id,jsonb_build_object('volume',close_vol,'profit',profit,'exit',exit_price));
  ELSE
    UPDATE public.sim_positions SET status='closed', current_price=exit_price, floating_pnl=0 WHERE id=pos.id;
    INSERT INTO public.sim_audit_log(actor_id,account_id,event,position_id,payload)
    VALUES (uid,pos.account_id,'close',pos.id,jsonb_build_object('volume',close_vol,'profit',profit,'exit',exit_price,'reason',_reason));
  END IF;

  UPDATE public.sim_accounts SET balance = balance + profit, closed_pnl = closed_pnl + profit WHERE id = pos.account_id;
  PERFORM public.sim_mark_to_market(pos.account_id);

  RETURN jsonb_build_object('ok',true,'profit',profit,'exit_price',exit_price,'partial',is_partial);
END $$;

-- =========================================================================
-- VIEWS
-- =========================================================================
CREATE OR REPLACE VIEW public.v_sim_competition_stats AS
SELECT
  a.id AS account_id,
  a.user_id,
  a.competition_entry_id,
  a.equity,
  a.starting_balance,
  a.max_drawdown,
  CASE WHEN a.starting_balance>0
       THEN ROUND(((a.equity - a.starting_balance)/a.starting_balance*100)::numeric, 4)
       ELSE 0 END AS return_pct,
  (SELECT COUNT(*) FROM public.sim_positions p WHERE p.account_id=a.id AND p.status='open') AS open_trades,
  (SELECT COUNT(*) FROM public.sim_trade_history h WHERE h.account_id=a.id) AS closed_trades,
  (SELECT CASE WHEN COUNT(*)>0
               THEN ROUND((COUNT(*) FILTER (WHERE profit>0)::numeric/COUNT(*)*100), 2)
               ELSE 0 END
     FROM public.sim_trade_history h WHERE h.account_id=a.id) AS win_rate,
  RANK() OVER (ORDER BY a.equity DESC) AS rank
FROM public.sim_accounts a
WHERE a.status IN ('active','margin_call');
