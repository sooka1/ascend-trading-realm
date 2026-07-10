
-- 1) New owner-only table for private E2EE keys.
CREATE TABLE IF NOT EXISTS public.profile_keys (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  secret_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profile_keys TO authenticated;
GRANT ALL ON public.profile_keys TO service_role;

ALTER TABLE public.profile_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own secret key"
  ON public.profile_keys FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Owner inserts own secret key"
  ON public.profile_keys FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner updates own secret key"
  ON public.profile_keys FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owner deletes own secret key"
  ON public.profile_keys FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_profile_keys_updated_at
BEFORE UPDATE ON public.profile_keys
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2) Migrate any existing secret_key values, then drop the column.
INSERT INTO public.profile_keys (user_id, secret_key)
SELECT id, secret_key FROM public.profiles WHERE secret_key IS NOT NULL
ON CONFLICT (user_id) DO NOTHING;

ALTER TABLE public.profiles DROP COLUMN IF EXISTS secret_key;

-- 3) Revoke anon/public EXECUTE on the trigger helper (it runs from the trigger itself,
--    no direct caller needs EXECUTE).
REVOKE EXECUTE ON FUNCTION public.enforce_ticket_message_is_staff() FROM PUBLIC, anon, authenticated;
