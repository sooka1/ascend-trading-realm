
CREATE TABLE IF NOT EXISTS public.guest_inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  email text,
  phone text,
  subject text NOT NULL,
  body text NOT NULL,
  status public.ticket_status NOT NULL DEFAULT 'open',
  admin_reply text,
  replied_at timestamptz,
  replied_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.guest_inquiries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.guest_inquiries TO authenticated;
GRANT ALL ON public.guest_inquiries TO service_role;

ALTER TABLE public.guest_inquiries ENABLE ROW LEVEL SECURITY;

-- Anyone (even anonymous visitors) may submit an inquiry
CREATE POLICY "Anyone can submit inquiry" ON public.guest_inquiries
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(coalesce(subject,'')) between 3 and 200
    AND length(coalesce(body,'')) between 5 and 4000
  );

-- Only staff can read inquiries
CREATE POLICY "Staff read inquiries" ON public.guest_inquiries
  FOR SELECT TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]));

-- Only staff can update (reply, change status)
CREATE POLICY "Staff update inquiries" ON public.guest_inquiries
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]));

CREATE INDEX IF NOT EXISTS idx_guest_inquiries_created ON public.guest_inquiries(created_at DESC);

CREATE TRIGGER trg_guest_inquiries_updated_at
  BEFORE UPDATE ON public.guest_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
