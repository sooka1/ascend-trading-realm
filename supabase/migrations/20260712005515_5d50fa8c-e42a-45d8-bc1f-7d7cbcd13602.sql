
-- =========================================================================
-- HKEX: Additive database hardening — ledger + hot-path indexes.
-- Backward compatible: no columns dropped, no data mutated, no policies removed.
-- =========================================================================

-- 1) DOUBLE-ENTRY LEDGER (append-only, immutable)
-- ------------------------------------------------------------------------
-- Every financial event produces two rows summing to zero per currency:
--   debit  account (increases) and credit account (decreases), or vice versa.
-- Balances remain derivable from the existing tables; the ledger is the
-- authoritative audit trail going forward.

DO $$ BEGIN
  CREATE TYPE public.ledger_account AS ENUM (
    'wallet',              -- user general wallet (approved deposits - approved withdrawals + profits - commitments)
    'subscription',        -- capital locked in a package subscription
    'competition',         -- capital locked in a competition entry
    'copy_allocation',     -- capital allocated to copy-trading master
    'profit_income',       -- realized profit distributions
    'referral_income',     -- referral earnings
    'fee',                 -- platform fees
    'adjustment',          -- manual admin adjustment
    'external'             -- counterparty outside the platform (deposits in, withdrawals out)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ledger_event AS ENUM (
    'deposit_approved',
    'withdrawal_approved',
    'withdrawal_reversed',
    'subscription_open',
    'subscription_close',
    'competition_enter',
    'competition_settle',
    'copy_allocate',
    'copy_settle',
    'profit_distribution',
    'referral_earning',
    'admin_adjustment',
    'fee_charge'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.ledger_entries (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_id        uuid NOT NULL,                          -- pairs debit+credit of the same event
  user_id      uuid NOT NULL,                          -- owner (both legs share the same user)
  event        public.ledger_event NOT NULL,
  account      public.ledger_account NOT NULL,
  direction    smallint NOT NULL CHECK (direction IN (-1, 1)),  -- -1 credit, +1 debit
  amount       numeric(20,2) NOT NULL CHECK (amount >= 0),
  currency     text NOT NULL DEFAULT 'USD',
  reference_table text,                                -- e.g. 'deposits','withdrawals','subscriptions'
  reference_id    uuid,                                -- FK-like pointer (soft link, no cascade)
  metadata     jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ledger_entries TO authenticated;
GRANT ALL    ON public.ledger_entries TO service_role;
ALTER TABLE public.ledger_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ledger_owner_read" ON public.ledger_entries;
CREATE POLICY "ledger_owner_read" ON public.ledger_entries
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

-- Append-only: block UPDATE / DELETE at policy level (no policies = deny).
-- Only SECURITY DEFINER functions (running as owner) can write.

CREATE INDEX IF NOT EXISTS idx_ledger_user_created  ON public.ledger_entries (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_tx            ON public.ledger_entries (tx_id);
CREATE INDEX IF NOT EXISTS idx_ledger_event         ON public.ledger_entries (event, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_reference     ON public.ledger_entries (reference_table, reference_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user_account  ON public.ledger_entries (user_id, account, currency);

-- Post/reverse a balanced pair (debit + credit) in one call.
CREATE OR REPLACE FUNCTION public.ledger_post(
  _user_id     uuid,
  _event       public.ledger_event,
  _debit       public.ledger_account,
  _credit      public.ledger_account,
  _amount      numeric,
  _currency    text,
  _ref_table   text,
  _ref_id      uuid,
  _metadata    jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tx uuid := gen_random_uuid();
BEGIN
  IF _amount IS NULL OR _amount <= 0 THEN
    RAISE EXCEPTION 'ledger_post: amount must be > 0';
  END IF;

  INSERT INTO public.ledger_entries
    (tx_id, user_id, event, account, direction, amount, currency, reference_table, reference_id, metadata)
  VALUES
    (new_tx, _user_id, _event, _debit,  1, ROUND(_amount::numeric, 2), COALESCE(_currency,'USD'), _ref_table, _ref_id, _metadata),
    (new_tx, _user_id, _event, _credit, -1, ROUND(_amount::numeric, 2), COALESCE(_currency,'USD'), _ref_table, _ref_id, _metadata);

  RETURN new_tx;
END;
$$;

-- 2) LEDGER-BACKED HOOKS (additive triggers; existing triggers untouched)
-- ------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ledger_on_deposit_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    PERFORM public.ledger_post(
      NEW.user_id, 'deposit_approved',
      'wallet', 'external',
      NEW.amount, COALESCE(NEW.currency,'USD'),
      'deposits', NEW.id,
      jsonb_build_object('method', NEW.method)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ledger_deposit_approved ON public.deposits;
CREATE TRIGGER trg_ledger_deposit_approved
  AFTER INSERT OR UPDATE OF status ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.ledger_on_deposit_approved();

CREATE OR REPLACE FUNCTION public.ledger_on_withdrawal_approved()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status IN ('approved','completed')
     AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('approved','completed')) THEN
    PERFORM public.ledger_post(
      NEW.user_id, 'withdrawal_approved',
      'external', 'wallet',
      NEW.amount, COALESCE(NEW.currency,'USD'),
      'withdrawals', NEW.id,
      jsonb_build_object('destination', NEW.destination)
    );
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ledger_withdrawal_approved ON public.withdrawals;
CREATE TRIGGER trg_ledger_withdrawal_approved
  AFTER INSERT OR UPDATE OF status ON public.withdrawals
  FOR EACH ROW EXECUTE FUNCTION public.ledger_on_withdrawal_approved();

CREATE OR REPLACE FUNCTION public.ledger_on_profit_distribution()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.ledger_post(
    NEW.user_id, 'profit_distribution',
    'wallet', 'profit_income',
    NEW.amount, COALESCE(NEW.currency,'USD'),
    'profit_distributions', NEW.id,
    jsonb_build_object('subscription_id', NEW.subscription_id,
                       'period_start', NEW.period_start,
                       'period_end',   NEW.period_end)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ledger_profit_distribution ON public.profit_distributions;
CREATE TRIGGER trg_ledger_profit_distribution
  AFTER INSERT ON public.profit_distributions
  FOR EACH ROW EXECUTE FUNCTION public.ledger_on_profit_distribution();

CREATE OR REPLACE FUNCTION public.ledger_on_referral_earning()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.ledger_post(
    NEW.referrer_id, 'referral_earning',
    'wallet', 'referral_income',
    NEW.amount, COALESCE(NEW.currency,'USD'),
    'referral_earnings', NEW.id,
    jsonb_build_object('referee_id', NEW.referee_id, 'deposit_id', NEW.deposit_id)
  );
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_ledger_referral_earning ON public.referral_earnings;
CREATE TRIGGER trg_ledger_referral_earning
  AFTER INSERT ON public.referral_earnings
  FOR EACH ROW EXECUTE FUNCTION public.ledger_on_referral_earning();

-- 3) HELPFUL VIEW: per-user balances by account (derivable, cheap with idx_ledger_user_account)
CREATE OR REPLACE VIEW public.v_ledger_balances AS
SELECT user_id, account, currency, SUM(direction * amount)::numeric(20,2) AS balance
FROM public.ledger_entries
GROUP BY user_id, account, currency;

GRANT SELECT ON public.v_ledger_balances TO authenticated, service_role;

-- 4) HOT-PATH INDEXES FOR SCALE (1M users, 10M+ tx)
-- ------------------------------------------------------------------------
-- All are additive; safe to create even if partially redundant.

CREATE INDEX IF NOT EXISTS idx_deposits_user_status_created
  ON public.deposits (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_deposits_status_created
  ON public.deposits (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_status_created
  ON public.withdrawals (user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status_created
  ON public.withdrawals (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status
  ON public.subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_package
  ON public.subscriptions (package_id);

CREATE INDEX IF NOT EXISTS idx_profit_dist_user_period
  ON public.profit_distributions (user_id, period_start DESC);
CREATE INDEX IF NOT EXISTS idx_profit_dist_sub_period
  ON public.profit_distributions (subscription_id, period_start DESC);

CREATE INDEX IF NOT EXISTS idx_transactions_user_created
  ON public.transactions (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
  ON public.notifications (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_user_created
  ON public.messages (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_created
  ON public.ticket_messages (ticket_id, created_at);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_referee
  ON public.referral_earnings (referee_id);

CREATE INDEX IF NOT EXISTS idx_finance_audit_actor
  ON public.finance_audit_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_copy_fills_master
  ON public.copy_trade_fills (master_trade_id);
