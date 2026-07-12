
-- ============================================================
-- Competition Settlement Pipeline
-- ============================================================

-- 1. Settlements registry (text-keyed to match competition_trades.competition_id)
CREATE TABLE public.competition_settlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id text NOT NULL UNIQUE,
  name text NOT NULL,
  end_at timestamptz NOT NULL,
  entry_fee numeric NOT NULL DEFAULT 0,
  prize_pool numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  -- rank -> pct of prize_pool. Default: 1st=50%, 2nd=30%, 3rd=20%.
  prize_distribution jsonb NOT NULL DEFAULT '{"1":0.5,"2":0.3,"3":0.2}'::jsonb,
  starting_balance numeric NOT NULL DEFAULT 5000,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','frozen','settled','archived')),
  frozen_at timestamptz,
  settled_at timestamptz,
  archived_at timestamptz,
  winners_count integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.competition_settlements TO authenticated;
GRANT ALL ON public.competition_settlements TO service_role;

ALTER TABLE public.competition_settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read competition settlements"
  ON public.competition_settlements FOR SELECT TO authenticated
  USING (true);

-- 2. Reward payouts ledger
CREATE TABLE public.competition_rewards_paid (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id text NOT NULL,
  user_id uuid NOT NULL,
  rank integer NOT NULL,
  final_equity numeric NOT NULL,
  return_pct numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  deposit_id uuid,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','granted','failed','notified')),
  granted_at timestamptz,
  notified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (competition_id, user_id)
);

GRANT SELECT ON public.competition_rewards_paid TO authenticated;
GRANT ALL ON public.competition_rewards_paid TO service_role;

ALTER TABLE public.competition_rewards_paid ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read own competition rewards"
  ON public.competition_rewards_paid FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 3. updated_at triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_competition_settlements_updated
  BEFORE UPDATE ON public.competition_settlements
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_competition_rewards_paid_updated
  BEFORE UPDATE ON public.competition_rewards_paid
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Full settlement pipeline for a single competition
CREATE OR REPLACE FUNCTION public.settle_competition(_competition_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s public.competition_settlements%ROWTYPE;
  v_closed_count int := 0;
  v_ranked_count int := 0;
  v_prize_total numeric := 0;
  v_pct numeric;
  v_rank int;
  v_amount numeric;
  v_dep_id uuid;
  r record;
BEGIN
  -- Lock the settlement row to prevent concurrent runs on the same competition
  SELECT * INTO s FROM public.competition_settlements
    WHERE competition_id = _competition_id
    FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unknown_competition');
  END IF;

  -- Idempotent: skip already-settled competitions
  IF s.status IN ('settled','archived') THEN
    RETURN jsonb_build_object('ok', true, 'skipped', true, 'status', s.status);
  END IF;

  -- Do not settle competitions that have not ended yet
  IF s.end_at > now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_ended', 'end_at', s.end_at);
  END IF;

  -- Step 1 & 2: Freeze trading and force-close open positions
  UPDATE public.competition_settlements
    SET status = 'frozen', frozen_at = now()
    WHERE id = s.id;

  UPDATE public.competition_trades
    SET status = 'closed',
        exit = entry,
        pnl = COALESCE(pnl, 0),
        closed_at = now()
    WHERE competition_id = _competition_id
      AND status = 'open';
  GET DIAGNOSTICS v_closed_count = ROW_COUNT;

  -- Step 3 & 4: Calculate final equity per user and generate leaderboard
  CREATE TEMP TABLE _lb ON COMMIT DROP AS
  SELECT
    t.user_id,
    s.starting_balance + COALESCE(SUM(t.pnl), 0) AS final_equity,
    COUNT(*) AS trades_count
  FROM public.competition_trades t
  WHERE t.competition_id = _competition_id
    AND t.user_id IS NOT NULL
  GROUP BY t.user_id;

  -- Rank
  CREATE TEMP TABLE _ranked ON COMMIT DROP AS
  SELECT user_id, final_equity, trades_count,
         RANK() OVER (ORDER BY final_equity DESC) AS rank
  FROM _lb;

  SELECT COUNT(*) INTO v_ranked_count FROM _ranked;

  -- Step 5 & 6: Determine winners and grant rewards
  FOR r IN
    SELECT user_id, final_equity, rank
    FROM _ranked
    WHERE rank::text IN (SELECT jsonb_object_keys(s.prize_distribution))
    ORDER BY rank
  LOOP
    v_pct := COALESCE((s.prize_distribution ->> r.rank::text)::numeric, 0);
    v_amount := ROUND(s.prize_pool * v_pct, 2);
    IF v_amount <= 0 THEN CONTINUE; END IF;

    -- Credit the wallet as an approved deposit so the existing balance
    -- computation (deposits.approved - withdrawals) picks it up immediately.
    INSERT INTO public.deposits (user_id, amount, currency, method, status, reference, notes)
    VALUES (
      r.user_id, v_amount, s.currency, 'competition_reward', 'approved',
      _competition_id,
      format('جائزة المسابقة — المرتبة %s', r.rank)
    )
    RETURNING id INTO v_dep_id;

    INSERT INTO public.competition_rewards_paid
      (competition_id, user_id, rank, final_equity, return_pct, amount, currency,
       deposit_id, status, granted_at)
    VALUES (
      _competition_id, r.user_id, r.rank, r.final_equity,
      CASE WHEN s.starting_balance > 0
           THEN ROUND(((r.final_equity - s.starting_balance) / s.starting_balance) * 100, 2)
           ELSE 0 END,
      v_amount, s.currency, v_dep_id, 'granted', now()
    )
    ON CONFLICT (competition_id, user_id) DO NOTHING;

    -- Step 7: Notify winner
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (
      r.user_id,
      'تهانينا — فزت في المسابقة',
      format('%s — المرتبة %s — الجائزة %s %s', s.name, r.rank, v_amount, s.currency)
    );

    UPDATE public.competition_rewards_paid
      SET status = 'notified', notified_at = now()
      WHERE competition_id = _competition_id AND user_id = r.user_id;

    v_prize_total := v_prize_total + v_amount;
  END LOOP;

  -- Step 8 & 9: Mark as settled and archived
  UPDATE public.competition_settlements
    SET status = 'archived',
        settled_at = now(),
        archived_at = now(),
        winners_count = (SELECT COUNT(*) FROM public.competition_rewards_paid
                         WHERE competition_id = _competition_id)
    WHERE id = s.id;

  RETURN jsonb_build_object(
    'ok', true,
    'competition_id', _competition_id,
    'closed_positions', v_closed_count,
    'ranked_users', v_ranked_count,
    'prizes_paid', v_prize_total
  );
END $$;

REVOKE ALL ON FUNCTION public.settle_competition(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_competition(text) TO service_role;

-- 5. Batch settlement — runs every due competition. Called by pg_cron.
CREATE OR REPLACE FUNCTION public.settle_due_competitions()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  results jsonb := '[]'::jsonb;
  outcome jsonb;
BEGIN
  FOR r IN
    SELECT competition_id
    FROM public.competition_settlements
    WHERE status = 'active'
      AND end_at <= now()
    ORDER BY end_at ASC
  LOOP
    outcome := public.settle_competition(r.competition_id);
    results := results || jsonb_build_array(outcome);
  END LOOP;
  RETURN jsonb_build_object('ok', true, 'processed', results);
END $$;

REVOKE ALL ON FUNCTION public.settle_due_competitions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.settle_due_competitions() TO service_role;
