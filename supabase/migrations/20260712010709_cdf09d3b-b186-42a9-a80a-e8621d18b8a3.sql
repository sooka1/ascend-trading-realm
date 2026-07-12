
-- ============================================================
-- INVESTMENT ENGINE UPGRADE — additive, backward-compatible
-- ============================================================

-- 1. Portfolio Managers ---------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_managers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  manager_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  allocation_pct numeric(5,2) NOT NULL DEFAULT 100.00 CHECK (allocation_pct > 0 AND allocation_pct <= 100),
  is_active boolean NOT NULL DEFAULT true,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (manager_id, package_id)
);
GRANT SELECT ON public.portfolio_managers TO authenticated;
GRANT ALL ON public.portfolio_managers TO service_role;
ALTER TABLE public.portfolio_managers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pm_read_all_auth" ON public.portfolio_managers FOR SELECT TO authenticated USING (true);
CREATE POLICY "pm_admin_write" ON public.portfolio_managers FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_pm_package ON public.portfolio_managers(package_id, is_active);
CREATE INDEX IF NOT EXISTS idx_pm_manager ON public.portfolio_managers(manager_id, is_active);
CREATE TRIGGER trg_pm_updated_at BEFORE UPDATE ON public.portfolio_managers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. NAV / AUM snapshots --------------------------------------
CREATE TABLE IF NOT EXISTS public.nav_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id uuid NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  snapshot_date date NOT NULL DEFAULT current_date,
  nav_per_unit numeric(18,6) NOT NULL DEFAULT 1.0,
  aum numeric(18,2) NOT NULL DEFAULT 0,
  active_investors integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (package_id, snapshot_date)
);
GRANT SELECT ON public.nav_snapshots TO authenticated;
GRANT ALL ON public.nav_snapshots TO service_role;
ALTER TABLE public.nav_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nav_read_all_auth" ON public.nav_snapshots FOR SELECT TO authenticated USING (true);
CREATE POLICY "nav_admin_write" ON public.nav_snapshots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_nav_package_date ON public.nav_snapshots(package_id, snapshot_date DESC);

-- 3. Fee events (management + performance) --------------------
DO $$ BEGIN
  CREATE TYPE public.fee_kind AS ENUM ('management','performance','entry','exit','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.fee_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  kind public.fee_kind NOT NULL,
  base_amount numeric(18,2) NOT NULL,
  rate_pct numeric(6,3) NOT NULL,
  fee_amount numeric(18,2) NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  period_start date,
  period_end date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.fee_events TO authenticated;
GRANT ALL ON public.fee_events TO service_role;
ALTER TABLE public.fee_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fee_own_read" ON public.fee_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "fee_admin_write" ON public.fee_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_fee_user_created ON public.fee_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fee_subscription ON public.fee_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_fee_kind_period ON public.fee_events(kind, period_start);

-- 4. Investment lifecycle events ------------------------------
DO $$ BEGIN
  CREATE TYPE public.investment_event AS ENUM (
    'subscription_created','subscription_activated','subscription_paused',
    'subscription_closed','capital_increased','capital_reduced',
    'redemption_requested','redemption_approved','redemption_rejected',
    'distribution_credited','fee_charged','manager_assigned','manager_unassigned'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.investment_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  event public.investment_event NOT NULL,
  amount numeric(18,2),
  currency text DEFAULT 'USD',
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reference_table text,
  reference_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.investment_lifecycle_events TO authenticated;
GRANT ALL ON public.investment_lifecycle_events TO service_role;
ALTER TABLE public.investment_lifecycle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ile_own_read" ON public.investment_lifecycle_events FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ile_admin_write" ON public.investment_lifecycle_events FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_ile_user_created ON public.investment_lifecycle_events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ile_subscription ON public.investment_lifecycle_events(subscription_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ile_event ON public.investment_lifecycle_events(event, created_at DESC);

-- 5. Auto-log lifecycle events from existing tables -----------
CREATE OR REPLACE FUNCTION public.log_subscription_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.investment_lifecycle_events(user_id, subscription_id, event, amount, currency, reference_table, reference_id)
    VALUES (NEW.user_id, NEW.id,
            CASE WHEN NEW.status='active' THEN 'subscription_activated'::investment_event
                 ELSE 'subscription_created'::investment_event END,
            NEW.amount, COALESCE(NEW.currency,'USD'), 'subscriptions', NEW.id);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      INSERT INTO public.investment_lifecycle_events(user_id, subscription_id, event, amount, currency, reference_table, reference_id, metadata)
      VALUES (NEW.user_id, NEW.id,
              CASE NEW.status
                WHEN 'active'    THEN 'subscription_activated'::investment_event
                WHEN 'paused'    THEN 'subscription_paused'::investment_event
                WHEN 'closed'    THEN 'subscription_closed'::investment_event
                WHEN 'cancelled' THEN 'subscription_closed'::investment_event
                ELSE 'subscription_created'::investment_event
              END,
              NEW.amount, COALESCE(NEW.currency,'USD'), 'subscriptions', NEW.id,
              jsonb_build_object('from', OLD.status, 'to', NEW.status));
    END IF;
    IF NEW.amount IS DISTINCT FROM OLD.amount THEN
      INSERT INTO public.investment_lifecycle_events(user_id, subscription_id, event, amount, currency, reference_table, reference_id, metadata)
      VALUES (NEW.user_id, NEW.id,
              CASE WHEN NEW.amount > OLD.amount THEN 'capital_increased'::investment_event
                   ELSE 'capital_reduced'::investment_event END,
              ABS(NEW.amount - OLD.amount), COALESCE(NEW.currency,'USD'), 'subscriptions', NEW.id,
              jsonb_build_object('from', OLD.amount, 'to', NEW.amount));
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_sub_lifecycle ON public.subscriptions;
CREATE TRIGGER trg_log_sub_lifecycle
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.log_subscription_lifecycle();

CREATE OR REPLACE FUNCTION public.log_withdrawal_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.investment_lifecycle_events(user_id, event, amount, currency, reference_table, reference_id)
    VALUES (NEW.user_id, 'redemption_requested', NEW.amount, COALESCE(NEW.currency,'USD'), 'withdrawals', NEW.id);
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status IN ('approved','completed') THEN
      INSERT INTO public.investment_lifecycle_events(user_id, event, amount, currency, reference_table, reference_id, metadata)
      VALUES (NEW.user_id, 'redemption_approved', NEW.amount, COALESCE(NEW.currency,'USD'), 'withdrawals', NEW.id,
              jsonb_build_object('status', NEW.status));
    ELSIF NEW.status = 'rejected' THEN
      INSERT INTO public.investment_lifecycle_events(user_id, event, amount, currency, reference_table, reference_id)
      VALUES (NEW.user_id, 'redemption_rejected', NEW.amount, COALESCE(NEW.currency,'USD'), 'withdrawals', NEW.id);
    END IF;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_wd_lifecycle ON public.withdrawals;
CREATE TRIGGER trg_log_wd_lifecycle
  AFTER INSERT OR UPDATE ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.log_withdrawal_lifecycle();

CREATE OR REPLACE FUNCTION public.log_distribution_lifecycle()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.investment_lifecycle_events(user_id, subscription_id, event, amount, currency, reference_table, reference_id)
  VALUES (NEW.user_id, NEW.subscription_id, 'distribution_credited', NEW.amount, COALESCE(NEW.currency,'USD'),
          'profit_distributions', NEW.id);
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_log_pd_lifecycle ON public.profit_distributions;
CREATE TRIGGER trg_log_pd_lifecycle
  AFTER INSERT ON public.profit_distributions
  FOR EACH ROW EXECUTE FUNCTION public.log_distribution_lifecycle();

-- 6. Investor summary view + AUM view -------------------------
CREATE OR REPLACE VIEW public.v_investor_summary
WITH (security_invoker = on) AS
SELECT
  p.id AS user_id,
  COALESCE((SELECT SUM(amount) FROM public.deposits           WHERE user_id=p.id AND status='approved'),0)                     AS total_deposited,
  COALESCE((SELECT SUM(amount) FROM public.withdrawals        WHERE user_id=p.id AND status IN ('approved','completed')),0)    AS total_withdrawn,
  COALESCE((SELECT SUM(amount) FROM public.subscriptions      WHERE user_id=p.id AND status='active'),0)                       AS active_capital,
  COALESCE((SELECT SUM(amount) FROM public.profit_distributions WHERE user_id=p.id),0)                                          AS total_profits,
  COALESCE((SELECT SUM(amount) FROM public.referral_earnings  WHERE referrer_id=p.id),0)                                        AS total_referral,
  COALESCE((SELECT SUM(fee_amount) FROM public.fee_events     WHERE user_id=p.id),0)                                            AS total_fees
FROM public.profiles p;

GRANT SELECT ON public.v_investor_summary TO authenticated;

CREATE OR REPLACE VIEW public.v_aum_by_package
WITH (security_invoker = on) AS
SELECT
  pkg.id AS package_id,
  pkg.name,
  COUNT(DISTINCT s.user_id) FILTER (WHERE s.status='active') AS active_investors,
  COALESCE(SUM(s.amount) FILTER (WHERE s.status='active'),0) AS aum
FROM public.packages pkg
LEFT JOIN public.subscriptions s ON s.package_id = pkg.id
GROUP BY pkg.id, pkg.name;

GRANT SELECT ON public.v_aum_by_package TO authenticated;

-- 7. Scale indexes (idempotent) -------------------------------
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status_created ON public.subscriptions(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package_status ON public.subscriptions(package_id, status);
CREATE INDEX IF NOT EXISTS idx_deposits_user_status_created ON public.deposits(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status_created ON public.withdrawals(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profit_dist_user_period ON public.profit_distributions(user_id, period_start DESC);

-- Lock down helper functions
REVOKE EXECUTE ON FUNCTION public.log_subscription_lifecycle() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_withdrawal_lifecycle()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_distribution_lifecycle() FROM PUBLIC, anon, authenticated;
