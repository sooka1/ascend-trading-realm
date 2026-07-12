
-- Fix Security Definer View: make view enforce caller's RLS, not creator's.
ALTER VIEW public.v_ledger_balances SET (security_invoker = on);

-- Ledger writer + hook fns must not be publicly callable.
-- Trigger execution ignores EXECUTE grants; revoking is safe.
REVOKE EXECUTE ON FUNCTION public.ledger_post(uuid, public.ledger_event, public.ledger_account, public.ledger_account, numeric, text, text, uuid, jsonb) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ledger_on_deposit_approved()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ledger_on_withdrawal_approved()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ledger_on_profit_distribution()   FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.ledger_on_referral_earning()      FROM PUBLIC, anon, authenticated;
