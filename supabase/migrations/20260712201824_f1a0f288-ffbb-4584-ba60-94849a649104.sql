
ALTER VIEW public.v_ai_competition_summary SET (security_invoker = true);
ALTER VIEW public.v_ai_copy_summary SET (security_invoker = true);
ALTER VIEW public.v_ai_investment_summary SET (security_invoker = true);
ALTER VIEW public.v_ai_wallet_summary SET (security_invoker = true);
ALTER VIEW public.v_comp_active SET (security_invoker = true);
ALTER VIEW public.v_comp_leaderboard_latest SET (security_invoker = true);
ALTER VIEW public.v_copy_queue_admin SET (security_invoker = true);
ALTER VIEW public.v_md_latest_prices SET (security_invoker = true);
ALTER VIEW public.v_md_provider_health SET (security_invoker = true);
ALTER VIEW public.v_sim_competition_stats SET (security_invoker = true);

ALTER FUNCTION public.set_updated_at() SET search_path = public;
ALTER FUNCTION public.copy_calc_follower_lot(public.copy_follower_settings, numeric, numeric) SET search_path = public;

DO $$
DECLARE
  fn text;
BEGIN
  FOR fn IN
    SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid))
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
     WHERE n.nspname = 'public'
       AND p.prosecdef = true
       AND p.proname IN (
         'ai_generate_timeline','ai_get_user_context','ai_log_query','ai_record_memory',
         'cleanup_expired_data','comp_flag_participant','comp_grant_reward','comp_refresh_leaderboard',
         'comp_register','comp_transition_status','copy_claim_next_job','copy_complete_job',
         'copy_enqueue_master_event','copy_fail_job','copy_force_sync','copy_pause_subscription',
         'copy_process_queue_item','copy_release_stale_jobs','copy_resume_subscription','copy_retry_failed',
         'hyperscale_ensure_monthly_partitions','hyperscale_prepare_partitioned_table',
         'md_force_failover','md_get_active_provider','md_ingest_price','md_record_health','md_toggle_provider',
         'prevent_profile_privileged_updates','queue_health','reconcile_ledger_daily','recover_copy_queue',
         'run_daily_ledger_reconciliation','settle_competition','settle_due_competitions',
         'sim_close_position','sim_mark_to_market','sim_place_order','sim_update_stops'
       )
  LOOP
    EXECUTE 'REVOKE EXECUTE ON FUNCTION ' || fn || ' FROM anon, PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION ' || fn || ' TO authenticated, service_role';
  END LOOP;
END $$;
