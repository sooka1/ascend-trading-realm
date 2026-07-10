CREATE TABLE public.subscription_amount_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  amount_before numeric NOT NULL,
  amount_after numeric NOT NULL,
  amount_delta numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.subscription_amount_changes TO authenticated;
GRANT ALL ON public.subscription_amount_changes TO service_role;

ALTER TABLE public.subscription_amount_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own amount changes"
  ON public.subscription_amount_changes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users insert own amount changes"
  ON public.subscription_amount_changes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sub_amount_changes_user ON public.subscription_amount_changes(user_id, created_at DESC);
CREATE INDEX idx_sub_amount_changes_sub ON public.subscription_amount_changes(subscription_id, created_at DESC);