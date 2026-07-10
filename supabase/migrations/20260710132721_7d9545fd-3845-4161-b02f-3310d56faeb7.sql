DROP POLICY IF EXISTS "No updates on messages" ON public.ticket_messages;

CREATE POLICY "Client backfills body_admin on own message"
ON public.ticket_messages
FOR UPDATE
TO authenticated
USING (
  sender_id = auth.uid()
  AND is_staff = false
  AND body_admin IS NULL
)
WITH CHECK (
  sender_id = auth.uid()
  AND is_staff = false
  AND body_admin IS NOT NULL
);

CREATE POLICY "No other updates on messages"
ON public.ticket_messages
FOR UPDATE
TO authenticated
USING (false)
WITH CHECK (false);