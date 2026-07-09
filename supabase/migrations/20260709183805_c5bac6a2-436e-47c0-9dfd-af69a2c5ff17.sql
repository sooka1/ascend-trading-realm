
-- Notifications: explicit deny for client INSERT/DELETE (server uses service_role which bypasses RLS)
CREATE POLICY "Deny client insert on notifications"
  ON public.notifications FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client delete on notifications"
  ON public.notifications FOR DELETE TO authenticated, anon
  USING (false);

-- Portfolio snapshots: explicit deny for client UPDATE/DELETE
CREATE POLICY "Deny client update on portfolio_snapshots"
  ON public.portfolio_snapshots FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny client delete on portfolio_snapshots"
  ON public.portfolio_snapshots FOR DELETE TO authenticated, anon
  USING (false);

-- Statements: explicit deny for client INSERT/UPDATE/DELETE
CREATE POLICY "Deny client insert on statements"
  ON public.statements FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client update on statements"
  ON public.statements FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny client delete on statements"
  ON public.statements FOR DELETE TO authenticated, anon
  USING (false);

-- Transactions: explicit deny for client INSERT/UPDATE/DELETE
CREATE POLICY "Deny client insert on transactions"
  ON public.transactions FOR INSERT TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny client update on transactions"
  ON public.transactions FOR UPDATE TO authenticated, anon
  USING (false) WITH CHECK (false);

CREATE POLICY "Deny client delete on transactions"
  ON public.transactions FOR DELETE TO authenticated, anon
  USING (false);
