
-- 1. Protect sensitive profile columns from self-modification
CREATE OR REPLACE FUNCTION public.prevent_profile_privileged_updates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(auth.uid(), 'super_admin') THEN
    RETURN NEW;
  END IF;
  IF NEW.verification_status IS DISTINCT FROM OLD.verification_status
     OR NEW.verified_at IS DISTINCT FROM OLD.verified_at
     OR NEW.public_key IS DISTINCT FROM OLD.public_key
     OR NEW.referral_code IS DISTINCT FROM OLD.referral_code
     OR NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'Not allowed to modify privileged profile fields'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_profile_privileged_updates ON public.profiles;
CREATE TRIGGER prevent_profile_privileged_updates
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privileged_updates();

-- 2. Revoke anon EXECUTE on privileged SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.enter_competition(text, numeric) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.subscribe_to_master(uuid, numeric) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.close_master_trade(uuid, numeric) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_adjust_balance(uuid, numeric, text) FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_copy_sub() FROM anon, PUBLIC;

GRANT EXECUTE ON FUNCTION public.enter_competition(text, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.subscribe_to_master(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.close_master_trade(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(uuid, numeric, text) TO authenticated;
