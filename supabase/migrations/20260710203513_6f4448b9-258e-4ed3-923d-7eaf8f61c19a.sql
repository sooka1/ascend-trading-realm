CREATE POLICY "users cancel own subs" ON public.subscriptions
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id AND status IN ('cancelled','pending','active'));