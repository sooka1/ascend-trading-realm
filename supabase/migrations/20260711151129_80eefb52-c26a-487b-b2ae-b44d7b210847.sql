ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS tx_hash text;
CREATE INDEX IF NOT EXISTS deposits_tx_hash_idx ON public.deposits (tx_hash);