
-- 1. Profile columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON public.profiles(referred_by);

-- 2. Referral code generator
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  code text;
  tries int := 0;
BEGIN
  LOOP
    code := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = code);
    tries := tries + 1;
    IF tries > 10 THEN
      code := upper(substr(md5(random()::text || clock_timestamp()::text || tries::text), 1, 10));
      EXIT;
    END IF;
  END LOOP;
  RETURN code;
END;
$$;

-- Backfill codes for existing profiles
UPDATE public.profiles SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;

-- 3. Update handle_new_user to set referral_code + resolve referred_by from meta
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  ref_input text;
  ref_owner uuid;
BEGIN
  ref_input := upper(coalesce(NEW.raw_user_meta_data->>'ref_code', ''));
  IF ref_input <> '' THEN
    SELECT id INTO ref_owner FROM public.profiles WHERE referral_code = ref_input LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, email, display_name, avatar_url, referral_code, referred_by)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    public.generate_referral_code(),
    ref_owner
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- 4. Referral earnings table
CREATE TABLE IF NOT EXISTS public.referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_id uuid UNIQUE REFERENCES public.deposits(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  rate numeric NOT NULL DEFAULT 0.10,
  status text NOT NULL DEFAULT 'accrued',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS referral_earnings_referrer_idx ON public.referral_earnings(referrer_id);

GRANT SELECT ON public.referral_earnings TO authenticated;
GRANT ALL ON public.referral_earnings TO service_role;

ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users read own referral earnings" ON public.referral_earnings;
CREATE POLICY "Users read own referral earnings" ON public.referral_earnings
  FOR SELECT TO authenticated
  USING (auth.uid() = referrer_id OR public.has_role(auth.uid(), 'super_admin'));

-- 5. Auto-create earning when deposit is approved
CREATE OR REPLACE FUNCTION public.handle_deposit_referral()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  referrer uuid;
BEGIN
  IF NEW.status = 'approved' AND (TG_OP = 'INSERT' OR OLD.status IS DISTINCT FROM 'approved') THEN
    SELECT referred_by INTO referrer FROM public.profiles WHERE id = NEW.user_id;
    IF referrer IS NOT NULL AND referrer <> NEW.user_id THEN
      INSERT INTO public.referral_earnings (referrer_id, referee_id, deposit_id, amount, currency, rate)
      VALUES (referrer, NEW.user_id, NEW.id, round((NEW.amount * 0.10)::numeric, 2), COALESCE(NEW.currency, 'USD'), 0.10)
      ON CONFLICT (deposit_id) DO NOTHING;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS deposits_referral_earning ON public.deposits;
CREATE TRIGGER deposits_referral_earning
  AFTER INSERT OR UPDATE OF status ON public.deposits
  FOR EACH ROW EXECUTE FUNCTION public.handle_deposit_referral();
