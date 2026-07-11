
-- 1) Tighten users cancel own subs: only allow self-transition to 'cancelled'
DROP POLICY IF EXISTS "users cancel own subs" ON public.subscriptions;
CREATE POLICY "users cancel own subs"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND status = 'cancelled');

-- 2) Ensure search_path is fixed on remaining functions
ALTER FUNCTION public.generate_referral_code() SET search_path = public;

-- 3) Revoke EXECUTE from anon on privileged SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.email_has_role(text, app_role) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_super_admin_public_key() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.email_has_role(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_super_admin_public_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) TO authenticated;
