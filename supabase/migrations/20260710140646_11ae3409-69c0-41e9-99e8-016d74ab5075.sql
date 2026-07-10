
-- Add attachment metadata columns to ticket_messages
ALTER TABLE public.ticket_messages
  ADD COLUMN IF NOT EXISTS attachment_path text,
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_mime text,
  ADD COLUMN IF NOT EXISTS attachment_size bigint;

-- Allow body to be optional when a message is attachment-only
ALTER TABLE public.ticket_messages ALTER COLUMN body DROP NOT NULL;

-- Storage RLS: files live at "<ticket_id>/<filename>". The ticket owner
-- and any super_admin can read/write their ticket's attachments.
CREATE POLICY "Ticket parties can read chat attachments"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-attachments' AND (
      public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id::text = split_part(storage.objects.name, '/', 1)
          AND t.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Ticket parties can upload chat attachments"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'chat-attachments' AND (
      public.has_role(auth.uid(), 'super_admin')
      OR EXISTS (
        SELECT 1 FROM public.support_tickets t
        WHERE t.id::text = split_part(name, '/', 1)
          AND t.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Ticket parties can delete their chat attachments"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'chat-attachments' AND (
      public.has_role(auth.uid(), 'super_admin')
      OR owner = auth.uid()
    )
  );
