
CREATE TABLE public.finance_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_kind TEXT NOT NULL CHECK (request_kind IN ('deposits','withdrawals')),
  request_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX finance_audit_log_request_idx ON public.finance_audit_log (request_kind, request_id);
CREATE INDEX finance_audit_log_target_user_idx ON public.finance_audit_log (target_user_id);
CREATE INDEX finance_audit_log_created_at_idx ON public.finance_audit_log (created_at DESC);

GRANT SELECT, INSERT ON public.finance_audit_log TO authenticated;
GRANT ALL ON public.finance_audit_log TO service_role;

ALTER TABLE public.finance_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view audit log"
  ON public.finance_audit_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert audit log"
  ON public.finance_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND admin_id = auth.uid());
