
ALTER TABLE public.guest_inquiries
  ADD COLUMN IF NOT EXISTS is_read boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_guest_inquiries_is_read ON public.guest_inquiries(is_read);

CREATE POLICY "Staff delete inquiries" ON public.guest_inquiries
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]));
