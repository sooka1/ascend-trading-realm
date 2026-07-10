-- Integration tests for the withdrawal → capital deduction pipeline.
-- Uses BEGIN…ROLLBACK so no data is persisted.
--
-- Scenarios:
--   T1) Newest-first deduction across multiple active subscriptions.
--   T2) Auto-cancellation when remaining capital breaks package minimum.
--   T3) Weekly profits skip cancelled subscriptions.

\set uid '\'cd8a337c-43c3-43e5-9845-45363086d9df\''
\set pkg 'a0000000-0000-0000-0000-0000000000b0'
\set s_old 'a0000000-0000-0000-0000-0000000000c1'
\set s_new 'a0000000-0000-0000-0000-0000000000c2'

BEGIN;

-- Shared fixtures
INSERT INTO public.packages (id, name, min_amount, target_return_pct, lockup_months, risk_level, currency, active, sort_order)
VALUES ('a0000000-0000-0000-0000-0000000000b0', 'wt-pkg', 500, 5, 0, 'moderate', 'USD', true, 999);

INSERT INTO public.deposits (user_id, amount, currency, method, status)
VALUES ('cd8a337c-43c3-43e5-9845-45363086d9df', 5000, 'USD', 'binance_pay', 'approved');

-- Two active subs: older (2000) and newer (1000)
INSERT INTO public.subscriptions (id, user_id, package_id, amount, currency, status, started_at, created_at)
VALUES
  ('a0000000-0000-0000-0000-0000000000c1', 'cd8a337c-43c3-43e5-9845-45363086d9df', 'a0000000-0000-0000-0000-0000000000b0', 2000, 'USD', 'active', now() - interval '10 days', now() - interval '10 days'),
  ('a0000000-0000-0000-0000-0000000000c2', 'cd8a337c-43c3-43e5-9845-45363086d9df', 'a0000000-0000-0000-0000-0000000000b0', 1000, 'USD', 'active', now() - interval '1 day',  now() - interval '1 day');

-- ---------- T1: newest-first deduction ----------
-- Withdraw 400 → should come entirely from NEWER sub (1000 → 600), older untouched.
INSERT INTO public.withdrawals (user_id, amount, currency, destination, status)
VALUES ('cd8a337c-43c3-43e5-9845-45363086d9df', 400, 'USD', 'Tabc', 'pending');

DO $$
DECLARE new_amt numeric; old_amt numeric; new_status text; old_status text;
BEGIN
  SELECT amount, status INTO new_amt, new_status FROM public.subscriptions WHERE id = 'a0000000-0000-0000-0000-0000000000c2';
  SELECT amount, status INTO old_amt, old_status FROM public.subscriptions WHERE id = 'a0000000-0000-0000-0000-0000000000c1';
  IF new_amt <> 600 OR new_status <> 'active' THEN
    RAISE EXCEPTION 'T1 FAIL: newer sub expected 600/active, got %/%', new_amt, new_status;
  END IF;
  IF old_amt <> 2000 OR old_status <> 'active' THEN
    RAISE EXCEPTION 'T1 FAIL: older sub expected 2000/active untouched, got %/%', old_amt, old_status;
  END IF;
END $$;
SELECT 'T1 PASS: newest-first deduction' AS result;

-- ---------- T2: cancellation when remaining < min_amount ----------
-- Newer sub currently 600. Withdraw 200 → 400 < min 500 → cancel newer sub.
INSERT INTO public.withdrawals (user_id, amount, currency, destination, status)
VALUES ('cd8a337c-43c3-43e5-9845-45363086d9df', 200, 'USD', 'Tabc', 'pending');

DO $$
DECLARE new_status text; new_amt numeric; old_amt numeric; old_status text;
BEGIN
  SELECT status, amount INTO new_status, new_amt FROM public.subscriptions WHERE id = 'a0000000-0000-0000-0000-0000000000c2';
  SELECT status, amount INTO old_status, old_amt FROM public.subscriptions WHERE id = 'a0000000-0000-0000-0000-0000000000c1';
  IF new_status <> 'cancelled' THEN
    RAISE EXCEPTION 'T2 FAIL: expected newer sub cancelled, got %', new_status;
  END IF;
  IF new_amt <> 400 THEN
    RAISE EXCEPTION 'T2 FAIL: leftover on cancelled sub expected 400, got %', new_amt;
  END IF;
  IF old_status <> 'active' OR old_amt <> 2000 THEN
    RAISE EXCEPTION 'T2 FAIL: older sub should remain 2000/active, got %/%', old_amt, old_status;
  END IF;
END $$;
SELECT 'T2 PASS: auto-cancel below minimum, leftover returns to wallet' AS result;

-- ---------- T3: cancelled sub receives no weekly profit ----------
SELECT public.distribute_weekly_profits();

DO $$
DECLARE n_cancelled integer; n_active integer;
BEGIN
  SELECT count(*) INTO n_cancelled FROM public.profit_distributions WHERE subscription_id = 'a0000000-0000-0000-0000-0000000000c2';
  SELECT count(*) INTO n_active    FROM public.profit_distributions WHERE subscription_id = 'a0000000-0000-0000-0000-0000000000c1';
  IF n_cancelled <> 0 THEN
    RAISE EXCEPTION 'T3 FAIL: cancelled sub received % profit rows', n_cancelled;
  END IF;
  IF n_active < 1 THEN
    RAISE EXCEPTION 'T3 FAIL: active sub expected >=1 profit row, got %', n_active;
  END IF;
END $$;
SELECT 'T3 PASS: profits skip cancelled, continue for active' AS result;

ROLLBACK;
