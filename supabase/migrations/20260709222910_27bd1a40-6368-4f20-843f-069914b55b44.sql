
-- ============================================================
-- Phase 2: Investor Portal — Support Tickets + Documents
-- ============================================================

-- Enum for ticket status/priority
DO $$ BEGIN
  CREATE TYPE public.ticket_status AS ENUM ('open','pending','resolved','closed');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE public.ticket_priority AS ENUM ('low','normal','high','urgent');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============ support_tickets ============
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  category text,
  status public.ticket_status NOT NULL DEFAULT 'open',
  priority public.ticket_priority NOT NULL DEFAULT 'normal',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own tickets" ON public.support_tickets
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support','compliance_officer']::app_role[]));

CREATE POLICY "Users create own tickets" ON public.support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own tickets" ON public.support_tickets
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]))
  WITH CHECK (auth.uid() = user_id OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[]));

CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.support_tickets(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.support_tickets(status);

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ ticket_messages ============
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_staff boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read messages of own tickets" ON public.ticket_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.support_tickets t
            WHERE t.id = ticket_id
              AND (t.user_id = auth.uid()
                   OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support','compliance_officer']::app_role[])))
  );

CREATE POLICY "Send message to own ticket" ON public.ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.support_tickets t
                WHERE t.id = ticket_id
                  AND (t.user_id = auth.uid()
                       OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','support']::app_role[])))
  );

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON public.ticket_messages(ticket_id, created_at);

-- ============ documents ============
-- Metadata for files stored in the 'documents' storage bucket.
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  storage_path text NOT NULL UNIQUE,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  category text NOT NULL DEFAULT 'general',
  description text,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own documents" ON public.documents
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer','finance','portfolio_manager']::app_role[]));

CREATE POLICY "Staff insert documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer','finance','portfolio_manager','support']::app_role[]));

CREATE POLICY "Staff update documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer']::app_role[]))
  WITH CHECK (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer']::app_role[]));

CREATE POLICY "Staff delete documents" ON public.documents
  FOR DELETE TO authenticated
  USING (public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer']::app_role[]));

CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);

CREATE TRIGGER trg_documents_updated_at
  BEFORE UPDATE ON public.documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ storage.objects policies for 'documents' bucket ============
-- Bucket itself is created via storage_create_bucket tool call.
-- Path convention: <user_id>/<uuid>-<filename>
CREATE POLICY "documents_read_own"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'documents'
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer','finance','portfolio_manager']::app_role[])
    )
  );

CREATE POLICY "documents_staff_write"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
    AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer','finance','portfolio_manager','support']::app_role[])
  );

CREATE POLICY "documents_staff_update"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer']::app_role[])
  );

CREATE POLICY "documents_staff_delete"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.has_any_role(auth.uid(), ARRAY['admin','super_admin','compliance_officer']::app_role[])
  );
