
-- =========================================================
-- Enterprise Competition Orchestration Platform
-- Additive. Backward compatible.
-- =========================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE public.comp_status AS ENUM (
    'draft','scheduled','registration_open','registration_closed',
    'preparing_accounts','running','paused','finished',
    'reward_distribution','archived'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comp_type AS ENUM (
    'free','paid','private','invitation_only','team','league','season'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comp_registration_status AS ENUM (
    'pending','confirmed','waiting_list','rejected','withdrawn','disqualified'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comp_reward_type AS ENUM (
    'cash','wallet_credit','bonus_credit','coupon','badge','certificate'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.comp_flag_status AS ENUM ('open','reviewing','confirmed','dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- comp_definitions
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  comp_type public.comp_type NOT NULL DEFAULT 'free',
  status public.comp_status NOT NULL DEFAULT 'draft',
  visibility TEXT NOT NULL DEFAULT 'public',
  entry_fee NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  capacity INTEGER,
  waiting_list_enabled BOOLEAN NOT NULL DEFAULT true,
  starting_balance NUMERIC(18,2) NOT NULL DEFAULT 10000,
  leverage NUMERIC(10,2) NOT NULL DEFAULT 100,
  allowed_symbols TEXT[] NOT NULL DEFAULT '{}',
  max_positions INTEGER,
  max_daily_loss_pct NUMERIC(6,2),
  max_drawdown_pct NUMERIC(6,2),
  min_trades INTEGER,
  max_trades INTEGER,
  weekend_trading BOOLEAN NOT NULL DEFAULT false,
  trading_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  spread_rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  eligibility JSONB NOT NULL DEFAULT '{}'::jsonb,
  country_allowlist TEXT[] NOT NULL DEFAULT '{}',
  country_blocklist TEXT[] NOT NULL DEFAULT '{}',
  kyc_required BOOLEAN NOT NULL DEFAULT false,
  min_risk_profile TEXT,
  registration_open_at TIMESTAMPTZ,
  registration_close_at TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  rules JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_def_status ON public.comp_definitions(status);
CREATE INDEX IF NOT EXISTS idx_comp_def_start ON public.comp_definitions(start_at);
CREATE INDEX IF NOT EXISTS idx_comp_def_type ON public.comp_definitions(comp_type);

GRANT SELECT ON public.comp_definitions TO authenticated;
GRANT SELECT ON public.comp_definitions TO anon;
GRANT ALL ON public.comp_definitions TO service_role;
ALTER TABLE public.comp_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_def_public_read" ON public.comp_definitions FOR SELECT
  USING (visibility = 'public' OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_def_admin_all" ON public.comp_definitions FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_registrations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status public.comp_registration_status NOT NULL DEFAULT 'pending',
  invitation_code TEXT,
  eligibility_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  sim_account_id UUID,
  team_id UUID,
  queue_position INTEGER,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  disqualified_at TIMESTAMPTZ,
  disqualification_reason TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_comp_reg_user ON public.comp_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_comp_reg_comp_status ON public.comp_registrations(competition_id, status);

GRANT SELECT, INSERT, UPDATE ON public.comp_registrations TO authenticated;
GRANT ALL ON public.comp_registrations TO service_role;
ALTER TABLE public.comp_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_reg_owner_read" ON public.comp_registrations FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_reg_owner_insert" ON public.comp_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comp_reg_owner_update" ON public.comp_registrations FOR UPDATE
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_reg_admin_all" ON public.comp_registrations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_invitations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  used_count INTEGER NOT NULL DEFAULT 0,
  assigned_user_id UUID,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_inv_comp ON public.comp_invitations(competition_id);

GRANT SELECT ON public.comp_invitations TO authenticated;
GRANT ALL ON public.comp_invitations TO service_role;
ALTER TABLE public.comp_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_inv_admin_all" ON public.comp_invitations FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_inv_assignee_read" ON public.comp_invitations FOR SELECT
  USING (assigned_user_id = auth.uid());

-- =========================================================
-- comp_leaderboard_snapshots
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_leaderboard_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.comp_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank INTEGER,
  equity NUMERIC(18,2) NOT NULL DEFAULT 0,
  return_pct NUMERIC(10,4) NOT NULL DEFAULT 0,
  drawdown_pct NUMERIC(10,4) NOT NULL DEFAULT 0,
  win_rate NUMERIC(6,2) NOT NULL DEFAULT 0,
  trades INTEGER NOT NULL DEFAULT 0,
  sharpe_ratio NUMERIC(10,4),
  consistency_score NUMERIC(10,4),
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_latest BOOLEAN NOT NULL DEFAULT true
);
CREATE INDEX IF NOT EXISTS idx_comp_lb_latest ON public.comp_leaderboard_snapshots(competition_id, is_latest, rank);
CREATE INDEX IF NOT EXISTS idx_comp_lb_user ON public.comp_leaderboard_snapshots(user_id, captured_at DESC);

GRANT SELECT ON public.comp_leaderboard_snapshots TO authenticated;
GRANT SELECT ON public.comp_leaderboard_snapshots TO anon;
GRANT ALL ON public.comp_leaderboard_snapshots TO service_role;
ALTER TABLE public.comp_leaderboard_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_lb_public_read" ON public.comp_leaderboard_snapshots FOR SELECT USING (true);
CREATE POLICY "comp_lb_admin_all" ON public.comp_leaderboard_snapshots FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_anti_cheat_flags
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_anti_cheat_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  registration_id UUID REFERENCES public.comp_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  status public.comp_flag_status NOT NULL DEFAULT 'open',
  detected_by TEXT NOT NULL DEFAULT 'system',
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  reviewer_id UUID,
  reviewed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_flags_status ON public.comp_anti_cheat_flags(status, severity);
CREATE INDEX IF NOT EXISTS idx_comp_flags_user ON public.comp_anti_cheat_flags(user_id);

GRANT SELECT ON public.comp_anti_cheat_flags TO authenticated;
GRANT ALL ON public.comp_anti_cheat_flags TO service_role;
ALTER TABLE public.comp_anti_cheat_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_flags_owner_read" ON public.comp_anti_cheat_flags FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_flags_admin_all" ON public.comp_anti_cheat_flags FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_rewards (catalog)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  rank_from INTEGER NOT NULL,
  rank_to INTEGER NOT NULL,
  reward_type public.comp_reward_type NOT NULL,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_rewards_comp ON public.comp_rewards(competition_id);

GRANT SELECT ON public.comp_rewards TO authenticated;
GRANT SELECT ON public.comp_rewards TO anon;
GRANT ALL ON public.comp_rewards TO service_role;
ALTER TABLE public.comp_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_rewards_public_read" ON public.comp_rewards FOR SELECT USING (true);
CREATE POLICY "comp_rewards_admin_all" ON public.comp_rewards FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_reward_grants
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_reward_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  registration_id UUID NOT NULL REFERENCES public.comp_registrations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reward_id UUID REFERENCES public.comp_rewards(id) ON DELETE SET NULL,
  reward_type public.comp_reward_type NOT NULL,
  amount NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  rank INTEGER,
  ledger_entry_id UUID,
  status TEXT NOT NULL DEFAULT 'granted',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id, reward_id)
);
CREATE INDEX IF NOT EXISTS idx_comp_grants_user ON public.comp_reward_grants(user_id);

GRANT SELECT ON public.comp_reward_grants TO authenticated;
GRANT ALL ON public.comp_reward_grants TO service_role;
ALTER TABLE public.comp_reward_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_grants_owner_read" ON public.comp_reward_grants FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_grants_admin_all" ON public.comp_reward_grants FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_events
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  registration_id UUID REFERENCES public.comp_registrations(id) ON DELETE SET NULL,
  user_id UUID,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_events_comp ON public.comp_events(competition_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comp_events_type ON public.comp_events(event_type);

GRANT SELECT ON public.comp_events TO authenticated;
GRANT ALL ON public.comp_events TO service_role;
ALTER TABLE public.comp_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_events_owner_read" ON public.comp_events FOR SELECT
  USING (user_id IS NULL OR user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "comp_events_admin_all" ON public.comp_events FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- comp_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.comp_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.comp_definitions(id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by UUID,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comp_reports_comp ON public.comp_reports(competition_id, report_type);

GRANT SELECT ON public.comp_reports TO authenticated;
GRANT ALL ON public.comp_reports TO service_role;
ALTER TABLE public.comp_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comp_reports_admin_all" ON public.comp_reports FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- =========================================================
-- updated_at triggers
-- =========================================================
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname='update_updated_at_column' AND pronamespace='public'::regnamespace) THEN
    CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER
    LANGUAGE plpgsql SET search_path=public AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END; $f$;
  END IF;
END $$;

DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'comp_definitions','comp_registrations','comp_invitations',
    'comp_anti_cheat_flags','comp_rewards','comp_reward_grants','comp_reports'
  ]) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated ON public.%1$s;
       CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$s
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

-- =========================================================
-- Views
-- =========================================================
CREATE OR REPLACE VIEW public.v_comp_active AS
SELECT * FROM public.comp_definitions
WHERE status IN ('scheduled','registration_open','registration_closed','preparing_accounts','running','paused');

GRANT SELECT ON public.v_comp_active TO authenticated, anon;

CREATE OR REPLACE VIEW public.v_comp_leaderboard_latest AS
SELECT * FROM public.comp_leaderboard_snapshots WHERE is_latest = true;

GRANT SELECT ON public.v_comp_leaderboard_latest TO authenticated, anon;

-- =========================================================
-- RPC: register participant
-- =========================================================
CREATE OR REPLACE FUNCTION public.comp_register(
  _competition_id UUID,
  _invitation_code TEXT DEFAULT NULL
) RETURNS public.comp_registrations
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_def public.comp_definitions;
  v_count INTEGER;
  v_reg public.comp_registrations;
  v_status public.comp_registration_status;
  v_inv public.comp_invitations;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO v_def FROM public.comp_definitions WHERE id = _competition_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Competition not found'; END IF;
  IF v_def.status NOT IN ('registration_open','scheduled') THEN
    RAISE EXCEPTION 'Registration not open';
  END IF;

  IF v_def.comp_type IN ('private','invitation_only') THEN
    IF _invitation_code IS NULL THEN RAISE EXCEPTION 'Invitation code required'; END IF;
    SELECT * INTO v_inv FROM public.comp_invitations
      WHERE competition_id = _competition_id AND code = _invitation_code
        AND is_active AND (expires_at IS NULL OR expires_at > now())
        AND used_count < max_uses
      FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Invalid invitation code'; END IF;
    UPDATE public.comp_invitations SET used_count = used_count + 1 WHERE id = v_inv.id;
  END IF;

  SELECT COUNT(*) INTO v_count FROM public.comp_registrations
   WHERE competition_id = _competition_id AND status IN ('pending','confirmed');

  IF v_def.capacity IS NOT NULL AND v_count >= v_def.capacity THEN
    IF v_def.waiting_list_enabled THEN v_status := 'waiting_list';
    ELSE RAISE EXCEPTION 'Competition full'; END IF;
  ELSE
    v_status := 'confirmed';
  END IF;

  INSERT INTO public.comp_registrations(competition_id, user_id, status, invitation_code, confirmed_at)
  VALUES (_competition_id, v_uid, v_status, _invitation_code,
          CASE WHEN v_status='confirmed' THEN now() END)
  RETURNING * INTO v_reg;

  INSERT INTO public.comp_events(competition_id, event_type, registration_id, user_id, payload)
  VALUES (_competition_id, 'registered', v_reg.id, v_uid, jsonb_build_object('status', v_status));

  RETURN v_reg;
END $$;

REVOKE ALL ON FUNCTION public.comp_register(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comp_register(UUID, TEXT) TO authenticated;

-- =========================================================
-- RPC: transition status (admin)
-- =========================================================
CREATE OR REPLACE FUNCTION public.comp_transition_status(
  _competition_id UUID, _new_status public.comp_status
) RETURNS public.comp_definitions
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_def public.comp_definitions;
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  UPDATE public.comp_definitions SET status = _new_status, updated_at = now()
   WHERE id = _competition_id RETURNING * INTO v_def;
  IF NOT FOUND THEN RAISE EXCEPTION 'Competition not found'; END IF;
  INSERT INTO public.comp_events(competition_id, event_type, payload)
  VALUES (_competition_id, 'status_changed', jsonb_build_object('new_status', _new_status));
  RETURN v_def;
END $$;

REVOKE ALL ON FUNCTION public.comp_transition_status(UUID, public.comp_status) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comp_transition_status(UUID, public.comp_status) TO authenticated;

-- =========================================================
-- RPC: flag participant
-- =========================================================
CREATE OR REPLACE FUNCTION public.comp_flag_participant(
  _competition_id UUID, _user_id UUID, _flag_type TEXT,
  _severity TEXT DEFAULT 'medium', _evidence JSONB DEFAULT '{}'::jsonb
) RETURNS public.comp_anti_cheat_flags
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_reg UUID; v_flag public.comp_anti_cheat_flags;
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT id INTO v_reg FROM public.comp_registrations
   WHERE competition_id = _competition_id AND user_id = _user_id;
  INSERT INTO public.comp_anti_cheat_flags(competition_id, registration_id, user_id, flag_type, severity, evidence, detected_by)
  VALUES (_competition_id, v_reg, _user_id, _flag_type, _severity, _evidence, 'admin')
  RETURNING * INTO v_flag;
  RETURN v_flag;
END $$;

REVOKE ALL ON FUNCTION public.comp_flag_participant(UUID,UUID,TEXT,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comp_flag_participant(UUID,UUID,TEXT,TEXT,JSONB) TO authenticated;

-- =========================================================
-- RPC: grant reward
-- =========================================================
CREATE OR REPLACE FUNCTION public.comp_grant_reward(
  _competition_id UUID, _user_id UUID, _reward_id UUID
) RETURNS public.comp_reward_grants
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_reg public.comp_registrations;
  v_reward public.comp_rewards;
  v_grant public.comp_reward_grants;
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  SELECT * INTO v_reg FROM public.comp_registrations
   WHERE competition_id = _competition_id AND user_id = _user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Registration not found'; END IF;
  SELECT * INTO v_reward FROM public.comp_rewards WHERE id = _reward_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Reward not found'; END IF;

  INSERT INTO public.comp_reward_grants(
    competition_id, registration_id, user_id, reward_id,
    reward_type, amount, currency
  )
  VALUES (_competition_id, v_reg.id, _user_id, _reward_id,
          v_reward.reward_type, v_reward.amount, v_reward.currency)
  ON CONFLICT (competition_id, user_id, reward_id) DO UPDATE
    SET status = 'granted', updated_at = now()
  RETURNING * INTO v_grant;

  INSERT INTO public.comp_events(competition_id, event_type, registration_id, user_id, payload)
  VALUES (_competition_id, 'reward_granted', v_reg.id, _user_id,
          jsonb_build_object('reward_id', _reward_id, 'amount', v_reward.amount));

  RETURN v_grant;
END $$;

REVOKE ALL ON FUNCTION public.comp_grant_reward(UUID,UUID,UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comp_grant_reward(UUID,UUID,UUID) TO authenticated;

-- =========================================================
-- RPC: refresh leaderboard from sim_accounts
-- =========================================================
CREATE OR REPLACE FUNCTION public.comp_refresh_leaderboard(_competition_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_count INTEGER := 0;
BEGIN
  IF NOT public.has_role(auth.uid(),'super_admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;

  UPDATE public.comp_leaderboard_snapshots
     SET is_latest = false
   WHERE competition_id = _competition_id AND is_latest = true;

  WITH ranked AS (
    SELECT r.id AS registration_id, r.user_id,
           COALESCE(s.equity, 0) AS equity,
           COALESCE(s.closed_pnl,0) + COALESCE(s.floating_pnl,0) AS pnl,
           ROW_NUMBER() OVER (ORDER BY COALESCE(s.equity,0) DESC) AS rnk
      FROM public.comp_registrations r
      LEFT JOIN public.sim_accounts s ON s.id = r.sim_account_id
     WHERE r.competition_id = _competition_id
       AND r.status = 'confirmed'
  )
  INSERT INTO public.comp_leaderboard_snapshots(
    competition_id, registration_id, user_id, rank, equity, return_pct, is_latest
  )
  SELECT _competition_id, registration_id, user_id, rnk, equity,
         CASE WHEN equity > 0 THEN (pnl / NULLIF(equity - pnl, 0)) * 100 ELSE 0 END,
         true
    FROM ranked;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END $$;

REVOKE ALL ON FUNCTION public.comp_refresh_leaderboard(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.comp_refresh_leaderboard(UUID) TO authenticated;
