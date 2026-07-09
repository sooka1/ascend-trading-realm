
CREATE TYPE public.capital_range AS ENUM ('1k_10k','10k_50k','50k_250k','250k_1m','1m_plus');
CREATE TYPE public.risk_preference AS ENUM ('conservative','balanced','aggressive');

CREATE TABLE public.investment_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  country text NOT NULL,
  capital_range public.capital_range NOT NULL,
  risk_preference public.risk_preference NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.investment_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.investment_requests TO authenticated;
GRANT ALL ON public.investment_requests TO service_role;

ALTER TABLE public.investment_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can submit
CREATE POLICY "Anyone can submit investment request"
  ON public.investment_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(full_name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 255
    AND length(country) BETWEEN 1 AND 80
    AND (notes IS NULL OR length(notes) <= 2000)
  );

-- Admins can read/manage
CREATE POLICY "Admins can view requests"
  ON public.investment_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update requests"
  ON public.investment_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete requests"
  ON public.investment_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_investment_requests_updated_at
  BEFORE UPDATE ON public.investment_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
