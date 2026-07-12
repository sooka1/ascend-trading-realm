
-- ============ ELIGIBILITY RULES (admin-configurable) ============
CREATE TABLE IF NOT EXISTS public.master_eligibility_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active boolean NOT NULL DEFAULT true,
  min_account_age_days integer NOT NULL DEFAULT 30,
  min_trading_days integer NOT NULL DEFAULT 30,
  min_closed_trades integer NOT NULL DEFAULT 20,
  min_win_rate_pct numeric(5,2) NOT NULL DEFAULT 50,
  max_drawdown_pct numeric(5,2) NOT NULL DEFAULT 30,
  min_monthly_return_pct numeric(6,2) NOT NULL DEFAULT 2,
  min_verification_level text NOT NULL DEFAULT 'kyc_verified',
  min_trust_score integer NOT NULL DEFAULT 60,
  notes text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_eligibility_rules TO authenticated;
GRANT ALL ON public.master_eligibility_rules TO service_role;
ALTER TABLE public.master_eligibility_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eligibility read auth" ON public.master_eligibility_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "eligibility admin write" ON public.master_eligibility_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_eligibility_updated BEFORE UPDATE ON public.master_eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.master_eligibility_rules (is_active) SELECT true
  WHERE NOT EXISTS (SELECT 1 FROM public.master_eligibility_rules);

-- ============ MASTER LEVELS ============
CREATE TABLE IF NOT EXISTS public.master_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  rank integer NOT NULL UNIQUE,
  min_score integer NOT NULL DEFAULT 0,
  min_followers integer NOT NULL DEFAULT 0,
  min_assets_copied numeric(20,2) NOT NULL DEFAULT 0,
  min_performance_pct numeric(6,2) NOT NULL DEFAULT 0,
  min_months_active integer NOT NULL DEFAULT 0,
  badge text,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_levels TO authenticated;
GRANT ALL ON public.master_levels TO service_role;
ALTER TABLE public.master_levels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "levels read auth" ON public.master_levels FOR SELECT TO authenticated USING (true);
CREATE POLICY "levels admin write" ON public.master_levels FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE TRIGGER trg_levels_updated BEFORE UPDATE ON public.master_levels
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.master_levels (code, name, rank, min_score, min_followers, min_assets_copied, min_performance_pct, min_months_active, badge) VALUES
  ('verified',    'Verified Trader',    1,  60,   0,       0, 0, 0, 'verified'),
  ('master',      'Master Trader',      2,  70,  50,   10000, 5, 3, 'master'),
  ('elite',       'Elite Trader',       3,  80, 200,   50000,10, 6, 'elite'),
  ('professional','HKEX Professional',  4,  88, 500,  200000,15,12, 'professional'),
  ('signature',   'Signature Trader',   5,  93,1000, 1000000,20,24, 'signature')
ON CONFLICT (code) DO NOTHING;

-- ============ APPLICATIONS ============
CREATE TABLE IF NOT EXISTS public.master_trader_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('draft','pending','under_review','approved','rejected','more_info_requested','suspended')),
  experience_years integer,
  trading_markets text[] NOT NULL DEFAULT '{}',
  biography text,
  trading_style text,
  preferred_assets text[] NOT NULL DEFAULT '{}',
  avg_holding_time text,
  risk_level text CHECK (risk_level IN ('low','medium','high','very_high') OR risk_level IS NULL),
  strategy_description text,
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  eligibility_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_eligibility_passed boolean,
  admin_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  approved_master_id uuid REFERENCES public.copy_masters(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.master_trader_applications TO authenticated;
GRANT ALL ON public.master_trader_applications TO service_role;
ALTER TABLE public.master_trader_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "apps own read" ON public.master_trader_applications
  FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "apps own insert" ON public.master_trader_applications
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps own update draft" ON public.master_trader_applications
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id AND status IN ('draft','more_info_requested'))
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "apps admin all" ON public.master_trader_applications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_master_apps_user_status ON public.master_trader_applications(user_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_master_apps_status ON public.master_trader_applications(status, created_at DESC);
CREATE TRIGGER trg_master_apps_updated BEFORE UPDATE ON public.master_trader_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ BADGES ============
CREATE TABLE IF NOT EXISTS public.master_verification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  icon text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_verification_badges TO authenticated;
GRANT ALL ON public.master_verification_badges TO service_role;
ALTER TABLE public.master_verification_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges read auth" ON public.master_verification_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "badges admin write" ON public.master_verification_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
INSERT INTO public.master_verification_badges (code, name) VALUES
  ('identity_verified','Identity Verified'),
  ('kyc_verified','KYC Verified'),
  ('master_trader','Master Trader'),
  ('elite_trader','Elite Trader'),
  ('professional_trader','Professional Trader'),
  ('hkex_certified','HKEX Certified'),
  ('ai_recommended','AI Recommended'),
  ('top_performer','Top Performer'),
  ('low_risk','Low Risk'),
  ('high_consistency','High Consistency'),
  ('trending','Trending')
ON CONFLICT (code) DO NOTHING;

-- ============ MASTER PROFILES ============
CREATE TABLE IF NOT EXISTS public.master_trader_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  copy_master_id uuid UNIQUE REFERENCES public.copy_masters(id) ON DELETE SET NULL,
  level_code text REFERENCES public.master_levels(code),
  application_id uuid REFERENCES public.master_trader_applications(id),
  display_name text,
  avatar_url text,
  cover_url text,
  biography text,
  markets text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  trading_style text,
  years_experience integer,
  risk_category text,
  followers_count integer NOT NULL DEFAULT 0,
  subscribers_count integer NOT NULL DEFAULT 0,
  assets_copied numeric(20,2) NOT NULL DEFAULT 0,
  monthly_return_pct numeric(10,4),
  annual_return_pct numeric(10,4),
  average_return_pct numeric(10,4),
  max_drawdown_pct numeric(10,4),
  sharpe_ratio numeric(10,4),
  win_rate_pct numeric(6,2),
  avg_trade_duration_hours numeric(10,2),
  avg_holding_time text,
  portfolio_size numeric(20,2),
  account_age_days integer,
  trading_since date,
  trust_score integer,
  is_featured boolean NOT NULL DEFAULT false,
  is_hidden boolean NOT NULL DEFAULT false,
  is_banned boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','suspended','banned','archived')),
  recent_performance jsonb NOT NULL DEFAULT '[]'::jsonb,
  monthly_stats jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_trader_profiles TO authenticated;
GRANT UPDATE ON public.master_trader_profiles TO authenticated;
GRANT ALL ON public.master_trader_profiles TO service_role;
ALTER TABLE public.master_trader_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master profiles public read" ON public.master_trader_profiles
  FOR SELECT TO authenticated
  USING (is_hidden = false AND is_banned = false AND status = 'active'
         OR auth.uid() = user_id
         OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "master profiles self update editable" ON public.master_trader_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "master profiles admin all" ON public.master_trader_profiles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_master_profiles_level ON public.master_trader_profiles(level_code, is_featured DESC, followers_count DESC);
CREATE INDEX IF NOT EXISTS idx_master_profiles_status ON public.master_trader_profiles(status, is_hidden, is_banned);
CREATE TRIGGER trg_master_profiles_updated BEFORE UPDATE ON public.master_trader_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Prevent non-admins from editing privileged fields on their own profile.
CREATE OR REPLACE FUNCTION public.enforce_master_profile_privileged_fields()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(auth.uid(),'super_admin') THEN RETURN NEW; END IF;
  IF NEW.level_code IS DISTINCT FROM OLD.level_code
    OR NEW.is_featured IS DISTINCT FROM OLD.is_featured
    OR NEW.is_hidden IS DISTINCT FROM OLD.is_hidden
    OR NEW.is_banned IS DISTINCT FROM OLD.is_banned
    OR NEW.status IS DISTINCT FROM OLD.status
    OR NEW.trust_score IS DISTINCT FROM OLD.trust_score
    OR NEW.copy_master_id IS DISTINCT FROM OLD.copy_master_id
    OR NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Not allowed to modify privileged master profile fields' USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.enforce_master_profile_privileged_fields() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_master_profile_privileged
  BEFORE UPDATE ON public.master_trader_profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_master_profile_privileged_fields();

-- ============ BADGE ASSIGNMENTS ============
CREATE TABLE IF NOT EXISTS public.master_trader_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_profile_id uuid NOT NULL REFERENCES public.master_trader_profiles(id) ON DELETE CASCADE,
  badge_code text NOT NULL REFERENCES public.master_verification_badges(code),
  awarded_by uuid REFERENCES auth.users(id),
  awarded_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  UNIQUE (master_profile_id, badge_code)
);
GRANT SELECT ON public.master_trader_badges TO authenticated;
GRANT ALL ON public.master_trader_badges TO service_role;
ALTER TABLE public.master_trader_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master badges read auth" ON public.master_trader_badges FOR SELECT TO authenticated USING (true);
CREATE POLICY "master badges admin write" ON public.master_trader_badges FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_master_badges_profile ON public.master_trader_badges(master_profile_id);

-- ============ AUDIT ============
CREATE TABLE IF NOT EXISTS public.master_trader_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES auth.users(id),
  target_user_id uuid REFERENCES auth.users(id),
  application_id uuid REFERENCES public.master_trader_applications(id),
  master_profile_id uuid REFERENCES public.master_trader_profiles(id),
  event text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.master_trader_audit TO authenticated;
GRANT ALL ON public.master_trader_audit TO service_role;
ALTER TABLE public.master_trader_audit ENABLE ROW LEVEL SECURITY;
CREATE POLICY "master audit self read" ON public.master_trader_audit
  FOR SELECT TO authenticated
  USING (auth.uid() = target_user_id OR auth.uid() = actor_id OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY "master audit admin write" ON public.master_trader_audit
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
CREATE INDEX IF NOT EXISTS idx_master_audit_target ON public.master_trader_audit(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_master_audit_app ON public.master_trader_audit(application_id, created_at DESC);

-- ============ APPLICATION SUBMIT: eligibility snapshot + audit ============
CREATE OR REPLACE FUNCTION public.master_app_on_submit()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  rules record;
  account_age_days integer;
  closed_trades integer;
  passed boolean := true;
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status IN ('pending','under_review'))
     OR (TG_OP = 'UPDATE' AND OLD.status = 'draft' AND NEW.status IN ('pending','under_review')) THEN

    SELECT * INTO rules FROM public.master_eligibility_rules WHERE is_active = true ORDER BY updated_at DESC LIMIT 1;

    SELECT EXTRACT(DAY FROM (now() - u.created_at))::int INTO account_age_days
      FROM auth.users u WHERE u.id = NEW.user_id;
    SELECT COUNT(*)::int INTO closed_trades
      FROM public.copy_master_trades cm
      JOIN public.copy_masters c ON c.id = cm.master_id
      WHERE cm.status='closed';  -- best-effort proxy; refined by admin review

    IF rules.id IS NOT NULL THEN
      IF COALESCE(account_age_days,0) < rules.min_account_age_days THEN passed := false; END IF;
      IF COALESCE(closed_trades,0) < rules.min_closed_trades THEN passed := false; END IF;
    END IF;

    NEW.eligibility_snapshot := jsonb_build_object(
      'checked_at', now(),
      'account_age_days', account_age_days,
      'closed_trades', closed_trades,
      'rules', to_jsonb(rules)
    );
    NEW.auto_eligibility_passed := passed;

    INSERT INTO public.master_trader_audit(actor_id, target_user_id, application_id, event, payload)
    VALUES (NEW.user_id, NEW.user_id, NEW.id, 'application_submitted',
            jsonb_build_object('auto_passed', passed));
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.master_app_on_submit() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER trg_master_app_submit
  BEFORE INSERT OR UPDATE ON public.master_trader_applications
  FOR EACH ROW EXECUTE FUNCTION public.master_app_on_submit();

-- ============ ADMIN ACTIONS RPC ============
CREATE OR REPLACE FUNCTION public.master_application_decide(
  _application_id uuid, _decision text, _notes text DEFAULT NULL, _level_code text DEFAULT 'verified'
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  app record;
  new_master uuid;
  new_profile uuid;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  IF _decision NOT IN ('approve','reject','more_info','suspend') THEN
    RAISE EXCEPTION 'Invalid decision';
  END IF;

  SELECT * INTO app FROM public.master_trader_applications WHERE id = _application_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Application not found'; END IF;

  IF _decision = 'approve' THEN
    -- Create backing copy_masters row (idempotent per user via name uniqueness of profile.user_id)
    IF app.approved_master_id IS NULL THEN
      INSERT INTO public.copy_masters(name, bio, risk_level, min_capital, performance_fee_pct, is_active)
      VALUES (COALESCE((SELECT display_name FROM public.profiles WHERE id = app.user_id), 'Master'),
              app.biography, COALESCE(app.risk_level,'medium'), 100, 20, true)
      RETURNING id INTO new_master;
    ELSE
      new_master := app.approved_master_id;
    END IF;

    INSERT INTO public.master_trader_profiles(user_id, copy_master_id, level_code, application_id,
                                              display_name, biography, markets, trading_style,
                                              avg_holding_time, risk_category, trading_since, status)
    VALUES (app.user_id, new_master, _level_code, app.id,
            (SELECT display_name FROM public.profiles WHERE id = app.user_id),
            app.biography, app.trading_markets, app.trading_style,
            app.avg_holding_time, app.risk_level, current_date, 'active')
    ON CONFLICT (user_id) DO UPDATE SET
      copy_master_id = EXCLUDED.copy_master_id,
      level_code = EXCLUDED.level_code,
      application_id = EXCLUDED.application_id,
      biography = COALESCE(EXCLUDED.biography, master_trader_profiles.biography),
      status = 'active'
    RETURNING id INTO new_profile;

    UPDATE public.master_trader_applications
      SET status='approved', reviewed_by=uid, reviewed_at=now(),
          approved_master_id=new_master, admin_notes=COALESCE(_notes, admin_notes)
      WHERE id = _application_id;

    INSERT INTO public.master_trader_badges(master_profile_id, badge_code, awarded_by)
    VALUES (new_profile, 'kyc_verified', uid) ON CONFLICT DO NOTHING;

    INSERT INTO public.master_trader_audit(actor_id, target_user_id, application_id, master_profile_id, event, payload)
    VALUES (uid, app.user_id, app.id, new_profile, 'application_approved',
            jsonb_build_object('level', _level_code, 'notes', _notes));

    INSERT INTO public.notifications(user_id, title, body)
    VALUES (app.user_id, 'تم قبولك كمتداول رئيسي',
            'تمت الموافقة على طلبك — تفعيل حساب المتداول الرئيسي.');

    RETURN jsonb_build_object('ok', true, 'master_profile_id', new_profile, 'copy_master_id', new_master);
  END IF;

  IF _decision = 'reject' THEN
    UPDATE public.master_trader_applications
      SET status='rejected', reviewed_by=uid, reviewed_at=now(), admin_notes=_notes
      WHERE id = _application_id;
    INSERT INTO public.master_trader_audit(actor_id, target_user_id, application_id, event, payload)
    VALUES (uid, app.user_id, app.id, 'application_rejected', jsonb_build_object('notes',_notes));
    INSERT INTO public.notifications(user_id, title, body)
    VALUES (app.user_id, 'تم رفض طلب المتداول الرئيسي', COALESCE(_notes,'لم يتم قبول الطلب في الوقت الحالي.'));
    RETURN jsonb_build_object('ok', true);
  END IF;

  IF _decision = 'more_info' THEN
    UPDATE public.master_trader_applications
      SET status='more_info_requested', reviewed_by=uid, reviewed_at=now(), admin_notes=_notes
      WHERE id = _application_id;
    INSERT INTO public.master_trader_audit(actor_id, target_user_id, application_id, event, payload)
    VALUES (uid, app.user_id, app.id, 'more_info_requested', jsonb_build_object('notes',_notes));
    INSERT INTO public.notifications(user_id, title, body)
    VALUES (app.user_id, 'مطلوب معلومات إضافية', COALESCE(_notes,'يرجى استكمال بيانات الطلب.'));
    RETURN jsonb_build_object('ok', true);
  END IF;

  IF _decision = 'suspend' THEN
    UPDATE public.master_trader_applications
      SET status='suspended', reviewed_by=uid, reviewed_at=now(), admin_notes=_notes
      WHERE id = _application_id;
    UPDATE public.master_trader_profiles SET status='suspended' WHERE user_id = app.user_id;
    INSERT INTO public.master_trader_audit(actor_id, target_user_id, application_id, event, payload)
    VALUES (uid, app.user_id, app.id, 'suspended', jsonb_build_object('notes',_notes));
    RETURN jsonb_build_object('ok', true);
  END IF;
  RETURN jsonb_build_object('ok', false);
END $$;
REVOKE EXECUTE ON FUNCTION public.master_application_decide(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.master_application_decide(uuid, text, text, text) TO authenticated;

-- Profile lifecycle RPC (upgrade / downgrade / feature / hide / ban / restore)
CREATE OR REPLACE FUNCTION public.master_profile_action(
  _profile_id uuid, _action text, _value text DEFAULT NULL, _notes text DEFAULT NULL
) RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid uuid := auth.uid();
  p record;
BEGIN
  IF NOT public.has_role(uid,'super_admin') THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE='42501';
  END IF;
  SELECT * INTO p FROM public.master_trader_profiles WHERE id = _profile_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Profile not found'; END IF;

  IF _action = 'upgrade' OR _action = 'downgrade' THEN
    UPDATE public.master_trader_profiles SET level_code = _value WHERE id = _profile_id;
  ELSIF _action = 'feature' THEN
    UPDATE public.master_trader_profiles SET is_featured = true WHERE id = _profile_id;
  ELSIF _action = 'unfeature' THEN
    UPDATE public.master_trader_profiles SET is_featured = false WHERE id = _profile_id;
  ELSIF _action = 'hide' THEN
    UPDATE public.master_trader_profiles SET is_hidden = true WHERE id = _profile_id;
  ELSIF _action = 'show' THEN
    UPDATE public.master_trader_profiles SET is_hidden = false WHERE id = _profile_id;
  ELSIF _action = 'suspend' THEN
    UPDATE public.master_trader_profiles SET status='suspended' WHERE id = _profile_id;
  ELSIF _action = 'restore' THEN
    UPDATE public.master_trader_profiles SET status='active', is_banned=false WHERE id = _profile_id;
  ELSIF _action = 'ban' THEN
    UPDATE public.master_trader_profiles SET is_banned=true, status='banned' WHERE id = _profile_id;
  ELSE
    RAISE EXCEPTION 'Unknown action';
  END IF;

  INSERT INTO public.master_trader_audit(actor_id, target_user_id, master_profile_id, event, payload)
  VALUES (uid, p.user_id, p.id, concat('profile_', _action), jsonb_build_object('value',_value,'notes',_notes));
  RETURN jsonb_build_object('ok', true);
END $$;
REVOKE EXECUTE ON FUNCTION public.master_profile_action(uuid, text, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.master_profile_action(uuid, text, text, text) TO authenticated;

-- ============ PUBLIC RANKING VIEW ============
CREATE OR REPLACE VIEW public.v_master_traders_public WITH (security_invoker = on) AS
SELECT
  mp.id, mp.user_id, mp.copy_master_id, mp.level_code, mp.display_name, mp.avatar_url, mp.cover_url,
  mp.biography, mp.markets, mp.languages, mp.trading_style, mp.years_experience, mp.risk_category,
  mp.followers_count, mp.subscribers_count, mp.assets_copied,
  mp.monthly_return_pct, mp.annual_return_pct, mp.average_return_pct, mp.max_drawdown_pct,
  mp.sharpe_ratio, mp.win_rate_pct, mp.avg_trade_duration_hours, mp.avg_holding_time,
  mp.portfolio_size, mp.account_age_days, mp.trading_since, mp.trust_score,
  mp.is_featured, mp.recent_performance, mp.monthly_stats,
  ml.rank AS level_rank, ml.name AS level_name, ml.badge AS level_badge,
  COALESCE((SELECT jsonb_agg(badge_code) FROM public.master_trader_badges b WHERE b.master_profile_id = mp.id), '[]'::jsonb) AS badges
FROM public.master_trader_profiles mp
LEFT JOIN public.master_levels ml ON ml.code = mp.level_code
WHERE mp.status = 'active' AND mp.is_hidden = false AND mp.is_banned = false;
GRANT SELECT ON public.v_master_traders_public TO authenticated;
