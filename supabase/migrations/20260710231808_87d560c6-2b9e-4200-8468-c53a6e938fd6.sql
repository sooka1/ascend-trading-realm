-- Allow investors to cancel their own PENDING withdrawal requests, and
-- reverse any capital deductions the AFTER INSERT trigger applied.

CREATE POLICY "users delete own pending withdrawals"
  ON public.withdrawals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id AND status = 'pending');

CREATE OR REPLACE FUNCTION public.reverse_withdrawal_on_delete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec record;
BEGIN
  IF OLD.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending withdrawals can be cancelled';
  END IF;

  -- Reverse deductions in reverse chronological order
  FOR rec IN
    SELECT * FROM public.withdrawal_audit_log
    WHERE withdrawal_id = OLD.id
      AND event IN ('deducted', 'cancelled')
    ORDER BY created_at DESC
  LOOP
    IF rec.subscription_id IS NOT NULL THEN
      UPDATE public.subscriptions
        SET amount = amount + rec.amount_delta,
            status = CASE WHEN rec.event = 'cancelled' THEN 'active' ELSE status END
        WHERE id = rec.subscription_id;
    END IF;
  END LOOP;

  DELETE FROM public.withdrawal_audit_log WHERE withdrawal_id = OLD.id;

  INSERT INTO public.notifications (user_id, title, body)
  VALUES (OLD.user_id, 'تم إلغاء طلب السحب',
          concat('تم إلغاء طلب سحب بقيمة $', to_char(OLD.amount, 'FM999999990.00'), ' واستعادة رأس المال.'));

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_withdrawals_reverse_on_delete ON public.withdrawals;
CREATE TRIGGER trg_withdrawals_reverse_on_delete
BEFORE DELETE ON public.withdrawals
FOR EACH ROW EXECUTE FUNCTION public.reverse_withdrawal_on_delete();