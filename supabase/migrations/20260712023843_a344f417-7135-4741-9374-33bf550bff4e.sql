
-- =========================================================
-- HKEX Enterprise AI Intelligence Layer (additive, read-only)
-- =========================================================

DO $$ BEGIN
  CREATE TYPE public.ai_risk_tolerance AS ENUM ('conservative','moderate','balanced','growth','aggressive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ai_report_type AS ENUM (
    'daily','weekly','monthly','portfolio','competition','copy_trading','investment','risk'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ai_insight_severity AS ENUM ('info','low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =========================================================
-- ai_investor_profiles
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_investor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  investment_experience TEXT,
  risk_tolerance public.ai_risk_tolerance,
  preferred_markets TEXT[] NOT NULL DEFAULT '{}',
  preferred_assets TEXT[] NOT NULL DEFAULT '{}',
  investment_horizon TEXT,
  goals JSONB NOT NULL DEFAULT '{}'::jsonb,
  behavior JSONB NOT NULL DEFAULT '{}'::jsonb,
  goal_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.ai_investor_profiles TO authenticated;
GRANT ALL ON public.ai_investor_profiles TO service_role;
ALTER TABLE public.ai_investor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_prof_own" ON public.ai_investor_profiles FOR ALL
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_memory (append-only long-term preferences)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL,
  source TEXT NOT NULL DEFAULT 'user',
  confidence NUMERIC(4,3),
  is_active BOOLEAN NOT NULL DEFAULT true,
  valid_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  valid_to TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_mem_user_key ON public.ai_memory(user_id, key, is_active);
GRANT SELECT, INSERT ON public.ai_memory TO authenticated;
GRANT ALL ON public.ai_memory TO service_role;
ALTER TABLE public.ai_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_mem_own_read" ON public.ai_memory FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_mem_own_insert" ON public.ai_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ai_mem_admin_all" ON public.ai_memory FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- Prevent updates/deletes of historical memory rows (immutable)
CREATE OR REPLACE FUNCTION public.ai_memory_no_mutation() RETURNS TRIGGER
LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
  IF public.has_role(auth.uid(),'super_admin') THEN RETURN COALESCE(NEW, OLD); END IF;
  RAISE EXCEPTION 'ai_memory is append-only';
END $$;
DROP TRIGGER IF EXISTS trg_ai_memory_no_update ON public.ai_memory;
CREATE TRIGGER trg_ai_memory_no_update BEFORE UPDATE OR DELETE ON public.ai_memory
  FOR EACH ROW EXECUTE FUNCTION public.ai_memory_no_mutation();

-- =========================================================
-- ai_events_timeline (explainable timeline)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_events_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  event_category TEXT NOT NULL,
  reference_table TEXT,
  reference_id UUID,
  amount NUMERIC(18,2),
  currency TEXT,
  summary TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_timeline_user ON public.ai_events_timeline(user_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_timeline_cat ON public.ai_events_timeline(event_category);
GRANT SELECT ON public.ai_events_timeline TO authenticated;
GRANT ALL ON public.ai_events_timeline TO service_role;
ALTER TABLE public.ai_events_timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_tl_own" ON public.ai_events_timeline FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_tl_admin" ON public.ai_events_timeline FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_explanations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_explanations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  reference_table TEXT,
  reference_id UUID,
  explanation TEXT NOT NULL,
  supporting_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_expl_user ON public.ai_explanations(user_id, created_at DESC);
GRANT SELECT ON public.ai_explanations TO authenticated;
GRANT ALL ON public.ai_explanations TO service_role;
ALTER TABLE public.ai_explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_expl_own" ON public.ai_explanations FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_expl_admin" ON public.ai_explanations FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_recommendations
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  rationale TEXT NOT NULL,
  action_type TEXT,
  suggested_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  profile_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_rec_user ON public.ai_recommendations(user_id, status);
GRANT SELECT ON public.ai_recommendations TO authenticated;
GRANT ALL ON public.ai_recommendations TO service_role;
ALTER TABLE public.ai_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_rec_own" ON public.ai_recommendations FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_rec_admin" ON public.ai_recommendations FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_risk_insights
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_risk_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  scope TEXT NOT NULL DEFAULT 'user',
  insight_code TEXT NOT NULL,
  severity public.ai_insight_severity NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  description TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_risk_user ON public.ai_risk_insights(user_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_risk_code ON public.ai_risk_insights(insight_code, severity);
GRANT SELECT ON public.ai_risk_insights TO authenticated;
GRANT ALL ON public.ai_risk_insights TO service_role;
ALTER TABLE public.ai_risk_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_risk_own" ON public.ai_risk_insights FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_risk_admin" ON public.ai_risk_insights FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_reports
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  report_type public.ai_report_type NOT NULL,
  period_start DATE,
  period_end DATE,
  summary TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  generated_by TEXT NOT NULL DEFAULT 'system',
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_reports_user ON public.ai_reports(user_id, report_type, period_end DESC);
GRANT SELECT ON public.ai_reports TO authenticated;
GRANT ALL ON public.ai_reports TO service_role;
ALTER TABLE public.ai_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_reports_own" ON public.ai_reports FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_reports_admin" ON public.ai_reports FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_admin_insights
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_admin_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_code TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  period_start DATE,
  period_end DATE,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  severity public.ai_insight_severity NOT NULL DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_admin_code ON public.ai_admin_insights(insight_code, created_at DESC);
GRANT SELECT ON public.ai_admin_insights TO authenticated;
GRANT ALL ON public.ai_admin_insights TO service_role;
ALTER TABLE public.ai_admin_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_admin_ins_admin" ON public.ai_admin_insights FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- ai_query_audit
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_query_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  target_user_id UUID,
  action TEXT NOT NULL,
  surface TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_audit_actor ON public.ai_query_audit(actor_id, created_at DESC);
GRANT SELECT ON public.ai_query_audit TO authenticated;
GRANT ALL ON public.ai_query_audit TO service_role;
ALTER TABLE public.ai_query_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ai_audit_own" ON public.ai_query_audit FOR SELECT
  USING (actor_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "ai_audit_admin" ON public.ai_query_audit FOR ALL
  USING (public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (public.has_role(auth.uid(),'super_admin'));

-- =========================================================
-- updated_at triggers
-- =========================================================
DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY['ai_investor_profiles','ai_recommendations']) LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%1$s_updated ON public.%1$s;
       CREATE TRIGGER trg_%1$s_updated BEFORE UPDATE ON public.%1$s
       FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();', t);
  END LOOP;
END $$;

-- =========================================================
-- Read-only knowledge views
-- =========================================================
CREATE OR REPLACE VIEW public.v_ai_wallet_summary AS
SELECT
  p.id AS user_id,
  COALESCE((SELECT SUM(amount) FROM public.deposits d WHERE d.user_id = p.id AND d.status='approved'),0) AS total_deposits,
  COALESCE((SELECT SUM(amount) FROM public.withdrawals w WHERE w.user_id = p.id AND w.status IN ('approved','completed')),0) AS total_withdrawals,
  COALESCE((SELECT SUM(amount) FROM public.profit_distributions pd WHERE pd.user_id = p.id),0) AS total_profits,
  COALESCE((SELECT SUM(amount) FROM public.referral_earnings r WHERE r.referrer_id = p.id),0) AS total_referral
FROM public.profiles p;
GRANT SELECT ON public.v_ai_wallet_summary TO authenticated;

CREATE OR REPLACE VIEW public.v_ai_investment_summary AS
SELECT user_id,
       COUNT(*) FILTER (WHERE status='active') AS active_subs,
       COUNT(*) FILTER (WHERE status='cancelled') AS cancelled_subs,
       COALESCE(SUM(amount) FILTER (WHERE status='active'),0) AS active_capital
  FROM public.subscriptions GROUP BY user_id;
GRANT SELECT ON public.v_ai_investment_summary TO authenticated;

CREATE OR REPLACE VIEW public.v_ai_copy_summary AS
SELECT user_id,
       COUNT(*) FILTER (WHERE status='active') AS active_copies,
       COALESCE(SUM(allocated_amount) FILTER (WHERE status='active'),0) AS copy_capital
  FROM public.copy_subscriptions GROUP BY user_id;
GRANT SELECT ON public.v_ai_copy_summary TO authenticated;

CREATE OR REPLACE VIEW public.v_ai_competition_summary AS
SELECT user_id,
       COUNT(*) AS total_entries,
       COUNT(*) FILTER (WHERE status='active') AS active_entries,
       COALESCE(SUM(tier_fee),0) AS total_fees
  FROM public.competition_entries GROUP BY user_id;
GRANT SELECT ON public.v_ai_competition_summary TO authenticated;

-- =========================================================
-- ai_log_query
-- =========================================================
CREATE OR REPLACE FUNCTION public.ai_log_query(
  _action TEXT, _target_user_id UUID DEFAULT NULL, _surface TEXT DEFAULT NULL, _payload JSONB DEFAULT '{}'::jsonb
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.ai_query_audit(actor_id, target_user_id, action, surface, payload)
  VALUES (auth.uid(), _target_user_id, _action, _surface, COALESCE(_payload,'{}'::jsonb))
  RETURNING id INTO v_id;
  RETURN v_id;
END $$;
REVOKE ALL ON FUNCTION public.ai_log_query(TEXT,UUID,TEXT,JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_log_query(TEXT,UUID,TEXT,JSONB) TO authenticated;

-- =========================================================
-- ai_record_memory (append-only)
-- =========================================================
CREATE OR REPLACE FUNCTION public.ai_record_memory(
  _key TEXT, _value JSONB, _source TEXT DEFAULT 'user', _confidence NUMERIC DEFAULT NULL
) RETURNS public.ai_memory
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE v_uid UUID := auth.uid(); v_row public.ai_memory;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  -- Deactivate previous entries for same key without deleting them
  UPDATE public.ai_memory SET is_active = false, valid_to = now()
   WHERE user_id = v_uid AND key = _key AND is_active = true;
  INSERT INTO public.ai_memory(user_id, key, value, source, confidence)
  VALUES (v_uid, _key, _value, _source, _confidence)
  RETURNING * INTO v_row;
  RETURN v_row;
END $$;
REVOKE ALL ON FUNCTION public.ai_record_memory(TEXT,JSONB,TEXT,NUMERIC) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_record_memory(TEXT,JSONB,TEXT,NUMERIC) TO authenticated;

-- =========================================================
-- ai_get_user_context (unified read for AI services)
-- =========================================================
CREATE OR REPLACE FUNCTION public.ai_get_user_context(_target UUID DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid UUID := COALESCE(_target, auth.uid());
  v_out JSONB;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF v_uid <> auth.uid() AND NOT public.has_role(auth.uid(),'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;

  SELECT jsonb_build_object(
    'profile', (SELECT row_to_json(p) FROM public.ai_investor_profiles p WHERE p.user_id = v_uid),
    'memory',  COALESCE((SELECT jsonb_agg(row_to_json(m)) FROM public.ai_memory m
                          WHERE m.user_id = v_uid AND m.is_active), '[]'::jsonb),
    'wallet',  (SELECT row_to_json(w) FROM public.v_ai_wallet_summary w WHERE w.user_id = v_uid),
    'investments', (SELECT row_to_json(i) FROM public.v_ai_investment_summary i WHERE i.user_id = v_uid),
    'copy',    (SELECT row_to_json(c) FROM public.v_ai_copy_summary c WHERE c.user_id = v_uid),
    'competitions', (SELECT row_to_json(x) FROM public.v_ai_competition_summary x WHERE x.user_id = v_uid),
    'recent_events', COALESCE((SELECT jsonb_agg(row_to_json(t))
                                 FROM (SELECT * FROM public.ai_events_timeline
                                        WHERE user_id = v_uid
                                        ORDER BY occurred_at DESC LIMIT 25) t), '[]'::jsonb),
    'risk_insights', COALESCE((SELECT jsonb_agg(row_to_json(r))
                                 FROM public.ai_risk_insights r
                                 WHERE r.user_id = v_uid AND r.status='open'), '[]'::jsonb)
  ) INTO v_out;

  PERFORM public.ai_log_query('get_context', v_uid, 'ai_get_user_context', '{}'::jsonb);
  RETURN v_out;
END $$;
REVOKE ALL ON FUNCTION public.ai_get_user_context(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_get_user_context(UUID) TO authenticated;

-- =========================================================
-- ai_generate_timeline (rebuild from existing sources)
-- =========================================================
CREATE OR REPLACE FUNCTION public.ai_generate_timeline(_target UUID DEFAULT NULL, _limit INTEGER DEFAULT 200)
RETURNS INTEGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE
  v_uid UUID := COALESCE(_target, auth.uid());
  v_count INTEGER := 0;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF v_uid <> auth.uid() AND NOT public.has_role(auth.uid(),'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;

  INSERT INTO public.ai_events_timeline(user_id, event_type, event_category, reference_table, reference_id,
                                        amount, currency, summary, payload, occurred_at)
  SELECT v_uid, e.event::text, 'investment', 'investment_lifecycle_events', e.id,
         e.amount, e.currency,
         concat(e.event::text,' ', COALESCE(e.currency,'USD')),
         COALESCE(e.metadata,'{}'::jsonb), e.created_at
    FROM public.investment_lifecycle_events e
   WHERE e.user_id = v_uid
   ORDER BY e.created_at DESC LIMIT _limit
  ON CONFLICT DO NOTHING;
  GET DIAGNOSTICS v_count = ROW_COUNT;

  INSERT INTO public.ai_events_timeline(user_id, event_type, event_category, reference_table, reference_id,
                                        amount, currency, summary, payload, occurred_at)
  SELECT v_uid, l.event::text, 'ledger', 'ledger_entries', l.id,
         l.amount, l.currency,
         concat(l.event::text,' ', l.account::text),
         COALESCE(l.metadata,'{}'::jsonb), l.created_at
    FROM public.ledger_entries l
   WHERE l.user_id = v_uid AND l.direction = 1
   ORDER BY l.created_at DESC LIMIT _limit
  ON CONFLICT DO NOTHING;

  PERFORM public.ai_log_query('generate_timeline', v_uid, 'ai_generate_timeline',
                              jsonb_build_object('inserted', v_count));
  RETURN v_count;
END $$;
REVOKE ALL ON FUNCTION public.ai_generate_timeline(UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.ai_generate_timeline(UUID, INTEGER) TO authenticated;
