
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_key text;
ALTER TABLE public.ticket_messages ADD COLUMN IF NOT EXISTS body_admin text;

CREATE OR REPLACE FUNCTION public.get_super_admin_public_key()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.public_key
  FROM public.profiles p
  JOIN public.user_roles ur ON ur.user_id = p.id
  WHERE ur.role = 'super_admin' AND p.public_key IS NOT NULL
  ORDER BY p.created_at ASC
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_ticket_owner_public_key(_ticket_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.public_key
  FROM public.support_tickets t
  JOIN public.profiles p ON p.id = t.user_id
  WHERE t.id = _ticket_id
$$;

REVOKE EXECUTE ON FUNCTION public.get_super_admin_public_key() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_super_admin_public_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) TO authenticated;
