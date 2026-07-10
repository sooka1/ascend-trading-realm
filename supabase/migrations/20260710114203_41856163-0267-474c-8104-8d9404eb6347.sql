CREATE OR REPLACE FUNCTION public.email_has_role(_email text, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users u
    JOIN public.user_roles ur ON ur.user_id = u.id
    WHERE lower(u.email) = lower(_email) AND ur.role = _role
  )
$$;

GRANT EXECUTE ON FUNCTION public.email_has_role(text, app_role) TO authenticated;