
-- ========== trading_accounts ==========
CREATE TABLE public.trading_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance numeric(18,2) NOT NULL DEFAULT 100000,
  currency text NOT NULL DEFAULT 'USD',
  leverage integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_accounts TO authenticated;
GRANT ALL ON public.trading_accounts TO service_role;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trading account" ON public.trading_accounts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_trading_accounts_updated BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ========== instruments (public read) ==========
CREATE TABLE public.instruments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL UNIQUE,
  display_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('forex','metals','crypto','stocks','indices','commodities')),
  base_currency text,
  quote_currency text,
  contract_size numeric(18,4) NOT NULL DEFAULT 1,
  min_lot numeric(10,4) NOT NULL DEFAULT 0.01,
  max_lot numeric(10,4) NOT NULL DEFAULT 100,
  lot_step numeric(10,4) NOT NULL DEFAULT 0.01,
  price_precision integer NOT NULL DEFAULT 5,
  pip_size numeric(12,8) NOT NULL DEFAULT 0.0001,
  margin_rate numeric(6,4) NOT NULL DEFAULT 0.01,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.instruments TO anon, authenticated;
GRANT ALL ON public.instruments TO service_role;
ALTER TABLE public.instruments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "instruments readable by all" ON public.instruments FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.instruments (symbol, display_name, category, base_currency, quote_currency, contract_size, price_precision, pip_size, margin_rate) VALUES
  ('XAUUSD','Gold vs USD','metals','XAU','USD',100,2,0.01,0.01),
  ('XAGUSD','Silver vs USD','metals','XAG','USD',5000,3,0.001,0.02),
  ('EURUSD','Euro vs USD','forex','EUR','USD',100000,5,0.0001,0.01),
  ('GBPUSD','Pound vs USD','forex','GBP','USD',100000,5,0.0001,0.01),
  ('USDJPY','USD vs Yen','forex','USD','JPY',100000,3,0.01,0.01),
  ('BTCUSD','Bitcoin vs USD','crypto','BTC','USD',1,2,0.01,0.05),
  ('ETHUSD','Ethereum vs USD','crypto','ETH','USD',1,2,0.01,0.05),
  ('US500','S&P 500 Index','indices',NULL,'USD',1,2,0.01,0.05),
  ('NAS100','Nasdaq 100','indices',NULL,'USD',1,2,0.01,0.05),
  ('WTI','Crude Oil WTI','commodities',NULL,'USD',1000,2,0.01,0.05);

-- ========== watchlists ==========
CREATE TABLE public.watchlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'Default',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlists TO authenticated;
GRANT ALL ON public.watchlists TO service_role;
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watchlists" ON public.watchlists FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.watchlist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  watchlist_id uuid NOT NULL REFERENCES public.watchlists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (watchlist_id, symbol)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist_items TO authenticated;
GRANT ALL ON public.watchlist_items TO service_role;
ALTER TABLE public.watchlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watchlist items" ON public.watchlist_items FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== trading_orders (pending + executed) ==========
CREATE TABLE public.trading_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  order_type text NOT NULL CHECK (order_type IN ('market','limit','stop','stop_limit')),
  volume numeric(12,4) NOT NULL,
  price numeric(18,8),
  stop_price numeric(18,8),
  take_profit numeric(18,8),
  stop_loss numeric(18,8),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','filled','cancelled','rejected')),
  filled_price numeric(18,8),
  filled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_orders TO authenticated;
GRANT ALL ON public.trading_orders TO service_role;
ALTER TABLE public.trading_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trading orders" ON public.trading_orders FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_trading_orders_updated BEFORE UPDATE ON public.trading_orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_trading_orders_user_status ON public.trading_orders(user_id, status);

-- ========== trading_positions ==========
CREATE TABLE public.trading_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  volume numeric(12,4) NOT NULL,
  entry_price numeric(18,8) NOT NULL,
  take_profit numeric(18,8),
  stop_loss numeric(18,8),
  swap numeric(18,4) NOT NULL DEFAULT 0,
  commission numeric(18,4) NOT NULL DEFAULT 0,
  opened_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trading_positions TO authenticated;
GRANT ALL ON public.trading_positions TO service_role;
ALTER TABLE public.trading_positions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trading positions" ON public.trading_positions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_trading_positions_updated BEFORE UPDATE ON public.trading_positions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_trading_positions_user ON public.trading_positions(user_id);

-- ========== trading_history ==========
CREATE TABLE public.trading_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.trading_accounts(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  side text NOT NULL,
  volume numeric(12,4) NOT NULL,
  entry_price numeric(18,8) NOT NULL,
  close_price numeric(18,8) NOT NULL,
  profit numeric(18,4) NOT NULL,
  swap numeric(18,4) NOT NULL DEFAULT 0,
  commission numeric(18,4) NOT NULL DEFAULT 0,
  opened_at timestamptz NOT NULL,
  closed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.trading_history TO authenticated;
GRANT ALL ON public.trading_history TO service_role;
ALTER TABLE public.trading_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trading history" ON public.trading_history FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "insert own trading history" ON public.trading_history FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_trading_history_user_closed ON public.trading_history(user_id, closed_at DESC);

-- ========== price_alerts ==========
CREATE TABLE public.price_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('above','below')),
  target_price numeric(18,8) NOT NULL,
  triggered boolean NOT NULL DEFAULT false,
  triggered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.price_alerts TO authenticated;
GRANT ALL ON public.price_alerts TO service_role;
ALTER TABLE public.price_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own price alerts" ON public.price_alerts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ========== trading_audit_log ==========
CREATE TABLE public.trading_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.trading_audit_log TO authenticated;
GRANT ALL ON public.trading_audit_log TO service_role;
ALTER TABLE public.trading_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own audit log read" ON public.trading_audit_log FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "own audit log insert" ON public.trading_audit_log FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_trading_audit_user ON public.trading_audit_log(user_id, created_at DESC);
