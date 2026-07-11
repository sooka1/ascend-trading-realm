
-- =========================================
-- COPY TRADING SYSTEM
-- =========================================

-- 1) copy_masters
CREATE TABLE public.copy_masters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  bio text,
  avatar_url text,
  risk_level text NOT NULL DEFAULT 'medium' CHECK (risk_level IN ('low','medium','high')),
  min_capital numeric NOT NULL DEFAULT 100 CHECK (min_capital >= 0),
  performance_fee_pct numeric NOT NULL DEFAULT 20 CHECK (performance_fee_pct >= 0 AND performance_fee_pct <= 100),
  total_return_pct numeric NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.copy_masters TO anon, authenticated;
GRANT ALL ON public.copy_masters TO service_role;
ALTER TABLE public.copy_masters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read active masters" ON public.copy_masters
  FOR SELECT USING (is_active = true OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_admin manage masters" ON public.copy_masters
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_copy_masters_updated_at BEFORE UPDATE ON public.copy_masters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) copy_subscriptions
CREATE TABLE public.copy_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  master_id uuid NOT NULL REFERENCES public.copy_masters(id) ON DELETE RESTRICT,
  allocated_amount numeric NOT NULL CHECK (allocated_amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  copy_ratio numeric NOT NULL DEFAULT 1 CHECK (copy_ratio > 0 AND copy_ratio <= 10),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','closed')),
  started_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_copy_subs_user ON public.copy_subscriptions(user_id);
CREATE INDEX idx_copy_subs_master ON public.copy_subscriptions(master_id);
CREATE INDEX idx_copy_subs_status ON public.copy_subscriptions(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.copy_subscriptions TO authenticated;
GRANT ALL ON public.copy_subscriptions TO service_role;
ALTER TABLE public.copy_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own copy subs" ON public.copy_subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "users manage own copy subs" ON public.copy_subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "super_admin full copy subs" ON public.copy_subscriptions
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_copy_subs_updated_at BEFORE UPDATE ON public.copy_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent duplicate subscriptions in short window
CREATE OR REPLACE FUNCTION public.prevent_duplicate_copy_sub()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.copy_subscriptions
    WHERE user_id = NEW.user_id AND master_id = NEW.master_id
      AND status IN ('active','paused')
      AND created_at > now() - interval '10 seconds'
      AND id <> NEW.id
  ) THEN
    RAISE EXCEPTION 'Duplicate copy subscription blocked' USING ERRCODE = 'unique_violation';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_prevent_duplicate_copy_sub
  BEFORE INSERT ON public.copy_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_copy_sub();

-- 3) copy_master_trades
CREATE TABLE public.copy_master_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id uuid NOT NULL REFERENCES public.copy_masters(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  entry_price numeric NOT NULL CHECK (entry_price > 0),
  exit_price numeric CHECK (exit_price IS NULL OR exit_price > 0),
  volume numeric NOT NULL CHECK (volume > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed','cancelled')),
  pnl_pct numeric,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_master_trades_master ON public.copy_master_trades(master_id);
CREATE INDEX idx_master_trades_status ON public.copy_master_trades(status);

GRANT SELECT ON public.copy_master_trades TO authenticated;
GRANT ALL ON public.copy_master_trades TO service_role;
ALTER TABLE public.copy_master_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "subscribers read master trades" ON public.copy_master_trades
  FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(),'super_admin') OR
    EXISTS (
      SELECT 1 FROM public.copy_subscriptions s
      WHERE s.master_id = copy_master_trades.master_id
        AND s.user_id = auth.uid()
        AND s.status IN ('active','paused','closed')
    )
  );
CREATE POLICY "super_admin manage master trades" ON public.copy_master_trades
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_master_trades_updated_at BEFORE UPDATE ON public.copy_master_trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4) copy_trade_fills
CREATE TABLE public.copy_trade_fills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_trade_id uuid NOT NULL REFERENCES public.copy_master_trades(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.copy_subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  allocated_amount numeric NOT NULL,
  pnl numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (master_trade_id, subscription_id)
);

CREATE INDEX idx_fills_user ON public.copy_trade_fills(user_id);
CREATE INDEX idx_fills_sub ON public.copy_trade_fills(subscription_id);

GRANT SELECT ON public.copy_trade_fills TO authenticated;
GRANT ALL ON public.copy_trade_fills TO service_role;
ALTER TABLE public.copy_trade_fills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own fills" ON public.copy_trade_fills
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "super_admin manage fills" ON public.copy_trade_fills
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

CREATE TRIGGER update_fills_updated_at BEFORE UPDATE ON public.copy_trade_fills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) copy_audit_log
CREATE TABLE public.copy_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  target_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_copy_audit_created ON public.copy_audit_log(created_at DESC);

GRANT SELECT, INSERT ON public.copy_audit_log TO authenticated;
GRANT ALL ON public.copy_audit_log TO service_role;
ALTER TABLE public.copy_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin read audit" ON public.copy_audit_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "system insert audit" ON public.copy_audit_log
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));

-- =========================================
-- FUNCTIONS
-- =========================================

-- subscribe_to_master: check available balance and create subscription
CREATE OR REPLACE FUNCTION public.subscribe_to_master(_master_id uuid, _amount numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  m record;
  approved_in numeric;
  approved_out numeric;
  committed_sub numeric;
  committed_comp numeric;
  committed_copy numeric;
  profits numeric;
  available numeric;
  new_id uuid;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated' USING ERRCODE='28000'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'Invalid amount' USING ERRCODE='22023'; END IF;

  SELECT * INTO m FROM public.copy_masters WHERE id = _master_id AND is_active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'Master not found or inactive'; END IF;
  IF _amount < m.min_capital THEN
    RAISE EXCEPTION 'Amount below minimum capital (%)', m.min_capital USING ERRCODE='check_violation';
  END IF;

  SELECT COALESCE(SUM(amount),0) INTO approved_in
    FROM public.deposits WHERE user_id = uid AND status = 'approved';
  SELECT COALESCE(SUM(amount),0) INTO approved_out
    FROM public.withdrawals WHERE user_id = uid AND status IN ('pending','approved','completed');
  SELECT COALESCE(SUM(amount),0) INTO committed_sub
    FROM public.subscriptions WHERE user_id = uid AND status IN ('active','pending');
  SELECT COALESCE(SUM(tier_fee),0) INTO committed_comp
    FROM public.competition_entries WHERE user_id = uid AND status IN ('active','pending');
  SELECT COALESCE(SUM(allocated_amount),0) INTO committed_copy
    FROM public.copy_subscriptions WHERE user_id = uid AND status IN ('active','paused');
  SELECT COALESCE(SUM(amount),0) INTO profits
    FROM public.profit_distributions WHERE user_id = uid;

  available := (approved_in + profits - approved_out) - committed_sub - committed_comp - committed_copy;

  IF available < _amount THEN
    INSERT INTO public.copy_audit_log(actor_id, target_user_id, event, payload)
    VALUES (uid, uid, 'subscribe_insufficient',
            jsonb_build_object('master_id',_master_id,'requested',_amount,'available',available));
    RETURN jsonb_build_object('ok', false, 'needs_deposit', true,
      'available', available, 'requested', _amount, 'shortfall', _amount - available);
  END IF;

  INSERT INTO public.copy_subscriptions(user_id, master_id, allocated_amount)
  VALUES (uid, _master_id, _amount) RETURNING id INTO new_id;

  INSERT INTO public.copy_audit_log(actor_id, target_user_id, event, payload)
  VALUES (uid, uid, 'subscribe', jsonb_build_object('subscription_id',new_id,'master_id',_master_id,'amount',_amount));

  INSERT INTO public.notifications(user_id, title, body)
  VALUES (uid, 'تفعيل نسخ الصفقات',
          concat('تم تخصيص $', to_char(_amount,'FM999999990.00'), ' لنسخ صفقات ', m.name));

  RETURN jsonb_build_object('ok', true, 'subscription_id', new_id);
END;
$$;

-- close_master_trade: distribute pnl to all subscriptions
CREATE OR REPLACE FUNCTION public.close_master_trade(_trade_id uuid, _exit_price numeric)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  t record;
  s record;
  pnl_pct_val numeric;
  fill_pnl numeric;
  affected int := 0;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  IF _exit_price IS NULL OR _exit_price <= 0 THEN RAISE EXCEPTION 'Invalid exit price'; END IF;

  SELECT * INTO t FROM public.copy_master_trades WHERE id = _trade_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Trade not found'; END IF;
  IF t.status <> 'open' THEN RAISE EXCEPTION 'Trade not open'; END IF;

  pnl_pct_val := CASE WHEN t.side = 'buy'
    THEN (_exit_price - t.entry_price) / t.entry_price
    ELSE (t.entry_price - _exit_price) / t.entry_price
  END;

  UPDATE public.copy_master_trades
    SET status='closed', exit_price=_exit_price, closed_at=now(), pnl_pct=pnl_pct_val*100
    WHERE id = _trade_id;

  FOR s IN
    SELECT * FROM public.copy_subscriptions
    WHERE master_id = t.master_id AND status = 'active' FOR UPDATE
  LOOP
    fill_pnl := ROUND((s.allocated_amount * s.copy_ratio * pnl_pct_val)::numeric, 2);

    INSERT INTO public.copy_trade_fills(master_trade_id, subscription_id, user_id, allocated_amount, pnl, status)
    VALUES (_trade_id, s.id, s.user_id, s.allocated_amount, fill_pnl, 'closed')
    ON CONFLICT (master_trade_id, subscription_id) DO UPDATE
      SET pnl = EXCLUDED.pnl, status = 'closed';

    UPDATE public.copy_subscriptions
      SET allocated_amount = GREATEST(0, allocated_amount + fill_pnl)
      WHERE id = s.id;

    INSERT INTO public.notifications(user_id, title, body)
    VALUES (s.user_id,
            CASE WHEN fill_pnl >= 0 THEN 'ربح من نسخ الصفقات' ELSE 'خسارة من نسخ الصفقات' END,
            concat(t.symbol,' ',t.side,': ', CASE WHEN fill_pnl>=0 THEN '+' ELSE '' END,
                   '$', to_char(fill_pnl,'FM999999990.00')));

    affected := affected + 1;
  END LOOP;

  INSERT INTO public.copy_audit_log(actor_id, event, payload)
  VALUES (uid, 'close_master_trade',
          jsonb_build_object('trade_id',_trade_id,'exit_price',_exit_price,'pnl_pct',pnl_pct_val*100,'affected',affected));

  RETURN jsonb_build_object('ok', true, 'affected', affected, 'pnl_pct', pnl_pct_val*100);
END;
$$;

-- admin_adjust_balance: manual balance adjustment via a synthetic deposit/withdrawal row
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_user_id uuid, _delta numeric, _reason text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  reason text := COALESCE(NULLIF(trim(_reason),''), NULL);
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  IF _delta IS NULL OR _delta = 0 THEN RAISE EXCEPTION 'Delta must be non-zero'; END IF;
  IF reason IS NULL THEN RAISE EXCEPTION 'Reason required'; END IF;

  IF _delta > 0 THEN
    INSERT INTO public.deposits(user_id, amount, currency, status, method, notes)
    VALUES (_user_id, _delta, 'USD', 'approved', 'admin_adjust', reason);
  ELSE
    INSERT INTO public.withdrawals(user_id, amount, currency, status, method, notes)
    VALUES (_user_id, ABS(_delta), 'USD', 'approved', 'admin_adjust', reason);
  END IF;

  INSERT INTO public.copy_audit_log(actor_id, target_user_id, event, payload)
  VALUES (uid, _user_id, 'admin_adjust_balance',
          jsonb_build_object('delta',_delta,'reason',reason));

  INSERT INTO public.notifications(user_id, title, body)
  VALUES (_user_id, 'تعديل رصيد يدوي',
          concat(CASE WHEN _delta>=0 THEN '+' ELSE '' END,'$', to_char(_delta,'FM999999990.00'),' — ',reason));

  RETURN jsonb_build_object('ok', true);
END;
$$;
