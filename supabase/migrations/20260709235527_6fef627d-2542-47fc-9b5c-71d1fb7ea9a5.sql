
CREATE TABLE public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role app_role NOT NULL,
  permission text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role, permission)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view role permissions"
  ON public.role_permissions FOR SELECT
  TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin']::app_role[]));

CREATE POLICY "Super admins manage role permissions"
  ON public.role_permissions FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON rp.role = ur.role
    WHERE ur.user_id = _user_id AND rp.permission = _permission
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'super_admin'
  );
$$;

-- Seed sensible defaults
INSERT INTO public.role_permissions (role, permission) VALUES
  ('admin','users.view'),('admin','users.manage'),
  ('admin','finance.view'),('admin','finance.approve'),
  ('admin','subscriptions.view'),('admin','subscriptions.manage'),
  ('admin','audit.view'),('admin','analytics.view'),('admin','monitoring.view'),
  ('portfolio_manager','portfolios.view'),('portfolio_manager','portfolios.manage'),
  ('portfolio_manager','analytics.view'),
  ('compliance_officer','audit.view'),('compliance_officer','users.view'),
  ('compliance_officer','documents.view'),
  ('finance','finance.view'),('finance','finance.approve'),
  ('finance','invoices.view'),('finance','payments.view'),('finance','accounting.view'),
  ('support','support.view'),('support','support.reply'),('support','users.view'),
  ('moderator','support.view'),('moderator','support.reply'),
  ('investor','portfolios.view'),
  ('user','portfolios.view')
ON CONFLICT DO NOTHING;
