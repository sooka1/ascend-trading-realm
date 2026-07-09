
-- Portfolios
CREATE TABLE public.portfolios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('conservative','balanced','growth')),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  inception_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolios TO authenticated;
GRANT ALL ON public.portfolios TO service_role;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own portfolios" ON public.portfolios
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON public.portfolios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Portfolio snapshots
CREATE TABLE public.portfolio_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  as_of_date DATE NOT NULL,
  equity NUMERIC(18,2) NOT NULL,
  pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
  allocation JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (portfolio_id, as_of_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portfolio_snapshots TO authenticated;
GRANT ALL ON public.portfolio_snapshots TO service_role;
ALTER TABLE public.portfolio_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own snapshots" ON public.portfolio_snapshots
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert their own snapshots" ON public.portfolio_snapshots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Transactions
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy','sell')),
  quantity NUMERIC(18,6) NOT NULL,
  price NUMERIC(18,6) NOT NULL,
  pnl NUMERIC(18,2) NOT NULL DEFAULT 0,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Statements
CREATE TABLE public.statements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('monthly','annual','on_demand')),
  period TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.statements TO authenticated;
GRANT ALL ON public.statements TO service_role;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their statements" ON public.statements
  FOR SELECT USING (auth.uid() = user_id);

-- Notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update their notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Messages
CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_role TEXT NOT NULL CHECK (from_role IN ('client','manager')),
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their messages" ON public.messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users send messages as themselves" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = user_id AND from_role = 'client');
