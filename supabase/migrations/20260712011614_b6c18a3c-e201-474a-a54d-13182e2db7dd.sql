
-- 1. PACKAGE VERSIONING
CREATE TABLE IF NOT EXISTS public.package_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  effective_date date NOT NULL DEFAULT current_date,
  asset_allocation jsonb NOT NULL DEFAULT '{}'::jsonb,
  investment_strategy text,
  risk_level text,
  benchmark_id uuid,
  management_fee_pct numeric(6,3) DEFAULT 0,
  performance_fee_pct numeric(6,3) DEFAULT 0,
  description text,
  created_by uuid REFERENCES auth.users(id),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  is_current boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, version_number)
);
GRANT SELECT ON public.package_versions TO authenticated;
GRANT ALL ON public.package_versions TO service_role;
ALTER TABLE public.package_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "package_versions read authenticated" ON public.package_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "package_versions admin write" ON public.package_versions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_package_versions_pkg ON public.package_versions(package_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_package_versions_current ON public.package_versions(package_id) WHERE is_current;
CREATE TRIGGER trg_package_versions_updated BEFORE UPDATE ON public.package_versions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS package_version_id uuid REFERENCES public.package_versions(id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pkg_version ON public.subscriptions(package_version_id);

CREATE OR REPLACE FUNCTION public.ensure_package_v1()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.package_versions (package_id, version_number, effective_date, is_current)
  VALUES (NEW.id, 1, current_date, true) ON CONFLICT (package_id, version_number) DO NOTHING;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS trg_packages_ensure_v1 ON public.packages;
CREATE TRIGGER trg_packages_ensure_v1 AFTER INSERT ON public.packages
  FOR EACH ROW EXECUTE FUNCTION public.ensure_package_v1();
INSERT INTO public.package_versions (package_id, version_number, effective_date, is_current)
SELECT id, 1, COALESCE(created_at::date, current_date), true FROM public.packages
ON CONFLICT (package_id, version_number) DO NOTHING;

-- 2. BENCHMARKS
CREATE TABLE IF NOT EXISTS public.benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'index',
  currency text NOT NULL DEFAULT 'USD',
  description text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.benchmarks TO authenticated;
GRANT ALL ON public.benchmarks TO service_role;
ALTER TABLE public.benchmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "benchmarks read authenticated" ON public.benchmarks FOR SELECT TO authenticated USING (true);
CREATE POLICY "benchmarks admin write" ON public.benchmarks FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE TRIGGER trg_benchmarks_updated BEFORE UPDATE ON public.benchmarks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.benchmarks (code, name, kind) VALUES
  ('GOLD','Gold Spot','commodity'),
  ('SPX','S&P 500','equity_index'),
  ('NDX','NASDAQ 100','equity_index'),
  ('MSCI_WORLD','MSCI World','equity_index')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.benchmark_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  benchmark_id uuid NOT NULL REFERENCES public.benchmarks(id) ON DELETE CASCADE,
  as_of_date date NOT NULL,
  close_value numeric(20,6) NOT NULL,
  return_pct numeric(12,6),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (benchmark_id, as_of_date)
);
GRANT SELECT ON public.benchmark_prices TO authenticated;
GRANT ALL ON public.benchmark_prices TO service_role;
ALTER TABLE public.benchmark_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "benchmark_prices read authenticated" ON public.benchmark_prices FOR SELECT TO authenticated USING (true);
CREATE POLICY "benchmark_prices admin write" ON public.benchmark_prices FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_benchmark_prices_bench_date ON public.benchmark_prices(benchmark_id, as_of_date DESC);

-- 3. RISK METRICS
CREATE TABLE IF NOT EXISTS public.portfolio_risk_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  package_version_id uuid REFERENCES public.package_versions(id),
  period_start date NOT NULL,
  period_end date NOT NULL,
  max_drawdown_pct numeric(10,4),
  volatility_pct numeric(10,4),
  sharpe_ratio numeric(10,4),
  sortino_ratio numeric(10,4),
  calmar_ratio numeric(10,4),
  profit_consistency numeric(6,4),
  monthly_win_ratio numeric(6,4),
  risk_score integer CHECK (risk_score BETWEEN 0 AND 100),
  stability_score integer CHECK (stability_score BETWEEN 0 AND 100),
  portfolio_return_pct numeric(12,4),
  benchmark_id uuid REFERENCES public.benchmarks(id),
  benchmark_return_pct numeric(12,4),
  tracking_difference_pct numeric(12,4),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, period_start, period_end)
);
GRANT SELECT ON public.portfolio_risk_metrics TO authenticated;
GRANT ALL ON public.portfolio_risk_metrics TO service_role;
ALTER TABLE public.portfolio_risk_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "risk_metrics read authenticated" ON public.portfolio_risk_metrics FOR SELECT TO authenticated USING (true);
CREATE POLICY "risk_metrics admin write" ON public.portfolio_risk_metrics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_risk_metrics_pkg_period ON public.portfolio_risk_metrics(package_id, period_end DESC);
CREATE TRIGGER trg_risk_metrics_updated BEFORE UPDATE ON public.portfolio_risk_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. HEALTH SCORES
CREATE TABLE IF NOT EXISTS public.portfolio_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  as_of_date date NOT NULL DEFAULT current_date,
  overall_score integer NOT NULL CHECK (overall_score BETWEEN 0 AND 100),
  performance_score integer CHECK (performance_score BETWEEN 0 AND 100),
  risk_score integer CHECK (risk_score BETWEEN 0 AND 100),
  consistency_score integer CHECK (consistency_score BETWEEN 0 AND 100),
  drawdown_score integer CHECK (drawdown_score BETWEEN 0 AND 100),
  capital_preservation_score integer CHECK (capital_preservation_score BETWEEN 0 AND 100),
  satisfaction_score integer CHECK (satisfaction_score BETWEEN 0 AND 100),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, as_of_date)
);
GRANT SELECT ON public.portfolio_health_scores TO authenticated;
GRANT ALL ON public.portfolio_health_scores TO service_role;
ALTER TABLE public.portfolio_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_scores read authenticated" ON public.portfolio_health_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "health_scores admin write" ON public.portfolio_health_scores FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin')) WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE INDEX IF NOT EXISTS idx_health_scores_pkg_date ON public.portfolio_health_scores(package_id, as_of_date DESC);
CREATE TRIGGER trg_health_scores_updated BEFORE UPDATE ON public.portfolio_health_scores
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. INVESTOR ANALYTICS VIEW
CREATE OR REPLACE VIEW public.v_investor_analytics WITH (security_invoker = on) AS
SELECT
  p.id AS user_id, p.email, p.display_name, p.created_at AS joined_at,
  EXTRACT(EPOCH FROM (now() - p.created_at))/86400 AS investment_age_days,
  COALESCE((SELECT SUM(amount) FROM public.deposits d WHERE d.user_id=p.id AND d.status='approved'),0) AS total_deposits,
  COALESCE((SELECT SUM(amount) FROM public.withdrawals w WHERE w.user_id=p.id AND w.status IN ('approved','completed')),0) AS total_withdrawals,
  COALESCE((SELECT SUM(amount) FROM public.deposits d WHERE d.user_id=p.id AND d.status='approved'),0)
    - COALESCE((SELECT SUM(amount) FROM public.withdrawals w WHERE w.user_id=p.id AND w.status IN ('approved','completed')),0) AS net_investment,
  COALESCE((SELECT SUM(amount) FROM public.profit_distributions pd WHERE pd.user_id=p.id),0) AS total_profit,
  COALESCE((SELECT SUM(fee_amount) FROM public.fee_events fe WHERE fe.user_id=p.id),0) AS total_fees,
  COALESCE((SELECT SUM(amount) FROM public.subscriptions s WHERE s.user_id=p.id AND s.status='active'),0) AS active_capital
FROM public.profiles p;
GRANT SELECT ON public.v_investor_analytics TO authenticated;

-- 6. ADMIN VIEWS
CREATE OR REPLACE VIEW public.v_admin_aum_dashboard WITH (security_invoker = on) AS
SELECT
  (SELECT COALESCE(SUM(amount),0) FROM public.subscriptions WHERE status='active') AS aum,
  (SELECT COUNT(DISTINCT user_id) FROM public.subscriptions WHERE status='active') AS active_investors,
  (SELECT COALESCE(SUM(amount),0) FROM public.deposits
     WHERE status='approved' AND created_at >= date_trunc('month', now())) AS monthly_inflows,
  (SELECT COALESCE(SUM(amount),0) FROM public.withdrawals
     WHERE status IN ('approved','completed') AND created_at >= date_trunc('month', now())) AS monthly_outflows,
  (SELECT COALESCE(SUM(fee_amount),0) FROM public.fee_events
     WHERE created_at >= date_trunc('month', now())) AS monthly_fee_revenue,
  (SELECT COUNT(*) FROM public.profiles) AS total_users;
GRANT SELECT ON public.v_admin_aum_dashboard TO authenticated;

CREATE OR REPLACE VIEW public.v_portfolio_ranking WITH (security_invoker = on) AS
SELECT
  pk.id AS package_id, pk.name,
  COALESCE(hs.overall_score, 0) AS health_score,
  COALESCE(rm.portfolio_return_pct, 0) AS latest_return_pct,
  COALESCE(rm.risk_score, 0) AS risk_score,
  COALESCE(rm.max_drawdown_pct, 0) AS max_drawdown_pct,
  (SELECT COALESCE(SUM(amount),0) FROM public.subscriptions s WHERE s.package_id=pk.id AND s.status='active') AS aum,
  (SELECT COUNT(DISTINCT user_id) FROM public.subscriptions s WHERE s.package_id=pk.id AND s.status='active') AS investors
FROM public.packages pk
LEFT JOIN LATERAL (
  SELECT overall_score FROM public.portfolio_health_scores WHERE package_id=pk.id ORDER BY as_of_date DESC LIMIT 1
) hs ON true
LEFT JOIN LATERAL (
  SELECT portfolio_return_pct, risk_score, max_drawdown_pct FROM public.portfolio_risk_metrics
  WHERE package_id=pk.id ORDER BY period_end DESC LIMIT 1
) rm ON true;
GRANT SELECT ON public.v_portfolio_ranking TO authenticated;

REVOKE EXECUTE ON FUNCTION public.ensure_package_v1() FROM PUBLIC, anon, authenticated;
