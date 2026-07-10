
-- Tighten support_tickets: owner or super_admin only
DROP POLICY IF EXISTS "Users read own tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users update own tickets" ON public.support_tickets;
CREATE POLICY "Owner or super admin read tickets" ON public.support_tickets
  FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));
CREATE POLICY "Owner or super admin update tickets" ON public.support_tickets
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

-- Tighten ticket_messages
DROP POLICY IF EXISTS "Read messages of own tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Send message to own ticket" ON public.ticket_messages;
CREATE POLICY "Owner or super admin read messages" ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id
        AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );
CREATE POLICY "Owner or super admin send message" ON public.ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid() AND EXISTS (
      SELECT 1 FROM public.support_tickets t
      WHERE t.id = ticket_messages.ticket_id
        AND (t.user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'))
    )
  );

-- Super admin can read profiles (needed to show client names in chat)
CREATE POLICY "Super admin read profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'super_admin'));

-- Enable realtime for tickets so new conversations appear live
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
