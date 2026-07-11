
REVOKE EXECUTE ON FUNCTION public.enforce_documents_storage_path_owner() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.enforce_ticket_message_is_staff() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.apply_withdrawal_to_capital() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.reverse_withdrawal_on_delete() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.prevent_duplicate_subscription() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.handle_deposit_referral() FROM anon, PUBLIC;
REVOKE EXECUTE ON FUNCTION public.distribute_weekly_profits() FROM anon, PUBLIC;
