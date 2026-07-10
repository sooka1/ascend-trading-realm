
CREATE TABLE public.notification_broadcasts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT,
  recipients_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.notification_broadcasts TO authenticated;
GRANT ALL ON public.notification_broadcasts TO service_role;

ALTER TABLE public.notification_broadcasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admins can view broadcasts"
ON public.notification_broadcasts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX idx_notification_broadcasts_created_at
  ON public.notification_broadcasts (created_at DESC);
