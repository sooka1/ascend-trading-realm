CREATE OR REPLACE FUNCTION public.prevent_duplicate_subscription()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = NEW.user_id
      AND package_id = NEW.package_id
      AND amount = NEW.amount
      AND status IN ('active','pending')
      AND created_at > now() - interval '10 seconds'
  ) THEN
    RAISE EXCEPTION 'Duplicate subscription blocked: identical subscription created moments ago'
      USING ERRCODE = 'unique_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_duplicate_subscription ON public.subscriptions;
CREATE TRIGGER trg_prevent_duplicate_subscription
BEFORE INSERT ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.prevent_duplicate_subscription();