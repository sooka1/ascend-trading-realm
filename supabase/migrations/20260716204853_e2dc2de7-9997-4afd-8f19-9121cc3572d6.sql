-- Harden SECURITY DEFINER functions: revoke EXECUTE from PUBLIC/anon/authenticated,
-- then grant back only to callable-from-client whitelist.

DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure::text AS sig
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM anon', r.sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM authenticated', r.sig);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', r.sig);
  END LOOP;
END $$;

-- Whitelist: functions safe to call directly from signed-in clients via Data API.
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.email_has_role(text, app_role) TO authenticated, anon;

GRANT EXECUTE ON FUNCTION public.comp_register(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.enter_competition(text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_to_master(uuid, numeric) TO authenticated;

GRANT EXECUTE ON FUNCTION public.sim_place_order(uuid, text, text, numeric, numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sim_close_position(uuid, numeric, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sim_update_stops(uuid, numeric, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sim_mark_to_market(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.copy_pause_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_resume_subscription(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.copy_retry_failed(uuid) TO authenticated;

GRANT EXECUTE ON FUNCTION public.ai_get_user_context(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_record_memory(text, jsonb, text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_generate_timeline(uuid, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ai_log_query(text, uuid, text, jsonb) TO authenticated;

GRANT EXECUTE ON FUNCTION public.get_super_admin_public_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) TO authenticated;
