CREATE TABLE IF NOT EXISTS public.competition_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id text,
  tier_fee numeric NOT NULL CHECK (tier_fee > 0),
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS competition_entries_user_idx ON public.competition_entries(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_entries TO authenticated;
GRANT ALL ON public.competition_entries TO service_role;
ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own competition entries" ON public.competition_entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create own competition entries" ON public.competition_entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins manage all competition entries" ON public.competition_entries
  FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));
