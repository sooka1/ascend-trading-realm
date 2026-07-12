
-- =========================================================================
-- Competition auto-settlement pipeline
-- =========================================================================

CREATE OR REPLACE FUNCTION public.settle_competition(_competition_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_comp        record;
  v_tx_id       uuid := gen_random_uuid();
  v_rank        int;
  v_grants      int := 0;
  v_notified    int := 0;
BEGIN
  -- Lock the competition row so concurrent runs cannot double-settle
  SELECT id, name, status, end_at, starting_balance, currency
    INTO v_comp
    FROM public.comp_definitions
   WHERE id = _competition_id
   FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;

  -- Idempotency: skip anything already past reward_distribution
  IF v_comp.status IN ('finished', 'archived') THEN
    RETURN jsonb_build_object('ok', true, 'skipped', true, 'status', v_comp.status);
  END IF;

  IF v_comp.end_at IS NULL OR v_comp.end_at > now() THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_due');
  END IF;

  -- 1. Freeze trading
  UPDATE public.comp_definitions
     SET status = 'reward_distribution',
         updated_at = now()
   WHERE id = _competition_id;

  -- 2. Force-close open positions at entry price (zero PnL failsafe)
  UPDATE public.competition_trades
     SET status    = 'closed',
         exit      = COALESCE(exit, entry),
         pnl       = COALESCE(pnl, 0),
         closed_at = COALESCE(closed_at, now()),
         updated_at = now()
   WHERE competition_id = _competition_id
     AND status <> 'closed';

  -- 3. Compute final equity per registration into a temp CTE-materialized set
  WITH pnl_per_user AS (
    SELECT user_id, COALESCE(SUM(pnl), 0)::numeric AS total_pnl
      FROM public.competition_trades
     WHERE competition_id = _competition_id
     GROUP BY user_id
  ),
  ranked AS (
    SELECT
      r.id           AS registration_id,
      r.user_id,
      (v_comp.starting_balance + COALESCE(p.total_pnl, 0))::numeric AS final_equity,
      ROW_NUMBER() OVER (
        ORDER BY (v_comp.starting_balance + COALESCE(p.total_pnl, 0)) DESC,
                 r.registered_at ASC
      ) AS final_rank
    FROM public.comp_registrations r
    LEFT JOIN pnl_per_user p ON p.user_id = r.user_id
    WHERE r.competition_id = _competition_id
      AND r.status IN ('confirmed', 'active', 'pending')
  ),
  -- 4. Match ranks to reward tiers
  grants_ins AS (
    INSERT INTO public.comp_reward_grants (
      competition_id, registration_id, user_id, reward_id, reward_type,
      amount, currency, rank, status, granted_at, metadata
    )
    SELECT
      _competition_id,
      rk.registration_id,
      rk.user_id,
      rw.id,
      rw.reward_type,
      rw.amount,
      rw.currency,
      rk.final_rank,
      'granted',
      now(),
      jsonb_build_object('final_equity', rk.final_equity, 'auto_settled', true)
    FROM ranked rk
    JOIN public.comp_rewards rw
      ON rw.competition_id = _competition_id
     AND rk.final_rank BETWEEN rw.rank_from AND rw.rank_to
    WHERE NOT EXISTS (
      SELECT 1 FROM public.comp_reward_grants g
       WHERE g.competition_id = _competition_id
         AND g.registration_id = rk.registration_id
         AND g.reward_id = rw.id
    )
    RETURNING id, user_id, amount, currency, rank
  ),
  -- 5. Ledger credit for each cash grant
  ledger_ins AS (
    INSERT INTO public.ledger_entries (
      tx_id, user_id, event, account, direction,
      amount, currency, reference_table, reference_id, metadata
    )
    SELECT
      v_tx_id, g.user_id, 'competition_settle'::ledger_event, 'wallet'::ledger_account,
      1, g.amount, g.currency, 'comp_reward_grants', g.id,
      jsonb_build_object('competition_id', _competition_id, 'rank', g.rank)
    FROM grants_ins g
    RETURNING id, user_id
  ),
  -- 6. In-app notification
  notify_ins AS (
    INSERT INTO public.notifications (user_id, title, body)
    SELECT
      g.user_id,
      '🏆 لقد فزت في المسابقة!',
      format('تهانينا! المركز %s في %s — %s %s',
             g.rank, v_comp.name, to_char(g.amount, 'FM999999999.00'), g.currency)
    FROM grants_ins g
    RETURNING id
  )
  SELECT
    (SELECT count(*) FROM grants_ins),
    (SELECT count(*) FROM notify_ins)
  INTO v_grants, v_notified;

  -- 7. Mark competition finished + archive settlement record
  UPDATE public.comp_definitions
     SET status = 'finished', updated_at = now()
   WHERE id = _competition_id;

  INSERT INTO public.competition_settlements (
    competition_id, name, end_at, entry_fee, prize_pool,
    starting_balance, currency, status,
    frozen_at, settled_at, winners_count, metadata
  )
  SELECT
    v_comp.id, v_comp.name, v_comp.end_at,
    (SELECT COALESCE(entry_fee, 0) FROM public.comp_definitions WHERE id = v_comp.id),
    COALESCE((SELECT SUM(amount) FROM public.comp_rewards WHERE competition_id = v_comp.id), 0),
    v_comp.starting_balance, v_comp.currency, 'settled',
    now(), now(), v_grants,
    jsonb_build_object('auto_settled', true, 'tx_id', v_tx_id)
  ON CONFLICT DO NOTHING;

  -- 8. Audit event
  INSERT INTO public.comp_events (competition_id, event_type, payload)
  VALUES (_competition_id, 'auto_settled',
          jsonb_build_object('tx_id', v_tx_id, 'grants', v_grants, 'notified', v_notified));

  RETURN jsonb_build_object(
    'ok', true,
    'competition_id', _competition_id,
    'grants', v_grants,
    'notified', v_notified,
    'tx_id', v_tx_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.settle_competition(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_competition(uuid) TO service_role;

-- Batch driver: settle every competition whose end_at has passed
CREATE OR REPLACE FUNCTION public.settle_due_competitions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id      uuid;
  v_results jsonb := '[]'::jsonb;
  v_res     jsonb;
BEGIN
  FOR v_id IN
    SELECT id
      FROM public.comp_definitions
     WHERE end_at IS NOT NULL
       AND end_at < now()
       AND status NOT IN ('finished', 'archived', 'draft')
     ORDER BY end_at ASC
     LIMIT 25
  LOOP
    BEGIN
      v_res := public.settle_competition(v_id);
      v_results := v_results || jsonb_build_array(v_res);
    EXCEPTION WHEN OTHERS THEN
      v_results := v_results || jsonb_build_array(jsonb_build_object(
        'competition_id', v_id, 'ok', false, 'error', SQLERRM
      ));
    END;
  END LOOP;

  RETURN jsonb_build_object('processed', jsonb_array_length(v_results), 'results', v_results);
END;
$$;

REVOKE ALL ON FUNCTION public.settle_due_competitions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_due_competitions() TO service_role;

-- Schedule via pg_cron: every 5 minutes
CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  -- Unschedule prior version if present
  PERFORM cron.unschedule(j.jobid)
    FROM cron.job j
   WHERE j.jobname = 'settle-due-competitions';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'settle-due-competitions',
  '*/5 * * * *',
  $cron$ SELECT public.settle_due_competitions(); $cron$
);
