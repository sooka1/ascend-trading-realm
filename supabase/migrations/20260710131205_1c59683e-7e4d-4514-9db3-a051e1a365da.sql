
-- Messages: read = owner or super_admin
DROP POLICY IF EXISTS "Owner or super admin read messages" ON public.ticket_messages;
CREATE POLICY "Owner or super admin read messages" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id
        AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Messages: insert rules
--  * Clients: only their own ticket, only non-staff messages, sender_id = self
--  * Super admin: any ticket, may set is_staff true or false, sender_id = self
DROP POLICY IF EXISTS "Owner or super admin send message" ON public.ticket_messages;
CREATE POLICY "Client sends own non-staff message" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND is_staff = false
    AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id AND t.user_id = auth.uid()
    )
  );
CREATE POLICY "Super admin sends any message" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.has_role(auth.uid(), 'super_admin')
  );

-- Block updates/deletes on messages (chat is immutable)
DROP POLICY IF EXISTS "No updates on messages" ON public.ticket_messages;
DROP POLICY IF EXISTS "No deletes on messages" ON public.ticket_messages;
CREATE POLICY "No updates on messages" ON public.ticket_messages
  FOR UPDATE TO authenticated USING (false) WITH CHECK (false);
CREATE POLICY "No deletes on messages" ON public.ticket_messages
  FOR DELETE TO authenticated USING (false);

-- Tickets: re-assert restrictive access + insert only for self as client
DROP POLICY IF EXISTS "Users create own tickets" ON public.support_tickets;
CREATE POLICY "Users create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
