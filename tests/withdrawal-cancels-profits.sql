-- Integration test: after the withdrawal trigger cancels a subscription,
-- distribute_weekly_profits() must NOT insert any profit row for it.
BEGIN;

-- Isolated test user (auth.users FK)
INSERT INTO auth.users (id, email, instance_id, aud, role)
VALUES ('00000000-0000-0000-0000-0000000000aa', 'wt@test.local',
        '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated');

INSERT INTO public.profiles (id, email, display_name, referral_code)
VALUES ('00000000-0000-0000-0000-0000000000aa', 'wt@test.local', 'wt', 'WTTEST001')
ON CONFLICT (id) DO NOTHING;

-- Package with min_amount 1000, weekly return 5%
INSERT INTO public.packages (id, name, min_amount, target_return_pct, lockup_months, risk_level, currency, active, sort_order)
VALUES ('00000000-0000-0000-0000-0000000000bb', 'wt-pkg', 1000, 5, 0, 'moderate', 'USD', true, 999);

-- Approved deposit + active subscription of 1000
INSERT INTO public.deposits (user_id, amount, currency, method, status)
VALUES ('00000000-0000-0000-0000-0000000000aa', 1000, 'USD', 'binance_pay', 'approved');

INSERT INTO public.subscriptions (id, user_id, package_id, amount, currency, status, started_at)
VALUES ('00000000-0000-0000-0000-0000000000cc',
        '00000000-0000-0000-0000-0000000000aa',
        '00000000-0000-0000-0000-0000000000bb',
        1000, 'USD', 'active', now() - interval '1 day');

-- Withdraw 600 → remaining 400 < min 1000 → trigger cancels the subscription
INSERT INTO public.withdrawals (user_id, amount, currency, destination, status)
VALUES ('00000000-0000-0000-0000-0000000000aa', 600, 'USD', 'Tabc', 'pending');

-- Assert 1: subscription is cancelled
DO $$
DECLARE st text;
BEGIN
  SELECT status INTO st FROM public.subscriptions WHERE id = '00000000-0000-0000-0000-0000000000cc';
  IF st <> 'cancelled' THEN RAISE EXCEPTION 'FAIL: expected cancelled, got %', st; END IF;
END $$;

-- Run daily/weekly profit distribution
SELECT public.distribute_weekly_profits();

-- Assert 2: no profit row for the cancelled subscription
DO $$
DECLARE n integer;
BEGIN
  SELECT count(*) INTO n FROM public.profit_distributions
    WHERE subscription_id = '00000000-0000-0000-0000-0000000000cc';
  IF n <> 0 THEN RAISE EXCEPTION 'FAIL: cancelled sub received % profit rows', n; END IF;
END $$;

SELECT 'PASS: cancelled subscription receives no weekly profit' AS result;

ROLLBACK;
