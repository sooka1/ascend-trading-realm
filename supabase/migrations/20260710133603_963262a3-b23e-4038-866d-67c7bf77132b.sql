ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS client_last_read_at timestamptz,
  ADD COLUMN IF NOT EXISTS admin_last_read_at  timestamptz;