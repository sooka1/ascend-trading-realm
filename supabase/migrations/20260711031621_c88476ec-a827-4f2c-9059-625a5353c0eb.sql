
CREATE TABLE public.competition_trades (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  competition_id text NOT NULL,
  code text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  lots numeric NOT NULL CHECK (lots > 0),
  entry numeric NOT NULL,
  exit numeric,
  pnl numeric,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX competition_trades_user_comp_idx
  ON public.competition_trades (user_id, competition_id, status, opened_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.competition_trades TO authenticated;
GRANT ALL ON public.competition_trades TO service_role;

ALTER TABLE public.competition_trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own trades"
  ON public.competition_trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own trades"
  ON public.competition_trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own trades"
  ON public.competition_trades FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own trades"
  ON public.competition_trades FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER update_competition_trades_updated_at
  BEFORE UPDATE ON public.competition_trades
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
