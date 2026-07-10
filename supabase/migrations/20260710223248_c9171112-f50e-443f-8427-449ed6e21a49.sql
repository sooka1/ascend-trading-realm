
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
BEGIN
  -- Iterate active subscriptions newest-first, deducting from invested capital.
  FOR sub_row IN
    SELECT s.id, s.amount, s.package_id
    FROM public.subscriptions s
    WHERE s.user_id = NEW.user_id
      AND s.status = 'active'
    ORDER BY s.created_at DESC
    FOR UPDATE
  LOOP
    EXIT WHEN remaining <= 0;
    take := LEAST(remaining, sub_row.amount);
    new_amt := ROUND((sub_row.amount - take)::numeric, 2);
    SELECT p.min_amount INTO min_amt FROM public.packages p WHERE p.id = sub_row.package_id;
    IF new_amt < COALESCE(min_amt, 0) THEN
      UPDATE public.subscriptions
        SET status = 'cancelled', amount = new_amt
        WHERE id = sub_row.id;
      cancelled_count := cancelled_count + 1;
    ELSE
      UPDATE public.subscriptions
        SET amount = new_amt
        WHERE id = sub_row.id;
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

DROP TRIGGER IF EXISTS trg_withdrawals_apply_capital ON public.withdrawals;
CREATE TRIGGER trg_withdrawals_apply_capital
  AFTER INSERT ON public.withdrawals
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_withdrawal_to_capital();
