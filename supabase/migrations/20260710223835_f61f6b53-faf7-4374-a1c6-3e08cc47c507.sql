
CREATE TABLE IF NOT EXISTS public.withdrawal_audit_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  withdrawal_id   uuid NOT NULL REFERENCES public.withdrawals(id) ON DELETE CASCADE,
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  event           text NOT NULL CHECK (event IN ('deducted', 'cancelled', 'returned_to_wallet')),
  amount_before   numeric(18,2),
  amount_after    numeric(18,2),
  amount_delta    numeric(18,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'USD',
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS withdrawal_audit_log_user_idx       ON public.withdrawal_audit_log(user_id);
CREATE INDEX IF NOT EXISTS withdrawal_audit_log_withdrawal_idx ON public.withdrawal_audit_log(withdrawal_id);
CREATE INDEX IF NOT EXISTS withdrawal_audit_log_created_idx    ON public.withdrawal_audit_log(created_at DESC);

GRANT SELECT ON public.withdrawal_audit_log TO authenticated;
GRANT ALL    ON public.withdrawal_audit_log TO service_role;

ALTER TABLE public.withdrawal_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own audit"
  ON public.withdrawal_audit_log FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Update trigger function to log each event.
CREATE OR REPLACE FUNCTION public.apply_withdrawal_to_capital()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  remaining numeric := NEW.amount;
  sub_row record;
  take numeric;
  new_amt numeric;
  min_amt numeric;
  cancelled_count integer := 0;
  approved_in  numeric;
  pending_out  numeric;
BEGIN
  SELECT COALESCE(SUM(amount), 0) INTO approved_in
    FROM public.deposits WHERE user_id = NEW.user_id AND status = 'approved';
  SELECT COALESCE(SUM(amount), 0) INTO pending_out
    FROM public.withdrawals
    WHERE user_id = NEW.user_id AND status IN ('pending', 'approved', 'completed');

  IF (approved_in - pending_out) < 0 THEN
    RAISE EXCEPTION 'Withdrawal exceeds available balance (available: %, requested: %)',
      approved_in - (pending_out - NEW.amount), NEW.amount
      USING ERRCODE = 'check_violation';
  END IF;

  FOR sub_row IN
    SELECT s.id, s.amount, s.package_id
    FROM public.subscriptions s
    WHERE s.user_id = NEW.user_id AND s.status = 'active'
    ORDER BY s.created_at DESC
    FOR UPDATE
  LOOP
    EXIT WHEN remaining <= 0;
    take := LEAST(remaining, sub_row.amount);
    new_amt := GREATEST(ROUND((sub_row.amount - take)::numeric, 2), 0);
    SELECT p.min_amount INTO min_amt FROM public.packages p WHERE p.id = sub_row.package_id;

    -- Log the deduction from this subscription
    INSERT INTO public.withdrawal_audit_log
      (withdrawal_id, user_id, subscription_id, event, amount_before, amount_after, amount_delta, currency)
    VALUES
      (NEW.id, NEW.user_id, sub_row.id, 'deducted', sub_row.amount, new_amt, take, NEW.currency);

    IF new_amt < COALESCE(min_amt, 0) THEN
      UPDATE public.subscriptions
        SET status = 'cancelled', amount = new_amt
        WHERE id = sub_row.id;
      cancelled_count := cancelled_count + 1;

      -- Log auto-cancellation
      INSERT INTO public.withdrawal_audit_log
        (withdrawal_id, user_id, subscription_id, event, amount_before, amount_after, amount_delta, currency, metadata)
      VALUES
        (NEW.id, NEW.user_id, sub_row.id, 'cancelled', sub_row.amount, new_amt, take, NEW.currency,
         jsonb_build_object('package_min_amount', min_amt, 'reason', 'remaining_below_min'));

      -- Log leftover returned to general wallet
      IF new_amt > 0 THEN
        INSERT INTO public.withdrawal_audit_log
          (withdrawal_id, user_id, subscription_id, event, amount_before, amount_after, amount_delta, currency)
        VALUES
          (NEW.id, NEW.user_id, sub_row.id, 'returned_to_wallet', new_amt, 0, new_amt, NEW.currency);
      END IF;
    ELSE
      UPDATE public.subscriptions SET amount = new_amt WHERE id = sub_row.id;
    END IF;

    remaining := remaining - take;
  END LOOP;

  IF cancelled_count > 0 THEN
    INSERT INTO public.notifications (user_id, title, body)
    VALUES (
      NEW.user_id,
      'تم إيقاف اشتراك بسبب السحب',
      'انخفض رأس المال المتبقي عن الحد الأدنى للباقة — أُعيد الرصيد إلى المحفظة العامة وأُوقفت الأرباح الأسبوعية حتى الاشتراك في باقة مناسبة.'
    );
  END IF;

  RETURN NEW;
END;
$$;
