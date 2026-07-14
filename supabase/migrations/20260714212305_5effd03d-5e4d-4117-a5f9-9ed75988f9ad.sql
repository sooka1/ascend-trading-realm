
ALTER TABLE public.deposits
  ADD COLUMN IF NOT EXISTS unique_amount numeric(18,6),
  ADD COLUMN IF NOT EXISTS network text,
  ADD COLUMN IF NOT EXISTS deposit_address text,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

-- Prevent two pending deposits from having the same unique_amount on the same network
CREATE UNIQUE INDEX IF NOT EXISTS deposits_unique_amount_pending_idx
  ON public.deposits (network, unique_amount)
  WHERE status = 'pending' AND unique_amount IS NOT NULL;

CREATE INDEX IF NOT EXISTS deposits_expires_at_idx
  ON public.deposits (expires_at)
  WHERE status = 'pending';
