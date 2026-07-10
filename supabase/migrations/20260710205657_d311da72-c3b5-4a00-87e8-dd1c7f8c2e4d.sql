DO $$
DECLARE
  t text;
  tables text[] := ARRAY['deposits','documents','finance_audit_log','guest_inquiries','investment_requests','messages','notification_broadcasts','notifications','packages','portfolio_snapshots','portfolios','profile_keys','profiles','push_subscriptions','referral_earnings','role_permissions','statements','subscriptions','support_tickets','system_backfill_log','ticket_messages','transactions','user_roles','withdrawals'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Super admin full access" ON public.%I', t);
    EXECUTE format('CREATE POLICY "Super admin full access" ON public.%I AS PERMISSIVE FOR ALL TO authenticated USING (public.has_role(auth.uid(), ''super_admin'')) WITH CHECK (public.has_role(auth.uid(), ''super_admin''))', t);
  END LOOP;
END $$;