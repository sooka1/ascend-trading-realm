REVOKE ALL ON public.auth_resend_attempts FROM PUBLIC;
REVOKE ALL ON public.auth_resend_attempts FROM anon;
REVOKE ALL ON public.auth_resend_attempts FROM authenticated;
REVOKE ALL ON SEQUENCE public.auth_resend_attempts_id_seq FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.auth_resend_attempts_id_seq FROM anon;
REVOKE ALL ON SEQUENCE public.auth_resend_attempts_id_seq FROM authenticated;