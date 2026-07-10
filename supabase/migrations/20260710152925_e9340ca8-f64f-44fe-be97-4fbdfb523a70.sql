
-- 1) Enforce is_staff matches the sender's actual role on ticket_messages.
CREATE OR REPLACE FUNCTION public.enforce_ticket_message_is_staff()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_is_admin boolean;
BEGIN
  sender_is_admin := public.has_role(NEW.sender_id, 'super_admin');
  IF NEW.is_staff = true AND NOT sender_is_admin THEN
    RAISE EXCEPTION 'Only super_admin can send staff messages';
  END IF;
  IF NEW.is_staff = false AND sender_is_admin THEN
    -- Prevent admins from masquerading as clients
    NEW.is_staff := true;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_ticket_message_is_staff ON public.ticket_messages;
CREATE TRIGGER trg_enforce_ticket_message_is_staff
BEFORE INSERT OR UPDATE ON public.ticket_messages
FOR EACH ROW EXECUTE FUNCTION public.enforce_ticket_message_is_staff();

-- 2) Lock down SECURITY DEFINER helpers: revoke from PUBLIC and anon,
--    grant only to authenticated where end-user/RLS access is needed.
REVOKE EXECUTE ON FUNCTION public.email_has_role(text, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_super_admin_public_key() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.email_has_role(text, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_super_admin_public_key() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_ticket_owner_public_key(uuid) TO authenticated;
